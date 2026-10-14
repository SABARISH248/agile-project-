const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc    Get all vehicles with filtering & pagination
// @route   GET /api/vehicles
// @access  Private (Admin, Manager, Driver)
const getVehicles = async (req, res, next) => {
  try {
    const { status, vehicleType, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicleType) query.vehicleType = vehicleType;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available vehicles for trip dispatch
// @route   GET /api/vehicles/available
// @access  Private (Admin, Manager)
const getAvailableVehicles = async (req, res, next) => {
  try {
    const { minCapacity } = req.query;
    const query = { status: 'available' };
    if (minCapacity) {
      query.capacityTons = { $gte: Number(minCapacity) };
    }

    const vehicles = await Vehicle.find(query).sort({ capacityTons: 1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check active trip
    const activeTrip = await Trip.findOne({
      vehicle: vehicle._id,
      status: { $in: ['assigned', 'started', 'in_transit', 'reached_destination'] },
    }).populate('driver booking');

    res.json({
      success: true,
      data: vehicle,
      activeTrip,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin, Manager)
const createVehicle = async (req, res, next) => {
  try {
    const {
      registrationNumber,
      model,
      make,
      year,
      vehicleType,
      capacityTons,
      fuelType,
      insurancePolicyNo,
      insuranceExpiry,
      permitExpiry,
      fitnessExpiry,
      mileageKm,
      notes,
    } = req.body;

    const existing = await Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase().trim(),
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with registration number ${registrationNumber} already exists`,
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber: registrationNumber.toUpperCase().trim(),
      model,
      make,
      year,
      vehicleType,
      capacityTons,
      fuelType: fuelType || 'Diesel',
      insurancePolicyNo,
      insuranceExpiry,
      permitExpiry,
      fitnessExpiry,
      mileageKm: mileageKm || 0,
      notes,
    });

    res.status(201).json({ success: true, message: 'Vehicle added successfully', data: vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin, Manager)
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Vehicle updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Prevent deletion if vehicle is on active trip
    const activeTrip = await Trip.findOne({
      vehicle: vehicle._id,
      status: { $in: ['assigned', 'started', 'in_transit', 'reached_destination'] },
    });

    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle while it is assigned to an active trip',
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle removed from fleet successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
