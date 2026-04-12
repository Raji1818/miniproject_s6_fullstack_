const router = require('express').Router();
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { protect, staffOnly, facultyOnly } = require('../middleware/auth');

// GET /api/schedule?date=YYYY-MM-DD  — student gets own dept schedule, faculty/admin gets all
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id).select('department');
      if (!student?.department) return res.json([]);
      filter.department = student.department;
    }

    const schedules = await Schedule.find(filter)
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/schedule — faculty creates/updates schedule for a date+department
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const { date, department, slots } = req.body;
    if (!date || !department || !slots?.length)
      return res.status(400).json({ message: 'date, department and slots are required' });

    const schedule = await Schedule.findOneAndUpdate(
      { date, department },
      { date, department, slots, createdBy: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('createdBy', 'name');

    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/schedule/:id — faculty deletes a schedule
router.delete('/:id', protect, staffOnly, async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
