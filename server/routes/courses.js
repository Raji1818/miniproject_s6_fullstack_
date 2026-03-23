const router = require('express').Router();
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/courses
router.get('/', protect, async (req, res) => {
  try {
    res.json(await Course.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/courses (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Course.create(req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/courses/:id (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/courses/:id (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
