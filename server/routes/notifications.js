const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, staffOnly } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    res.json(await Notification.find().sort({ createdAt: -1 }).limit(50));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const author = await User.findById(req.user.id).select('name');

    const notification = await Notification.create({
      title,
      message,
      createdBy: req.user.id,
      createdByName: author?.name || 'Staff User',
      createdByRole: req.user.role,
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
