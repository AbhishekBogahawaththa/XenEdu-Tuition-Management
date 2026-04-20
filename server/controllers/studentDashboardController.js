const Student = require('../models/Student');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');

// @GET /api/student/dashboard  ← student only
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate({
        path: 'enrolledClasses',
        populate: {
          path: 'teacherId',
          populate: { path: 'userId', select: 'name' }
        }
      })
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Fee summary
    const fees = await FeeRecord.find({ studentId: student._id })
      .populate('classId', 'name subject');

    const unpaidFees = fees.filter(f =>
      f.status === 'unpaid' || f.status === 'overdue'
    );
    const totalOutstanding = unpaidFees.reduce((sum, f) => sum + f.amount, 0);

    // Recent payments
    const recentPayments = await Payment.find({
      studentId: student._id,
      status: 'completed',
    })
      .populate('classId', 'name subject')
      .sort({ paidAt: -1 })
      .limit(5);

    // Attendance per class
    const attendanceSummary = await Promise.all(
      student.enrolledClasses.map(async (cls) => {
        const sessions = await ClassSession.find({
          classId: cls._id,
          status: 'completed',
        });

        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessionIds.length;

        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionId: { $in: sessionIds },
          status: { $in: ['present', 'late'] },
        });

        const percentage = totalSessions > 0
          ? Math.round((presentCount / totalSessions) * 100)
          : null;

        return {
          classId: cls._id,
          className: cls.name,
          subject: cls.subject,
          hall: cls.hall,
          teacher: cls.teacherId?.userId?.name || 'Not assigned',
          schedule: cls.schedule,
          monthlyFee: cls.monthlyFee,
          totalSessions,
          presentCount,
          percentage: percentage !== null ? `${percentage}%` : 'No sessions yet',
          atRisk: percentage !== null && percentage < 80,
        };
      })
    );

    res.status(200).json({
      student: {
        name: student.userId.name,
        email: student.userId.email,
        admissionNumber: student.admissionNumber,
        grade: student.grade,
        school: student.school,
        stream: student.stream,
        medium: student.medium,
        status: student.status,
      },
      barcode: student.admissionNumber,
      enrolledClasses: attendanceSummary,
      fees: {
        totalOutstanding,
        unpaidCount: unpaidFees.length,
        unpaidFees: unpaidFees.map(f => ({
          feeRecordId: f._id,
          class: f.classId?.name,
          subject: f.classId?.subject,
          amount: f.amount,
          month: f.month,
          dueDate: f.dueDate,
        })),
      },
      recentPayments: recentPayments.map(p => ({
        receiptNumber: p.receiptNumber,
        class: p.classId?.name,
        amount: p.amount,
        method: p.method,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentDashboard };