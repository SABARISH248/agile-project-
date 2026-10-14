const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacture year is required'],
    },
    vehicleType: {
      type: String,
      enum: ['Flatbed', 'Box Truck', 'Container Lorry', 'Refrigerated', 'Tanker', 'Trailer'],
      required: [true, 'Vehicle type is required'],
    },
    capacityTons: {
      type: Number,
      required: [true, 'Load capacity in tons is required'],
      min: [0.5, 'Capacity must be at least 0.5 tons'],
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'CNG', 'Electric', 'Petrol'],
      default: 'Diesel',
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance'],
      default: 'available',
      index: true,
    },
    insurancePolicyNo: {
      type: String,
      default: '',
    },
    insuranceExpiry: {
      type: Date,
    },
    permitExpiry: {
      type: Date,
    },
    fitnessExpiry: {
      type: Date,
    },
    mileageKm: {
      type: Number,
      default: 0,
    },
    currentFuelLevel: {
      type: Number,
      default: 100, // Percentage
      min: 0,
      max: 100,
    },
    lastServiceDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
