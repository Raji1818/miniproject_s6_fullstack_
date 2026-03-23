require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Notification = require('./models/Notification');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({});
  await Course.deleteMany({});
  await Notification.deleteMany({});

  const adminPass  = await bcrypt.hash('admin123', 10);
  const facultyPass = await bcrypt.hash('faculty123', 10);
  const studentPass = await bcrypt.hash('student123', 10);

  await User.insertMany([
    { name: 'Admin User',   email: 'admin@demo.com',   password: adminPass,   role: 'admin'   },
    { name: 'Faculty User', email: 'faculty@demo.com', password: facultyPass, role: 'faculty' },
    { name: 'John Student', email: 'student@demo.com', password: studentPass, role: 'student' }
  ]);

  await Course.insertMany([
    { title: 'React Fundamentals',   description: 'Learn React from scratch', duration: '4 weeks' },
    { title: 'Node.js & Express',    description: 'Build REST APIs with Node', duration: '3 weeks' },
    { title: 'MongoDB Essentials',   description: 'Master NoSQL databases',    duration: '2 weeks' },
    { title: 'Full Stack MERN',      description: 'End-to-end MERN projects',  duration: '6 weeks' }
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('  👤 Admin   → email: admin@demo.com    | password: admin123');
  console.log('  👤 Student → email: student@demo.com  | password: student123\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
