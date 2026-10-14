const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['assigned', 'started', 'in_transit', 'reached_destination', 'delivered', 'cancelled'],
      default: 'assigned',
      index: true,
    },
    lifecycle: {
      assignedAt: { type: Date, default: Date.now },
      startedAt: { type: Date },
      inTransitAt: { type: Date },
      reachedDestinationAt: { type: Date },
      deliveredAt: { type: Date },
    },
    currentLocation: {
      name: { type: String, default: 'Warehouse Origin' },
      lat: { type: Number, default: 19.076 },
      lng: { type: Number, default: 72.8777 },
      updatedAt: { type: Date, default: Date.now },
    },
    startOdometer: {
      type: Number,
      default: 0,
    },
    endOdometer: {
      type: Number,
      default: 0,
    },
    proofOfDelivery: {
      recipientName: { type: String, default: '' },
      recipientPhone: { type: String, default: '' },
      notes: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      deliveredAt: { type: Date },
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String, default: '' },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    totalExpenses: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
