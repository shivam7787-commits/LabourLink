const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['customer', 'labour', 'b2b'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  password: { type: String, required: true },
  city: { type: String, default: 'Mumbai' },
  status: { type: String, enum: ['active', 'pending', 'blocked'], default: 'active' },

  // Customer fields
  address: String,
  totalBookings: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  tier: { type: String, default: 'Bronze' },
  loyaltyPoints: { type: Number, default: 0 },

  // Labour fields
  category: String,
  trade: String,
  experience: String,
  rating: { type: Number, default: 5.0 },
  totalJobs: { type: Number, default: 0 },
  onboardingStage: { type: Number, default: 1 },
  documents: {
    aadhar: { type: Boolean, default: false },
    pan: { type: Boolean, default: false },
    bank: { type: Boolean, default: false },
    photo: { type: Boolean, default: false },
    policeVerification: { type: Boolean, default: false }
  },
  badge: { type: String, default: 'New Worker' },

  // B2B fields
  companyName: String,
  gst: String,
  contactPerson: String,
  totalContracts: { type: Number, default: 0 },
  activeHeadcount: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 100000 },
  monthlyBilling: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index: phone + role must be unique
userSchema.index({ phone: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
