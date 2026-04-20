const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// @GET /api/scan/:admissionNumber  ← teacher, cashier, admin
const scanStudent = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    // Find student by admission number
    const student = await Student.findOne({ admissionNumber })
      .populate('userId', 'name email isActive')
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
      return res.status(404).json({ message: `No student found with admission number ${admissionNumber}` });
    }

    if (!student.userId.isActive) {
      return res.status(403).json({ message: 'Student account is deactivated' });
    }

    if (student.status === 'suspended') {
      return res.status(403).json({
        message: 'Student is suspended',
        student: {
          name: student.userId.name,
          admissionNumber: student.admissionNumber,
          status: student.status,
        }
      });
    }

    // Build class summary with fee status
    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-08"

    const classSummary = await Promise.all(
      student.enrolledClasses.map(async (cls) => {
        // Check if fee paid this month
        const FeeRecord = require('../models/FeeRecord');
        const feeRecord = await FeeRecord.findOne({
          studentId: student._id,
          classId: cls._id,
          month: currentMonth,
        });

        // Get attendance % for this class
        const Attendance = require('../models/Attendance');
        const ClassSession = require('../models/ClassSession');

        const sessions = await ClassSession.find({ classId: cls._id, status: 'completed' });
        const sessionIds = sessions.map(s => s._id);

        const totalSessions = sessionIds.length;
        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionId: { $in: sessionIds },
          status: { $in: ['present', 'late'] },
        });

        const attendancePercentage = totalSessions > 0
          ? Math.round((presentCount / totalSessions) * 100)
          : null;

        return {
          classId: cls._id,
          name: cls.name,
          subject: cls.subject,
          grade: cls.grade,
          hall: cls.hall,
          schedule: cls.schedule,
          monthlyFee: cls.monthlyFee,
          teacher: cls.teacherId?.userId?.name || 'Not assigned',
          feeStatus: feeRecord ? feeRecord.status : 'not_generated',
          feePaidThisMonth: feeRecord?.status === 'paid',
          feeRecordId: feeRecord?._id || null,
          attendancePercentage: attendancePercentage !== null ? `${attendancePercentage}%` : 'No sessions yet',
          attendanceRisk: attendancePercentage !== null && attendancePercentage < 80,
        };
      })
    );

    // Outstanding fees across all classes
    const FeeRecord = require('../models/FeeRecord');
    const outstandingFees = await FeeRecord.find({
      studentId: student._id,
      status: 'unpaid',
    }).populate('classId', 'name subject');

    const totalOutstanding = outstandingFees.reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        name: student.userId.name,
        email: student.userId.email,
        school: student.school,
        grade: student.grade,
        medium: student.medium,
        stream: student.stream,
        status: student.status,
        parent: {
          name: student.parentId?.userId?.name || null,
          email: student.parentId?.userId?.email || null,
          contact: student.parentId?.contactNumber || null,
        },
      },
      enrolledClasses: classSummary,
      outstandingFees: {
        total: totalOutstanding,
        records: outstandingFees.map(f => ({
          feeRecordId: f._id,
          class: f.classId?.name,
          subject: f.classId?.subject,
          amount: f.amount,
          month: f.month,
          dueDate: f.dueDate,
        }))
      },
      scannedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { scanStudent };