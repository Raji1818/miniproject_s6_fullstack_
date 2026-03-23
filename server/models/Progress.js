const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status:   { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
