import express from 'express';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all active courses (with optional filters)
// @access  Public / Private
router.get('/', async (req, res) => {
  try {
    const { department, search, semester } = req.query;
    const filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (semester && semester !== 'All') {
      filter.semester = Number(semester);
    }

    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter).sort({ courseCode: 1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses list.',
      error: error.message,
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course details
// @access  Public / Private
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name studentId email department');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving course.', error: error.message });
  }
});

// @route   POST /api/courses/register
// @desc    Register student into a course
// @access  Private (Student)
router.post('/register', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.',
      });
    }

    const student = await User.findById(req.user._id).populate('enrolledCourses');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Target course not found.' });
    }

    // Check if already registered
    const isAlreadyEnrolled = student.enrolledCourses.some(
      (c) => c._id.toString() === course._id.toString()
    );
    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for ${course.courseCode} (${course.title}).`,
      });
    }

    // Check seat capacity
    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: `Registration full! Course ${course.courseCode} has reached max capacity (${course.capacity} students).`,
      });
    }

    // Check credit hour limit (e.g. max 21 credits per semester)
    const currentCredits = student.enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const maxCreditLimit = 21;
    if (currentCredits + course.credits > maxCreditLimit) {
      return res.status(400).json({
        success: false,
        message: `Credit overload error: Adding this course (${course.credits} cr) would exceed the maximum limit of ${maxCreditLimit} credits. Current: ${currentCredits} cr.`,
      });
    }

    // Enroll student
    student.enrolledCourses.push(course._id);
    student.creditsEarned = currentCredits + course.credits;
    await student.save();

    // Update course enrollments
    course.enrolledStudents.push(student._id);
    await course.save();

    const updatedStudent = await User.findById(student._id).populate('enrolledCourses');

    res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.courseCode} - ${course.title}!`,
      user: updatedStudent,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process course registration.',
      error: error.message,
    });
  }
});

// @route   POST /api/courses/drop
// @desc    Drop an enrolled course
// @access  Private (Student)
router.post('/drop', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }

    const student = await User.findById(req.user._id).populate('enrolledCourses');
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Remove from student
    student.enrolledCourses = student.enrolledCourses.filter(
      (c) => c._id.toString() !== courseId
    );
    student.creditsEarned = Math.max(0, (student.creditsEarned || 0) - course.credits);
    await student.save();

    // Remove from course
    course.enrolledStudents = course.enrolledStudents.filter(
      (sId) => sId.toString() !== student._id.toString()
    );
    await course.save();

    const updatedStudent = await User.findById(student._id).populate('enrolledCourses');

    res.status(200).json({
      success: true,
      message: `Course ${course.courseCode} successfully dropped.`,
      user: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to drop course.',
      error: error.message,
    });
  }
});

export default router;
