const Booking = require('../models/Booking');
const calculateCost = require('../utils/calculateCost');
const Notification = require('../models/Notification');
const { emitToRole } = require('../config/socket');

// @desc    Calculate freight charges prior to booking
// @route   POST /api/bookings/estimate-cost
// @access  Private (Admin, Manager)
const estimateCost = async (req, res, next) => {
  try {
    const { distanceKm, weightTons, cargoType } = req.body;
    if (!distanceKm || !weightTons) {
      return res.status(400).json({ success: false, message: 'Please provide distanceKm and weightTons' });
    }

    const estimate = calculateCost({ distanceKm, weightTons, cargoType });
    res.json({ success: true, data: estimate });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new shipment booking
// @route   POST /api/bookings
// @access  Private (Admin, Manager)
const createBooking = async (req, res, next) => {
  try {
    const {
      customer,
      pickupLocation,
      dropLocation,
      cargoType = 'General Goods',
      weightTons,
      distanceKm,
      preferredVehicleType = 'Any',
      pickupDate,
      expectedDeliveryDate,
      notes,
    } = req.body;

    // Auto-calculate pricing
    const pricing = calculateCost({ distanceKm, weightTons, cargoType });

    // Generate unique booking number
    const count = await Booking.countDocuments();
    const bookingNumber = `TRC-BK-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    const booking = await Booking.create({
      bookingNumber,
      customer,
      pickupLocation,
      dropLocation,
      cargoType,
      weightTons,
      distanceKm,
      preferredVehicleType,
      pickupDate,
      expectedDeliveryDate: expectedDeliveryDate || new Date(new Date(pickupDate).getTime() + 48 * 60 * 60 * 1000),
      basePrice: pricing.basePrice,
      taxRate: pricing.taxRate,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
      status: 'pending',
      notes: notes || '',
      createdBy: req.user._id,
    });

    // Create notification for operational managers
    const notif = await Notification.create({
      role: 'manager',
      title: 'New Shipment Booked',
      message: `Booking ${bookingNumber} from ${pickupLocation.city} to ${dropLocation.city} (${weightTons} Tons) is awaiting assignment.`,
      type: 'booking',
      link: '/bookings',
    });
    emitToRole('manager', 'notification', notif);

    res.status(201).json({
      success: true,
      message: 'Shipment booking created successfully',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings with filtering & search
// @route   GET /api/bookings
// @access  Private (Admin, Manager)
const getBookings = async (req, res, next) => {
  try {
    const { status, cargoType, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (cargoType) query.cargoType = cargoType;
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.companyName': { $regex: search, $options: 'i' } },
        { 'pickupLocation.city': { $regex: search, $options: 'i' } },
        { 'dropLocation.city': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('createdBy', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking details
// @route   PUT /api/bookings/:id
// @access  Private (Admin, Manager)
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['in_transit', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit booking in '${booking.status}' state`,
      });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Booking updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Admin, Manager)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['in_transit', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel shipment that is already in transit or completed',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  estimateCost,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
};
