const router = require('express').Router();
const Exam = require('../models/Exam');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { department, date } = req.query;
    const filter = {};

    if (date) filter.date = date;

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id).select('department');
      if (!student?.department) return res.json([]);
      filter.department = student.department;
    } else if (department) {
      filter.department = department;
    }

    const exams = await Exam.find(filter)
      .populate('createdBy', 'name')
      .sort({ date: 1, startTime: 1, subject: 1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { subject, subjectCode, department, date, startTime, endTime, venue, seatingArrangement } = req.body;

    if (!subject || !subjectCode || !department || !date || !startTime || !endTime || !venue || !seatingArrangement) {
      return res.status(400).json({ message: 'All exam fields are required' });
    }

    const exam = await Exam.create({
      subject,
      subjectCode,
      department,
      date,
      startTime,
      endTime,
      venue,
      seatingArrangement,
      createdBy: req.user.id,
    });

    const populatedExam = await Exam.findById(exam._id).populate('createdBy', 'name');
    res.status(201).json(populatedExam);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An exam with the same subject code, date, time, and department already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { subject, subjectCode, department, date, startTime, endTime, venue, seatingArrangement } = req.body;

    if (!subject || !subjectCode || !department || !date || !startTime || !endTime || !venue || !seatingArrangement) {
      return res.status(400).json({ message: 'All exam fields are required' });
    }

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        subjectCode,
        department,
        date,
        startTime,
        endTime,
        venue,
        seatingArrangement,
        createdBy: req.user.id,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    res.json(exam);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An exam with the same subject code, date, time, and department already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
