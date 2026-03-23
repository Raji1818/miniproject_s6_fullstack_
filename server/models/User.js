const mongoose = require('mongoose');

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  phone:          { type: String, default: '' },
  bio:            { type: String, default: '' },
  github:         { type: String, default: '' },
  linkedin:       { type: String, default: '' },
  website:        { type: String, default: '' },
  college:        { type: String, default: '' },
  degree:         { type: String, default: '' },
  department:     { type: String, enum: [...departments, ''], default: '' },
  graduationYear: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
