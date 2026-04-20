const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// @POST /api/classes  ← admin only
const createClass = async (req, res) => {
  try {
    const {
      name, subject, grade, medium,
      teacherId, hall, schedule,
      monthlyFee, minCapacity, maxCapacity,
      description, startDate, endDate,
    } = req.body;

    // Check hall conflict
    if (hall && schedule?.dayOfWeek) {
      const conflict = await Class.findOne({
        hall,
        'schedule.dayOfWeek': schedule.dayOfWeek,
        status: 'active',
      });

      if (conflict) {
        const existStart = parseInt(conflict.schedule.startTime.replace(':', ''));
        const newStart = parseInt(schedule.startTime.replace(':', ''));
        const existEnd = existStart + Math.floor(conflict.schedule.durationMins / 60) * 100
          + (conflict.schedule.durationMins % 60);

        if (newStart >= existStart && newStart < existEnd) {
          return res.status(400).json({
            message: `Hall ${hall} is already booked on ${schedule.dayOfWeek} at that time (${conflict.name})`
          });
        }
      }
    }

    const newClass = await Class.create({
      name, subject, grade, medium,
      teacherId, hall, schedule,
      monthlyFee, minCapacity, maxCapacity,
      description,
      startDate: startDate || new Date(),
      endDate: endDate || null,
    });

    // Link class to teacher
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $push: { assignedClasses: newClass._id }
      });
    }

    // Auto-generate sessions for current and next month
    let sessionsGenerated = 0;
    try {
      const { generateOnClassCreate } = require('./sessionController');
      sessionsGenerated = await generateOnClassCreate(newClass._id);
      console.log(`✅ Auto-generated ${sessionsGenerated} sessions for "${name}"`);
    } catch (err) {
      console.log('⚠️ Session auto-generation failed:', err.message);
    }

    const populated = await Class.findById(newClass._id)
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } });

    res.status(201).json({
      message: 'Class created successfully',
      sessionsGenerated,
      class: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/classes  ← all roles
const getClasses = async (req, res) => {
  try {
    const { subject, grade, medium, status } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (medium) filter.medium = medium;
    if (status) filter.status = status;
    else filter.status = 'active';

    // Teachers only see their own classes
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (teacher) filter.teacherId = teacher._id;
    }

    const classes = await Class.find(filter)
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: classes.length,
      classes: classes.map(cls => ({
        ...cls.toObject(),
        enrolledCount: cls.enrolledStudents?.length || 0,
        availableSlots: cls.maxCapacity - (cls.enrolledStudents?.length || 0),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/classes/:id
const getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'enrolledStudents', populate: { path: 'userId', select: 'name email' } });

    if (!cls) return res.status(404).json({ message: 'Class not found' });

    res.status(200).json({ class: cls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/classes/:id  ← admin only
const updateClass = async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } });

    if (!updated) return res.status(404).json({ message: 'Class not found' });

    res.status(200).json({ message: 'Class updated successfully', class: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/classes/:id  ← admin only
const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (cls.enrolledStudents.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete class with enrolled students. Remove students first.'
      });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/classes/:id/enroll  ← student only
const enrollStudent = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (cls.status !== 'active') {
      return res.status(400).json({ message: 'Class is not active' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    if (cls.enrolledStudents.map(id => id.toString()).includes(student._id.toString())) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    if (cls.enrolledStudents.length >= cls.maxCapacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    cls.enrolledStudents.push(student._id);
    await cls.save();

    student.enrolledClasses.push(cls._id);
    await student.save();

    res.status(200).json({
      message: `Successfully enrolled in ${cls.name}`,
      class: {
        name: cls.name,
        subject: cls.subject,
        hall: cls.hall,
        schedule: cls.schedule,
        monthlyFee: cls.monthlyFee,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/classes/:id/unenroll  ← student only
const unenrollStudent = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    if (!cls.enrolledStudents.map(id => id.toString()).includes(student._id.toString())) {
      return res.status(400).json({ message: 'Not enrolled in this class' });
    }

    cls.enrolledStudents.pull(student._id);
    await cls.save();

    student.enrolledClasses.pull(cls._id);
    await student.save();

    res.status(200).json({ message: `Successfully unenrolled from ${cls.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/classes/recommend/teachers  ← admin only
const recommendTeachers = async (req, res) => {
  try {
    const { subject } = req.query;

    const teachers = await Teacher.find({
      subjectExpertise: { $in: [subject] },
      isAvailable: true,
    }).populate('userId', 'name email');

    const ranked = teachers.map(t => ({
      ...t.toObject(),
      currentLoad: t.assignedClasses.length,
    })).sort((a, b) => a.currentLoad - b.currentLoad);

    res.status(200).json({ teachers: ranked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
  recommendTeachers,
};