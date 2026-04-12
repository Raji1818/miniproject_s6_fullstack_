const mongoose = require('mongoose');

const pointRewardSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  awardedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points:     { type: Number, required: true },
  reason:     { type: String, default: 'Attendance reward' },
  date:       { type: String, required: true }, // "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('PointReward', pointRewardSchema);
