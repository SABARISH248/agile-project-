const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private (Admin, Manager)
const getMaintenanceRecords = async (req, res, next) => {
  try {
    const { vehicleId, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (vehicleId) query.vehicle = vehicleId;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Maintenance.countDocuments(query);
    const records = await Maintenance.find(query)
      .populate('vehicle', 'registrationNumber model make mileageKm status')
      .sort({ serviceDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new maintenance record
// @route   POST /api/maintenance
// @access  Private (Admin, Manager)
const createMaintenanceRecord = async (req, res, next) => {
  try {
    const {
      vehicleId,
      serviceType,
      description,
      cost,
      odometerAtService,
      serviceDate,
      nextServiceDueKm,
      nextServiceDueDate,
      workshopName,
      status = 'completed',
      performedBy,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const record = await Maintenance.create({
      vehicle: vehicle._id,
      serviceType,
      description,
      cost: Number(cost),
      odometerAtService: odometerAtService || vehicle.mileageKm || 0,
      serviceDate: serviceDate || new Date(),
      nextServiceDueKm,
      nextServiceDueDate,
      workshopName: workshopName || '',
      status,
      performedBy: performedBy || 'Certified Fleet Service',
    });

    // Update vehicle service date and status
    vehicle.lastServiceDate = serviceDate || new Date();
    if (status === 'in_progress') {
      vehicle.status = 'maintenance';
    } else if (status === 'completed' && vehicle.status === 'maintenance') {
      vehicle.status = 'available';
    }
    await vehicle.save();

    const populated = await Maintenance.findById(record._id).populate(
      'vehicle',
      'registrationNumber model make mileageKm status'
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance record saved successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (Admin, Manager)
const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const updated = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle');

    if (req.body.status === 'completed') {
      await Vehicle.findByIdAndUpdate(record.vehicle, {
        status: 'available',
      });
    }

    res.json({ success: true, message: 'Maintenance record updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
};
