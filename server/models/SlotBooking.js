const mongoose = require('mongoose');

const slotBookingSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  slot:     { type: String, required: true }, // e.g. "2025-06-10 10:00 AM"
  date:     { type: String, required: true },
  time:     { type: String, required: true },
}, { timestamps: true });

// one booking per student per course
slotBookingSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('SlotBooking', slotBookingSchema);
