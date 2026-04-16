const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/profile
router.put('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Students are not allowed to edit profile' });
    }

    const { name, phone, bio, github, linkedin, website, college, degree, department, graduationYear, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Password change
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name           = name           || user.name;
    user.phone          = phone          ?? user.phone;
    user.bio            = bio            ?? user.bio;
    user.github         = github         ?? user.github;
    user.linkedin       = linkedin       ?? user.linkedin;
    user.website        = website        ?? user.website;
    user.college        = college        ?? user.college;
    user.degree         = degree         ?? user.degree;
    user.department     = department     ?? user.department;
    user.graduationYear = graduationYear ?? user.graduationYear;

    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
