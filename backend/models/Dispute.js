const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  raisedBy: { type: String, required: true },
  reason: { type: String, required: true },
  escrowHeld: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'ESCALATED'], default: 'OPEN' },
  resolutionOutcome: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
