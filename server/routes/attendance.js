const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, staffOnly } = require('../middleware/auth');

const summarizeRecords = (records) => {
  const summary = { total: records.length, present: 0, absent: 0, late: 0, percentage: 0 };

  for (const record of records) {
    if (record.status === 'present') summary.present += 1;
    if (record.status === 'absent') summary.absent += 1;
    if (record.status === 'late') summary.late += 1;
  }

  const attendedCount = summary.present + summary.late;
  summary.percentage = summary.total ? Math.round((attendedCount / summary.total) * 100) : 0;
  return summary;
};

// GET /api/attendance/me
router.get('/me', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id })
      .populate('courseId', 'title duration')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      summary: summarizeRecords(records),
      records,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/overview
router.get('/overview', protect, staffOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email department');
    const records = await Attendance.find();

    const byStudent = new Map();
    for (const student of students) {
      byStudent.set(String(student._id), []);
    }
    for (const record of records) {
      const key = String(record.studentId);
      if (!byStudent.has(key)) byStudent.set(key, []);
      byStudent.get(key).push(record);
    }

    const studentSummaries = students.map((student) => {
      const summary = summarizeRecords(byStudent.get(String(student._id)) || []);
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department || '',
        ...summary,
      };
    });

    const totalRecords = records.length;
    const totalPresent = studentSummaries.reduce((acc, item) => acc + item.present, 0);
    const totalLate = studentSummaries.reduce((acc, item) => acc + item.late, 0);
    const averageAttendance = totalRecords ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 0;
    const atRiskStudents = studentSummaries.filter(student => student.total > 0 && student.percentage < 75);

    res.json({
      totalRecords,
      averageAttendance,
      atRiskCount: atRiskStudents.length,
      studentSummaries,
      atRiskStudents: atRiskStudents.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/students
router.get('/students', protect, staffOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email department');
    const records = await Attendance.find();

    const summaries = students.map((student) => {
      const studentRecords = records.filter(record => String(record.studentId) === String(student._id));
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        department: student.department || '',
        ...summarizeRecords(studentRecords),
      };
    });

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', protect, staffOnly, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, role: 'student' }).select('name email department');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const records = await Attendance.find({ studentId: req.params.studentId })
      .populate('courseId', 'title duration')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      student,
      summary: summarizeRecords(records),
      records,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;
    if (!studentId || !courseId || !date || !status) {
      return res.status(400).json({ message: 'Student, course, date, and status are required' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, courseId, date },
      { studentId, courseId, date, status, markedBy: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('courseId', 'title duration');

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
