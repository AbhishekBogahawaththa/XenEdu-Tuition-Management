const express = require('express');
const router = express.Router();
const {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent,
  recommendTeachers,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getClasses);
router.post('/', authorize('admin'), createClass);
router.get('/recommend/teachers', authorize('admin'), recommendTeachers);
router.get('/:id', getClass);
router.put('/:id', authorize('admin'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);
router.post('/:id/enroll', authorize('student'), enrollStudent);
router.delete('/:id/unenroll', authorize('student'), unenrollStudent);

module.exports = router;