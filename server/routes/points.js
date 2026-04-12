const router = require('express').Router();
const PointReward = require('../models/PointReward');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/points/me — student views own points
router.get('/me', protect, async (req, res) => {
  try {
    const rewards = await PointReward.find({ studentId: req.user.id })
      .populate('awardedBy', 'name')
      .sort({ createdAt: -1 });
    const total = rewards.reduce((sum, r) => sum + r.points, 0);
    res.json({ total, rewards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/points/students — faculty views all students' points summary
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email department');
    const rewards = await PointReward.find();

    const result = students.map(s => {
      const pts = rewards.filter(r => String(r.studentId) === String(s._id));
      return {
        studentId: s._id,
        name: s.name,
        email: s.email,
        department: s.department || '',
        total: pts.reduce((sum, r) => sum + r.points, 0),
        count: pts.length,
      };
    });

    res.json(result.sort((a, b) => b.total - a.total));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/points/student/:id — faculty views a specific student's points
router.get('/student/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('name email department');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const rewards = await PointReward.find({ studentId: req.params.id })
      .populate('awardedBy', 'name')
      .sort({ createdAt: -1 });
    const total = rewards.reduce((sum, r) => sum + r.points, 0);
    res.json({ student, total, rewards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/points — faculty awards points to a student
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { studentId, points, reason, date } = req.body;
    const numericPoints = Number(points);
    if (!studentId || !date || !Number.isFinite(numericPoints) || numericPoints === 0)
      return res.status(400).json({ message: 'studentId, points and date are required' });

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const reward = await PointReward.create({
      studentId,
      awardedBy: req.user.id,
      points: numericPoints,
      reason: reason || 'Attendance reward',
      date,
    });

    res.status(201).json(await reward.populate('awardedBy', 'name'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
