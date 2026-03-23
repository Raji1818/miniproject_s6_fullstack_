const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Attendance = require('../models/Attendance');
const { protect, adminOnly } = require('../middleware/auth');

const studentSelect = '-password';

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    res.json(await User.find().select(studentSelect).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/users
router.post('/users', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      phone = '',
      bio = '',
      github = '',
      linkedin = '',
      website = '',
      college = '',
      degree = '',
      department = '',
      graduationYear = '',
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      bio,
      github,
      linkedin,
      website,
      college,
      degree,
      department,
      graduationYear,
    });

    res.status(201).json(await User.findById(user._id).select(studentSelect));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select(studentSelect);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/progress/:userId
router.get('/progress/:userId', protect, adminOnly, async (req, res) => {
  try {
    res.json(await Progress.find({ userId: req.params.userId }).populate('courseId', 'title description duration'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select(studentSelect).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/students/:id/attendance
router.get('/students/:id/attendance', protect, adminOnly, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('name email department');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const records = await Attendance.find({ studentId: req.params.id }).populate('courseId', 'title duration').sort({ date: -1, createdAt: -1 });
    const total = records.length;
    const present = records.filter(record => record.status === 'present').length;
    const late = records.filter(record => record.status === 'late').length;
    const absent = records.filter(record => record.status === 'absent').length;

    res.json({
      student,
      summary: {
        total,
        present,
        late,
        absent,
        percentage: total ? Math.round(((present + late) / total) * 100) : 0,
      },
      records,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/students
router.post('/students', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone = '',
      bio = '',
      github = '',
      linkedin = '',
      website = '',
      college = '',
      degree = '',
      department = '',
      graduationYear = '',
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      phone,
      bio,
      github,
      linkedin,
      website,
      college,
      degree,
      department,
      graduationYear,
    });

    res.status(201).json(await User.findById(student._id).select(studentSelect));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/students/:id
router.put('/students/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const allowedFields = [
      'name',
      'email',
      'phone',
      'bio',
      'github',
      'linkedin',
      'website',
      'college',
      'degree',
      'department',
      'graduationYear',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    }

    if (req.body.email && req.body.email !== student.email) {
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: student._id } });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    }

    if (req.body.password) {
      student.password = await bcrypt.hash(req.body.password, 10);
    }

    await student.save();
    res.json(await User.findById(student._id).select(studentSelect));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
