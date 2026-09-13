const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  labourId: { type: String, required: true },
  labourName: { type: String, required: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  workerPayout: { type: Number, default: 0 },
  platformCommission: { type: Number, default: 0 },
  otp: { type: String, required: true },
  status: {
    type: String,
    enum: ['Matched', 'In Progress', 'Completed', 'Cancelled', 'Disputed'],
    default: 'Matched'
  },
  // Location & Real-Time Tracking fields
  customerLocation: {
    address: { type: String, default: 'Sea Breeze Apts, Bandra West, Mumbai' },
    lat: { type: Number, default: 19.0596 },
    lng: { type: Number, default: 72.8295 },
    landmark: { type: String, default: 'Near Mehboob Studio' },
    instructions: { type: String, default: 'Tower B, Flat 402, Ring bell twice' },
    phone: { type: String, default: '9876543210' }
  },
  labourLocation: {
    address: { type: String, default: 'Linking Road, Khar West, Mumbai' },
    lat: { type: Number, default: 19.0688 },
    lng: { type: Number, default: 72.8340 },
    lastUpdated: { type: Date, default: Date.now },
    speedKmph: { type: Number, default: 22 }
  },
  etaMinutes: { type: Number, default: 12 },
  distanceKm: { type: Number, default: 1.8 },
  trackingStatus: {
    type: String,
    enum: ['Dispatched', 'En Route', 'Near Destination', 'Arrived', 'In Progress', 'Completed'],
    default: 'En Route'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
