const Student = require('../models/Student');
const Class = require('../models/Class');
const FeeRecord = require('../models/FeeRecord');

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
const getCurrentWeekOfMonth = () => Math.ceil(new Date().getDate() / 7);

// ── Auto unenroll unpaid students after week 3 ────────────────────
const enforcePaymentDeadlines = async () => {
  try {
    const weekOfMonth = getCurrentWeekOfMonth();
    if (weekOfMonth <= 3) {
      console.log(`📅 Week ${weekOfMonth} — Payment deadline not reached yet`);
      return;
    }

    console.log('🔒 Running payment enforcement check...');
    const month = getCurrentMonth();
    const classes = await Class.find({ status: 'active' });
    let blockedCount = 0;

    for (const cls of classes) {
      const enrolledStudents = [...cls.enrolledStudents];

      for (const studentId of enrolledStudents) {
        // Check current month fee
        const currentFeeRecord = await FeeRecord.findOne({
          studentId,
          classId: cls._id,
          month,
        });

        // Check ALL unpaid months (current + previous)
        const allUnpaid = await FeeRecord.find({
          studentId,
          classId: cls._id,
          status: { $in: ['unpaid', 'overdue'] },
        });

        const isPaid = currentFeeRecord?.status === 'paid';
        const hasAnyUnpaid = allUnpaid.length > 0;

        if (!isPaid || hasAnyUnpaid) {
          // Mark all unpaid fees as overdue
          for (const fee of allUnpaid) {
            if (fee.status === 'unpaid') {
              fee.status = 'overdue';
              await fee.save();
            }
          }

          // Remove from class enrolled students
          await Class.findByIdAndUpdate(cls._id, {
            $pull: { enrolledStudents: studentId },
          });

          // Remove from student enrolled classes
          await Student.findByIdAndUpdate(studentId, {
            $pull: { enrolledClasses: cls._id },
          });

          blockedCount++;
          console.log(`🚫 Unenrolled student ${studentId} from ${cls.name} — ${allUnpaid.length} unpaid months`);
        }
      }
    }

    console.log(`✅ Payment enforcement done: ${blockedCount} students blocked`);
  } catch (err) {
    console.error('Payment enforcement cron error:', err.message);
  }
};

// ── Re-enroll student after payment ──────────────────────────────
// Only re-enroll if ALL outstanding fees for this class are paid
const reEnrollAfterPayment = async (studentId, classId) => {
  try {
    const student = await Student.findById(studentId);
    const cls = await Class.findById(classId);
    if (!student || !cls) return { success: false, reason: 'Student or class not found' };

    // Check ALL outstanding fees for this class
    const outstandingFees = await FeeRecord.find({
      studentId,
      classId,
      status: { $in: ['unpaid', 'overdue'] },
    });

    if (outstandingFees.length > 0) {
      const unpaidMonths = outstandingFees.map(f => f.month).join(', ');
      console.log(`⚠️ Cannot re-enroll: ${outstandingFees.length} unpaid months (${unpaidMonths}) for ${cls.name}`);
      return {
        success: false,
        reason: `Still has unpaid fees for: ${unpaidMonths}`,
        unpaidMonths: outstandingFees.map(f => f.month),
        remainingAmount: outstandingFees.reduce((sum, f) => sum + f.amount, 0),
      };
    }

    // All months paid — re-enroll
    const alreadyEnrolled = cls.enrolledStudents.map(String).includes(String(studentId));
    if (alreadyEnrolled) {
      return { success: true, alreadyEnrolled: true };
    }

    if (cls.enrolledStudents.length >= cls.maxCapacity) {
      console.log(`❌ Cannot re-enroll: ${cls.name} is full`);
      return { success: false, reason: 'Class is full' };
    }

    await Class.findByIdAndUpdate(classId, {
      $addToSet: { enrolledStudents: studentId },
    });

    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledClasses: classId },
    });

    console.log(`✅ Re-enrolled student ${studentId} in ${cls.name} — all fees cleared`);
    return { success: true, reEnrolled: true };
  } catch (err) {
    console.error('Re-enroll error:', err.message);
    return { success: false, reason: err.message };
  }
};

// ── Start cron job ────────────────────────────────────────────────
const startPaymentEnforcementCron = () => {
  try {
    const cron = require('node-cron');

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Daily payment enforcement cron running...');
      await enforcePaymentDeadlines();
    });

    // Run every hour from week 3 onwards
    cron.schedule('0 * * * *', async () => {
      const week = getCurrentWeekOfMonth();
      if (week >= 3) {
        await enforcePaymentDeadlines();
      }
    });

    console.log('✅ Payment enforcement cron job started');
  } catch (err) {
    console.log('⚠️ node-cron not installed. Run: npm install node-cron');
  }
};

module.exports = {
  startPaymentEnforcementCron,
  enforcePaymentDeadlines,
  reEnrollAfterPayment,
};