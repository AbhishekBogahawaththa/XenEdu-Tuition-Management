const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// @POST /api/students
const createStudent = async (req, res) => {
  try {
    const {
      name, email, password,
      school, grade, medium, stream,
      parentName, parentEmail, parentPassword, parentContact, parentAddress
    } = req.body;

    // Create user account for student
    const studentUser = await User.create({
      name, email, password, role: 'student'
    });

    // Create user account for parent if provided
    let parent = null;
    if (parentEmail) {
      let parentUser = await User.findOne({ email: parentEmail });
      if (!parentUser) {
        parentUser = await User.create({
          name: parentName,
          email: parentEmail,
          password: parentPassword || 'parent123',
          role: 'parent'
        });
      }
      parent = await Parent.findOne({ userId: parentUser._id });
      if (!parent) {
        parent = await Parent.create({
          userId: parentUser._id,
          contactNumber: parentContact,
          address: parentAddress,
        });
      }
    }

    // Create student profile
    const student = await Student.create({
      userId: studentUser._id,
      parentId: parent?._id,
      school, grade, medium, stream,
    });

    // Link student to parent
    if (parent) {
      parent.students.push(student._id);
      await parent.save();
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email')
      .populate('parentId');

    res.status(201).json({
      message: 'Student created successfully',
      student: populatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/students
const getStudents = async (req, res) => {
  try {
    const { grade, medium, stream, status, search } = req.query;

    const filter = {};
    if (grade) filter.grade = grade;
    if (medium) filter.medium = medium;
    if (stream) filter.stream = stream;
    if (status) filter.status = status;

    let students = await Student.find(filter)
      .populate('userId', 'name email isActive')
      .populate('parentId')
      .populate('enrolledClasses', 'name subject')
      .sort({ createdAt: -1 });

    // Search by name or email
    if (search) {
      students = students.filter(s =>
        s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({ count: students.length, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email isActive createdAt')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('enrolledClasses', 'name subject grade schedule');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const { name, email, school, grade, medium, stream } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update user account
    if (name || email) {
      await User.findByIdAndUpdate(student.userId, { name, email });
    }

    // Update student profile
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { school, grade, medium, stream },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/students/:id/status
// @PATCH /api/students/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const updateData = { status };

    if (status === 'suspended') {
      updateData.suspendReason = reason || 'No reason provided';
      updateData.suspendedAt = new Date();
      updateData.suspendedBy = req.user._id;
    } else if (status === 'active') {
      // Clear suspension info when reactivating
      updateData.suspendReason = null;
      updateData.suspendedAt = null;
      updateData.suspendedBy = null;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({
      message: `Student ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @POST /api/auth/student-register - PUBLIC
const studentRegister = async (req, res) => {
  try {
    const { name, email, password, school, grade, medium, stream, contactNumber } = req.body;
    if (!name || !email || !password || !school || !grade || !medium || !stream) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const studentUser = await User.create({ name, email, password, role: 'student' });
    const student = await Student.create({
      userId: studentUser._id,
      school, grade, medium, stream,
      status: 'pending',
      contactNumber,
    });

    res.status(201).json({
      message: 'Registration submitted! Admin will review and approve your account.',
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/students/pending - Admin only
const getPendingStudents = async (req, res) => {
  try {
    const students = await Student.find({ status: 'pending' })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: students.length, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/students/:id/approve - Admin only
// @PATCH /api/students/:id/approve - Admin only
const approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.admissionNumber) {
      const count = await Student.countDocuments({ status: { $ne: 'pending' } });
      student.admissionNumber = 'XE' + String(count + 1).padStart(4, '0');
    }
    student.status = 'active';
    await student.save();

    await student.populate('userId', 'name email');
    res.status(200).json({ message: 'Student approved successfully!', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/students/:id/reject - Admin only
const rejectStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await User.findByIdAndDelete(student.userId._id);
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Registration rejected and removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  updateStatus,
  deleteStudent,
  studentRegister,
  getPendingStudents,
  approveStudent,
  rejectStudent,
};