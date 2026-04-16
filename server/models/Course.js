const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  duration:    { type: String, required: true },
  videoLink:   { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
