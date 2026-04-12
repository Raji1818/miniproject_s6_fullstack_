const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  createdByRole: { type: String, enum: ['admin', 'faculty'], required: true },
  readBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
