const router = require('express').Router();
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// GET /api/progress
router.get('/', protect, async (req, res) => {
  try {
    res.json(await Progress.find({ userId: req.user.id }).populate('courseId', 'title description'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/progress
router.post('/', protect, async (req, res) => {
  try {
    const existing = await Progress.findOne({ userId: req.user.id, courseId: req.body.courseId });
    if (existing) return res.status(400).json({ message: 'Progress already tracked for this course' });
    res.status(201).json(await Progress.create({ ...req.body, userId: req.user.id }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/progress/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const query = ['admin', 'faculty'].includes(req.user.role)
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const progress = await Progress.findOneAndUpdate(query, { status: req.body.status }, { new: true });

    if (!progress) return res.status(404).json({ message: 'Progress record not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
