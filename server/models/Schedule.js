const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime:   { type: String, required: true }, // e.g. "10:00"
  subject:   { type: String, required: true },
  room:      { type: String, default: '' },
});

const scheduleSchema = new mongoose.Schema({
  date:        { type: String, required: true },           // "YYYY-MM-DD"
  department:  { type: String, required: true },
  slots:       [slotSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

scheduleSchema.index({ date: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
