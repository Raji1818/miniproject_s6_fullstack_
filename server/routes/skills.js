const router = require('express').Router();
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// GET /api/skills - get logged-in user's skills
router.get('/', protect, async (req, res) => {
  try {
    res.json(await Skill.find({ userId: req.user.id }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/skills
router.post('/', protect, async (req, res) => {
  try {
    res.status(201).json(await Skill.create({ ...req.body, userId: req.user.id }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/skills/:id
router.put('/:id', protect, async (req, res) => {
  try {
    res.json(await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/skills/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
