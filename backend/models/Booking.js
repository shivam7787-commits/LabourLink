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
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
