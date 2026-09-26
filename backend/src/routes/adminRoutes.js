import express from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Announcement } from '../models/Announcement.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { validateCourse } from '../middleware/validate.js';

const router = express.Router();

// Require admin authentication for all routes in this router
router.use(authenticate, authorizeAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & statistics for Admin Panel
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', status: 'Active' });
    const totalCourses = await Course.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();

    // Aggregate total enrollments
    const courses = await Course.find();
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents ? c.enrolledStudents.length : 0), 0);

    // Department breakdown
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        totalCourses,
        totalAnnouncements,
        totalEnrollments,
        departmentStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats.',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/students
// @desc    List all students with query filters
// @access  Private (Admin)
router.get('/students', async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filter = { role: 'student' };

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(filter)
      .select('-password')
      .populate('enrolledCourses')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students list.',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/students/:id/status
// @desc    Update a student's status, department, or academic attributes
// @access  Private (Admin)
router.put('/students/:id/status', async (req, res) => {
  try {
    const { status, department, cgpa, semester, year } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    if (status) {
      if (!['Active', 'Pending', 'Suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      student.status = status;
    }

    if (department) student.department = department;
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (semester !== undefined) student.semester = Number(semester);
    if (year !== undefined) student.year = Number(year);

    await student.save();

    const updated = await User.findById(student._id).select('-password').populate('enrolledCourses');

    res.status(200).json({
      success: true,
      message: `Student ${student.name} updated successfully!`,
      student: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update student status.',
      error: error.message,
    });
  }
});

// @route   POST /api/admin/courses
// @desc    Create a new course (with validation)
// @access  Private (Admin)
router.post('/courses', validateCourse, async (req, res) => {
  try {
    const { courseCode, title, department, credits, instructor, capacity, schedule, description, semester } = req.body;

    const existing = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${courseCode} already exists.`,
      });
    }

    const course = new Course({
      courseCode: courseCode.toUpperCase(),
      title,
      department,
      credits: Number(credits),
      instructor,
      capacity: Number(capacity),
      schedule: schedule || 'Mon, Wed 10:00 AM - 11:30 AM',
      description: description || '',
      semester: semester ? Number(semester) : 1,
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course added successfully to catalog!',
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course.',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update course details (with validation)
// @access  Private (Admin)
router.put('/courses/:id', validateCourse, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const { courseCode, title, department, credits, instructor, capacity, schedule, description, semester } = req.body;

    course.courseCode = courseCode.toUpperCase();
    course.title = title;
    course.department = department;
    course.credits = Number(credits);
    course.instructor = instructor;
    course.capacity = Number(capacity);
    if (schedule) course.schedule = schedule;
    if (description !== undefined) course.description = description;
    if (semester) course.semester = Number(semester);

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update course.',
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete a course from catalog
// @access  Private (Admin)
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Pull from enrolled students' lists
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Course ${course.courseCode} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete course.',
      error: error.message,
    });
  }
});

export default router;
