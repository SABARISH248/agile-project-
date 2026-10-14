const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customer: {
      name: { type: String, required: [true, 'Customer name is required'] },
      companyName: { type: String, default: '' },
      email: { type: String, required: [true, 'Customer email is required'] },
      phone: { type: String, required: [true, 'Customer phone is required'] },
    },
    pickupLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 19.076 }, // Default Mumbai / India
        lng: { type: Number, default: 72.8777 },
      },
    },
    dropLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 28.7041 }, // Default Delhi
        lng: { type: Number, default: 77.1025 },
      },
    },
    cargoType: {
      type: String,
      enum: [
        'General Goods',
        'Perishable / Frozen',
        'Hazardous Materials',
        'Machinery & Steel',
        'Automotive',
        'FMCG',
        'Electronics',
        'Chemicals',
      ],
      default: 'General Goods',
    },
    weightTons: {
      type: Number,
      required: [true, 'Cargo weight in metric tons is required'],
      min: [0.1, 'Weight must be at least 0.1 tons'],
    },
    distanceKm: {
      type: Number,
      required: [true, 'Estimated route distance in kilometers is required'],
      min: [1, 'Distance must be at least 1 km'],
    },
    preferredVehicleType: {
      type: String,
      enum: ['Flatbed', 'Box Truck', 'Container Lorry', 'Refrigerated', 'Tanker', 'Trailer', 'Any'],
      default: 'Any',
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup scheduled date is required'],
    },
    expectedDeliveryDate: {
      type: Date,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 18, // 18% standard GST/VAT
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in_transit', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
