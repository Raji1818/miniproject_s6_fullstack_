const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, staffOnly } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const userId = req.user.id;
    res.json(notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.some(id => String(id) === String(userId)),
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all/mark', protect, async (req, res) => {
  try {
    await Notification.updateMany({}, { $addToSet: { readBy: req.user.id } });
    res.json({ success: true });
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
