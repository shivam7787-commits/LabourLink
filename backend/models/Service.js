const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  skillLevel: { type: String, enum: ['Skilled', 'Semi-Skilled', 'Unskilled'], required: true },
  baseHourlyRate: { type: Number, required: true },
  baseDailyRate: { type: Number, required: true },
  icon: { type: String, default: 'tool' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
