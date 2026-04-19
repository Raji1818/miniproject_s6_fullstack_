require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/courses',  require('./routes/courses'));
app.use('/api/skills',   require('./routes/skills'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/faculty',  require('./routes/faculty'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/schedule',      require('./routes/schedule'));
app.use('/api/points',        require('./routes/points'));
app.use('/api/exams',         require('./routes/exams'));
app.use('/api/slots',         require('./routes/slots'));

app.get('/', (req, res) => res.json({ message: 'Student Dev API running' }));

// Connect to MongoDB Atlas FIRST, then start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
