const router        = require('express').Router();
const SlotBooking   = require('../models/SlotBooking');
const Progress      = require('../models/Progress');
const { protect, adminOnly } = require('../middleware/auth');

// Available test slots (fixed pool — admin can extend later)
const AVAILABLE_SLOTS = [
  { date: '2025-06-10', time: '09:00 AM' },
  { date: '2025-06-10', time: '11:00 AM' },
  { date: '2025-06-10', time: '02:00 PM' },
  { date: '2025-06-11', time: '09:00 AM' },
  { date: '2025-06-11', time: '11:00 AM' },
  { date: '2025-06-11', time: '02:00 PM' },
  { date: '2025-06-12', time: '09:00 AM' },
  { date: '2025-06-12', time: '11:00 AM' },
  { date: '2025-06-12', time: '02:00 PM' },
  { date: '2025-06-13', time: '10:00 AM' },
  { date: '2025-06-13', time: '01:00 PM' },
  { date: '2025-06-14', time: '10:00 AM' },
  { date: '2025-06-14', time: '03:00 PM' },
];

// GET /api/slots/available  — list all slots
router.get('/available', protect, (req, res) => {
  res.json(AVAILABLE_SLOTS);
});

// GET /api/slots/my  — student's own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await SlotBooking.find({ userId: req.user.id })
      .populate('courseId', 'title duration');
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/slots  — student books a slot
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, date, time } = req.body;

    // must be enrolled and completed
    const prog = await Progress.findOne({ userId: req.user.id, courseId });
    if (!prog)                        return res.status(400).json({ message: 'You are not enrolled in this course.' });
    if (prog.status !== 'completed')  return res.status(400).json({ message: 'Complete the course before booking a test slot.' });

    // already booked?
    const exists = await SlotBooking.findOne({ userId: req.user.id, courseId });
    if (exists) return res.status(400).json({ message: 'You already have a slot booked for this course.' });

    const slot = `${date} ${time}`;
    const booking = await SlotBooking.create({ userId: req.user.id, courseId, slot, date, time });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/slots/:id  — student cancels booking
router.delete('/:id', protect, async (req, res) => {
  try {
    await SlotBooking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Booking cancelled.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/slots/admin/all  — admin sees all bookings
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await SlotBooking.find()
      .populate('userId',   'name email idNumber')
      .populate('courseId', 'title duration')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/slots/admin/:id  — admin removes a booking
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    await SlotBooking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking removed.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
