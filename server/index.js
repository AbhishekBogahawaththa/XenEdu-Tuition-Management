const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const classRoutes = require('./routes/classRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const scanRoutes = require('./routes/scanRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const courseWorkRoutes = require('./routes/courseWorkRoutes');
const paymentRequestRoutes = require('./routes/paymentRequestRoutes');

const app = express();

connectDB();

// ── Start cron jobs after DB connects ────────────────────────────
setTimeout(() => {
  try {
    const { startPaymentEnforcementCron } = require('./middleware/paymentEnforcer');
    startPaymentEnforcementCron();
  } catch (err) {
    console.log('Cron startup error:', err.message);
  }
}, 3000);

// ── One-time cleanup: delete wrongly generated future fees ────────
setTimeout(async () => {
  try {
    const FeeRecord = require('./models/FeeRecord');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const result = await FeeRecord.deleteMany({
      month: { $gt: currentMonth },
    });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} future fee records`);
    } else {
      console.log('No future fee records found to clean up');
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}, 5000);

// ── CORS — allow all origins ──────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coursework', courseWorkRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);

app.get('/', (req, res) => res.json({ message: 'XenEdu API running ✅' }));

app.use((req, res) => {
  res.status(404).json({ message: 'Route ' + req.originalUrl + ' not found' });
});

// ── Single HTTP server (Railway handles HTTPS) ────────────────────
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`XenEdu server running on port ${PORT}`);
});