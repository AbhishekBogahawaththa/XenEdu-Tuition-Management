const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  updateStatus,
  deleteStudent,
  getPendingStudents,
  approveStudent,
  rejectStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getStudents);
router.post('/', authorize('admin'), createStudent);
router.get('/:id', authorize('admin', 'teacher'), getStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.patch('/:id/status', authorize('admin'), updateStatus);
router.delete('/:id', authorize('admin'), deleteStudent);

router.get('/pending', authorize('admin'), getPendingStudents);
router.patch('/:id/approve', authorize('admin'), approveStudent);
router.delete('/:id/reject', authorize('admin'), rejectStudent);

module.exports = router;