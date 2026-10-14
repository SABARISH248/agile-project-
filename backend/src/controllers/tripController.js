const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { emitToAll, emitToUser, emitToRole } = require('../config/socket');

// @desc    Assign vehicle & driver and dispatch trip
// @route   POST /api/trips
// @access  Private (Admin, Manager)
const createTrip = async (req, res, next) => {
  try {
    const { bookingId, vehicleId, driverId, startOdometer } = req.body;

    // 1. Verify Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (['in_transit', 'completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is currently in '${booking.status}' status and cannot be assigned a new trip`,
      });
    }

    // 2. Verify Vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (vehicle.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicle.registrationNumber} is not available (Current status: ${vehicle.status})`,
      });
    }
    if (vehicle.capacityTons < booking.weightTons) {
      return res.status(400).json({
        success: false,
        message: `Vehicle capacity (${vehicle.capacityTons} Tons) is insufficient for cargo load (${booking.weightTons} Tons)`,
      });
    }

    // 3. Verify Driver
    const driver = await Driver.findById(driverId).populate('user');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    if (driver.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Driver ${driver.user?.name || driver.licenseNumber} is currently unavailable (Status: ${driver.status})`,
      });
    }

    // Generate Trip Number
    const count = await Trip.countDocuments();
    const tripNumber = `TRC-TRP-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    // Create Trip
    const trip = await Trip.create({
      tripNumber,
      booking: booking._id,
      vehicle: vehicle._id,
      driver: driver._id,
      manager: req.user._id,
      status: 'assigned',
      lifecycle: {
        assignedAt: new Date(),
      },
      currentLocation: {
        name: `${booking.pickupLocation.city} Origin Depot`,
        lat: booking.pickupLocation.coordinates?.lat || 19.076,
        lng: booking.pickupLocation.coordinates?.lng || 72.8777,
        updatedAt: new Date(),
      },
      startOdometer: startOdometer || vehicle.mileageKm || 0,
      timeline: [
        {
          status: 'assigned',
          timestamp: new Date(),
          location: `${booking.pickupLocation.city} Logistics Hub`,
          note: `Trip assigned to ${driver.user?.name || 'Driver'} with vehicle ${vehicle.registrationNumber}`,
          updatedBy: req.user._id,
        },
      ],
    });

    // Update Vehicle and Driver statuses
    vehicle.status = 'assigned';
    await vehicle.save();

    driver.status = 'on_trip';
    driver.assignedVehicle = vehicle._id;
    await driver.save();

    booking.status = 'assigned';
    await booking.save();

    // Auto-generate invoice if not exists
    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `TRC-INV-${new Date().getFullYear()}-${String(invCount + 101).padStart(4, '0')}`;
    
    await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      trip: trip._id,
      customer: {
        name: booking.customer.name,
        companyName: booking.customer.companyName,
        email: booking.customer.email,
        phone: booking.customer.phone,
        address: `${booking.pickupLocation.address}, ${booking.pickupLocation.city}`,
      },
      lineItems: [
        {
          description: `Freight Transport: ${booking.pickupLocation.city} to ${booking.dropLocation.city} (${booking.distanceKm} km, ${booking.weightTons} Tons, ${booking.cargoType})`,
          quantity: 1,
          unitPrice: booking.basePrice,
          total: booking.basePrice,
        },
      ],
      subtotal: booking.basePrice,
      taxRate: booking.taxRate,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      balanceDue: booking.totalAmount,
      paymentStatus: 'pending',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    // Notify Driver
    if (driver.user?._id) {
      const notif = await Notification.create({
        recipient: driver.user._id,
        role: 'driver',
        title: 'New Trip Assigned',
        message: `You have been assigned trip ${tripNumber} from ${booking.pickupLocation.city} to ${booking.dropLocation.city}.`,
        type: 'trip',
        link: '/driver-dashboard',
      });
      emitToUser(driver.user._id.toString(), 'notification', notif);
    }

    emitToAll('trip_created', trip);

    const populatedTrip = await Trip.findById(trip._id)
      .populate('booking')
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } });

    res.status(201).json({
      success: true,
      message: 'Trip dispatched and assigned successfully',
      data: populatedTrip,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all trips with filtering
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res, next) => {
  try {
    const { status, vehicleId, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;

    // If driver is requesting, only return their trips
    if (req.user.role === 'driver') {
      const driverRecord = await Driver.findOne({ user: req.user._id });
      if (driverRecord) {
        query.driver = driverRecord._id;
      }
    }

    if (search) {
      query.tripNumber = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate('booking')
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate('manager', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: trips,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single trip by ID with timeline & details
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('booking')
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate('manager', 'name email')
      .populate('timeline.updatedBy', 'name role');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

// @desc    Update trip status (Lifecycle transitions)
// @route   PATCH /api/trips/:id/status
// @access  Private (Driver, Manager, Admin)
const updateTripStatus = async (req, res, next) => {
  try {
    const { status, note, location, endOdometer, proofOfDelivery } = req.body;
    const allowed = ['assigned', 'started', 'in_transit', 'reached_destination', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid trip status. Allowed: ${allowed.join(', ')}` });
    }

    const trip = await Trip.findById(req.params.id).populate('booking vehicle driver');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Role check: Driver can only update their own assigned trips
    if (req.user.role === 'driver') {
      const driverRecord = await Driver.findOne({ user: req.user._id });
      if (!driverRecord || trip.driver._id.toString() !== driverRecord._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update trips assigned to you' });
      }
    }

    trip.status = status;

    // Update stage lifecycle timestamps
    const now = new Date();
    if (status === 'started' && !trip.lifecycle.startedAt) trip.lifecycle.startedAt = now;
    if (status === 'in_transit' && !trip.lifecycle.inTransitAt) trip.lifecycle.inTransitAt = now;
    if (status === 'reached_destination' && !trip.lifecycle.reachedDestinationAt) trip.lifecycle.reachedDestinationAt = now;
    if (status === 'delivered') {
      trip.lifecycle.deliveredAt = now;
      if (endOdometer) trip.endOdometer = Number(endOdometer);
      if (proofOfDelivery) {
        trip.proofOfDelivery = {
          ...trip.proofOfDelivery,
          ...proofOfDelivery,
          deliveredAt: now,
        };
      }

      // Restore vehicle and driver to available status!
      await Vehicle.findByIdAndUpdate(trip.vehicle._id, {
        status: 'available',
        mileageKm: endOdometer || trip.vehicle.mileageKm,
      });

      await Driver.findByIdAndUpdate(trip.driver._id, {
        status: 'available',
        $inc: { completedTrips: 1 },
      });

      // Update booking status
      await Booking.findByIdAndUpdate(trip.booking._id, {
        status: 'completed',
      });
    }

    // Update location coordinate if provided
    if (location) {
      trip.currentLocation = {
        name: location.name || trip.currentLocation.name,
        lat: location.lat || trip.currentLocation.lat,
        lng: location.lng || trip.currentLocation.lng,
        updatedAt: now,
      };
    }

    // Add to timeline
    trip.timeline.push({
      status,
      timestamp: now,
      location: location?.name || trip.currentLocation.name || 'En Route',
      note: note || `Trip transitioned to ${status}`,
      updatedBy: req.user._id,
    });

    await trip.save();

    // Broadcast real-time update
    emitToAll('trip_updated', trip);

    res.json({
      success: true,
      message: `Trip status successfully updated to '${status}'`,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update live coordinates for GPS tracking
// @route   PATCH /api/trips/:id/location
// @access  Private (Driver, Manager, Admin)
const updateTripLocation = async (req, res, next) => {
  try {
    const { lat, lng, name } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.currentLocation = {
      name: name || trip.currentLocation.name,
      lat: Number(lat),
      lng: Number(lng),
      updatedAt: new Date(),
    };

    await trip.save();
    emitToAll('trip_location_updated', { tripId: trip._id, location: trip.currentLocation });

    res.json({ success: true, data: trip.currentLocation });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Proof of Delivery document / photo
// @route   POST /api/trips/:id/proof
// @access  Private (Driver, Manager)
const uploadProofOfDelivery = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a proof of delivery image or file' });
    }

    const { recipientName, recipientPhone, notes } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    trip.proofOfDelivery = {
      recipientName: recipientName || trip.proofOfDelivery?.recipientName || 'Received',
      recipientPhone: recipientPhone || trip.proofOfDelivery?.recipientPhone || '',
      notes: notes || trip.proofOfDelivery?.notes || 'Delivered with signed confirmation',
      imageUrl: fileUrl,
      deliveredAt: new Date(),
    };

    await trip.save();

    res.json({
      success: true,
      message: 'Proof of Delivery uploaded successfully',
      data: trip.proofOfDelivery,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTripStatus,
  updateTripLocation,
  uploadProofOfDelivery,
};
