const Driver = require('../models/Driver');
const User = require('../models/User');
const Trip = require('../models/Trip');

// @desc    Get all drivers with filtering & search
// @route   GET /api/drivers
// @access  Private (Admin, Manager)
const getDrivers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    let drivers = await Driver.find(query)
      .populate('user', 'name email phone avatar isActive')
      .populate('assignedVehicle', 'registrationNumber model make vehicleType capacityTons')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      drivers = drivers.filter(
        (d) =>
          d.licenseNumber.match(searchRegex) ||
          (d.user && (d.user.name.match(searchRegex) || d.user.email.match(searchRegex)))
      );
    }

    const total = await Driver.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: drivers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available drivers for trip assignment
// @route   GET /api/drivers/available
// @access  Private (Admin, Manager)
const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ status: 'available' })
      .populate('user', 'name email phone avatar')
      .populate('assignedVehicle', 'registrationNumber model capacityTons');

    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single driver details with active trip
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive')
      .populate('assignedVehicle');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Check active trip
    const activeTrip = await Trip.findOne({
      driver: driver._id,
      status: { $in: ['assigned', 'started', 'in_transit', 'reached_destination'] },
    }).populate('booking vehicle');

    // Recent trips history
    const recentTrips = await Trip.find({ driver: driver._id })
      .populate('booking', 'bookingNumber cargoType pickupLocation dropLocation')
      .populate('vehicle', 'registrationNumber model')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: driver,
      activeTrip,
      recentTrips,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new driver and linked user account
// @route   POST /api/drivers
// @access  Private (Admin, Manager)
const createDriver = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'driver123',
      phone,
      licenseNumber,
      licenseExpiry,
      experienceYears,
      assignedVehicle,
      bloodGroup,
      address,
      emergencyContact,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const existingLicense = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase().trim() });
    if (existingLicense) {
      return res.status(400).json({ success: false, message: 'A driver with this license number already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'driver',
      phone,
    });

    const driver = await Driver.create({
      user: user._id,
      licenseNumber: licenseNumber.toUpperCase().trim(),
      licenseExpiry,
      experienceYears: experienceYears || 1,
      assignedVehicle: assignedVehicle || null,
      bloodGroup: bloodGroup || '',
      address: address || '',
      emergencyContact: emergencyContact || {},
    });

    const populated = await Driver.findById(driver._id)
      .populate('user', 'name email phone avatar')
      .populate('assignedVehicle', 'registrationNumber model');

    res.status(201).json({
      success: true,
      message: 'Driver profile created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update driver profile
// @route   PUT /api/drivers/:id
// @access  Private (Admin, Manager)
const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const {
      name,
      phone,
      licenseNumber,
      licenseExpiry,
      experienceYears,
      assignedVehicle,
      status,
      bloodGroup,
      address,
      emergencyContact,
    } = req.body;

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(driver.user, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      });
    }

    if (licenseNumber) driver.licenseNumber = licenseNumber.toUpperCase().trim();
    if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
    if (experienceYears !== undefined) driver.experienceYears = experienceYears;
    if (assignedVehicle !== undefined) driver.assignedVehicle = assignedVehicle || null;
    if (status) driver.status = status;
    if (bloodGroup !== undefined) driver.bloodGroup = bloodGroup;
    if (address !== undefined) driver.address = address;
    if (emergencyContact !== undefined) driver.emergencyContact = emergencyContact;

    await driver.save();

    const updated = await Driver.findById(driver._id)
      .populate('user', 'name email phone avatar')
      .populate('assignedVehicle', 'registrationNumber model');

    res.json({ success: true, message: 'Driver updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete driver profile
// @route   DELETE /api/drivers/:id
// @access  Private (Admin)
const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const activeTrip = await Trip.findOne({
      driver: driver._id,
      status: { $in: ['assigned', 'started', 'in_transit', 'reached_destination'] },
    });

    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver while assigned to an active trip',
      });
    }

    await User.findByIdAndDelete(driver.user);
    await Driver.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
