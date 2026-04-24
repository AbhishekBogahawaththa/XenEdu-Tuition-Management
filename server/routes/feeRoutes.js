const express = require('express');
const router = express.Router();
const {
  generateMonthlyFees,
  payFee,
  getStudentFees,
  getStudentPayments,
  voidPayment,
  getMonthlyReport,
  getOutstandingFees,
  getDateRangeReport,
  getTeacherReport,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/generate', authorize('admin'), generateMonthlyFees);
router.post('/pay', authorize('admin'), payFee);
router.get('/outstanding', authorize('admin'), getOutstandingFees);
router.get('/reports/monthly', authorize('admin'), getMonthlyReport);
router.get('/reports/daterange', authorize('admin'), getDateRangeReport);
router.get('/reports/teacher/:teacherId', authorize('admin'), getTeacherReport);
router.delete('/payments/:id/void', authorize('admin'), voidPayment);
router.get('/payments/student/:studentId', getStudentPayments);

// ← Must be BEFORE /student/:studentId to avoid conflict
router.get('/student', async (req, res) => {
  try {
    const Student = require('../models/Student');
    const FeeRecord = require('../models/FeeRecord');
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const fees = await FeeRecord.find({ studentId: student._id })
      .populate('classId', 'name subject monthlyFee')
      .sort({ month: -1 });
    res.json({ fees });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/student/:studentId', getStudentFees);

module.exports = router;