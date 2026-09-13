const mongoose = require('mongoose');

const escrowTransactionSchema = new mongoose.Schema({
  txnId: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  total: { type: Number, required: true },
  commission: { type: Number, required: true },
  payout: { type: Number, required: true },
  state: {
    type: String,
    enum: ['Locked in Escrow', 'Disbursed to Worker', 'Refunded to Customer', 'Disputed'],
    default: 'Locked in Escrow'
  }
}, { timestamps: true });

module.exports = mongoose.model('EscrowTransaction', escrowTransactionSchema);
