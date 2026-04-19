const mongoose = require('mongoose');

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];

const examSchema = new mongoose.Schema({
  subject:            { type: String, required: true, trim: true },
  subjectCode:        { type: String, required: true, trim: true, uppercase: true },
  department:         { type: String, enum: departments, required: true },
  date:               { type: String, required: true },
  startTime:          { type: String, required: true },
  endTime:            { type: String, required: true },
  venue:              { type: String, required: true, trim: true },
  seatingArrangement: { type: String, required: true, trim: true },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

examSchema.index({ department: 1, date: 1, startTime: 1, subjectCode: 1 }, { unique: true });

module.exports = mongoose.model('Exam', examSchema);
