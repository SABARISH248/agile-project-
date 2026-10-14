const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: [
        'Oil Change',
        'Brake Inspection',
        'Tire Replacement',
        'Engine Overhaul',
        'Battery Service',
        'Scheduled Inspection',
        'Emergency Repair',
        'Suspension & Steering',
        'General Tune-up',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    odometerAtService: {
      type: Number,
      default: 0,
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    nextServiceDueKm: {
      type: Number,
    },
    nextServiceDueDate: {
      type: Date,
    },
    workshopName: {
      type: String,
      default: '',
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'completed',
    },
    performedBy: {
      type: String,
      default: 'Tracely Fleet Maintenance Workshop',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
