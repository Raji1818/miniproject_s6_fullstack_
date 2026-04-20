const router = require('express').Router();
const SlotBooking = require('../models/SlotBooking');
const Progress = require('../models/Progress');
const { protect, adminOnly, rolesAllowed } = require('../middleware/auth');

const SLOT_TIMES = ['09:00 AM', '11:00 AM', '02:00 PM'];
const OPEN_DAYS = 14;

const toDateKey = (date) => date.toISOString().slice(0, 10);

const buildAvailableSlots = () => {
  const slots = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (slots.length < OPEN_DAYS * SLOT_TIMES.length) {
    if (cursor.getDay() !== 0) {
      const date = toDateKey(cursor);
      SLOT_TIMES.forEach((time) => slots.push({ date, time }));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
};

const getOpenSlots = async () => {
  const availableSlots = buildAvailableSlots();
  const dates = [...new Set(availableSlots.map((slot) => slot.date))];
  const bookings = await SlotBooking.find({ date: { $in: dates } }).select('date time -_id');
  const bookedSlots = new Set(bookings.map((booking) => `${booking.date}|${booking.time}`));

  return availableSlots.filter((slot) => !bookedSlots.has(`${slot.date}|${slot.time}`));
};

// GET /api/slots/available - list upcoming open slots for students
router.get('/available', protect, rolesAllowed('student'), async (req, res) => {
  try {
    const slots = await getOpenSlots();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/slots/my - student's own bookings
router.get('/my', protect, rolesAllowed('student'), async (req, res) => {
  try {
    const bookings = await SlotBooking.find({ userId: req.user.id })
      .populate('courseId', 'title duration')
      .sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/slots - student books a slot
router.post('/', protect, rolesAllowed('student'), async (req, res) => {
  try {
    const { courseId, date, time } = req.body;

    if (!courseId || !date || !time) {
      return res.status(400).json({ message: 'courseId, date and time are required.' });
    }

    const prog = await Progress.findOne({ userId: req.user.id, courseId });
    if (!prog) return res.status(400).json({ message: 'You are not enrolled in this course.' });
    if (prog.status !== 'completed') {
      return res.status(400).json({ message: 'Complete the course before booking a test slot.' });
    }

    const existingBooking = await SlotBooking.findOne({ userId: req.user.id, courseId });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a slot booked for this course.' });
    }

    const openSlots = await getOpenSlots();
    const isOpenSlot = openSlots.some((slot) => slot.date === date && slot.time === time);
    if (!isOpenSlot) {
      return res.status(400).json({ message: 'That slot is no longer available. Please choose another one.' });
    }

    const slot = `${date} ${time}`;
    const booking = await SlotBooking.create({ userId: req.user.id, courseId, slot, date, time });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/slots/:id - student cancels booking
router.delete('/:id', protect, rolesAllowed('student'), async (req, res) => {
  try {
    await SlotBooking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Booking cancelled.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/slots/admin/all - admin sees all bookings
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await SlotBooking.find()
      .populate('userId', 'name email idNumber')
      .populate('courseId', 'title duration')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/slots/admin/:id - admin removes a booking
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    await SlotBooking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
