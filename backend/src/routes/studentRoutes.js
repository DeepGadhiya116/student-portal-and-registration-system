import express from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { authenticate } from '../middleware/auth.js';
import { validateProfileUpdate, validatePasswordChange } from '../middleware/validate.js';

const router = express.Router();

// @route   GET /api/students/profile
// @desc    Get detailed student profile & academic status
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select('-password')
      .populate('enrolledCourses');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Calculate total registered credits
    const totalCredits = (student.enrolledCourses || []).reduce(
      (sum, course) => sum + (course.credits || 0),
      0
    );

    res.status(200).json({
      success: true,
      profile: student,
      stats: {
        totalEnrolledCourses: student.enrolledCourses ? student.enrolledCourses.length : 0,
        currentCredits: totalCredits,
        cgpa: student.cgpa,
        academicStanding: student.cgpa >= 2.0 ? 'Good Standing' : 'Academic Probation',
        year: student.year,
        semester: student.semester,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile.',
      error: error.message,
    });
  }
});

// @route   PUT /api/students/profile
// @desc    Update student profile information with validation
// @access  Private
router.put('/profile', authenticate, validateProfileUpdate, async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const {
      name,
      phone,
      department,
      semester,
      year,
      bio,
      address,
      emergencyContact,
      avatar,
    } = req.body;

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (department) student.department = department;
    if (semester !== undefined) student.semester = Number(semester);
    if (year !== undefined) student.year = Number(year);
    if (bio !== undefined) student.bio = bio;
    if (address !== undefined) student.address = address;
    if (emergencyContact !== undefined) student.emergencyContact = emergencyContact;
    if (avatar) student.avatar = avatar;

    await student.save();

    const updatedUser = await User.findById(student._id)
      .select('-password')
      .populate('enrolledCourses');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile.',
      error: error.message,
    });
  }
});

// @route   PUT /api/students/password
// @desc    Change student password with validation
// @access  Private
router.put('/password', authenticate, validatePasswordChange, async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
        errors: [{ field: 'currentPassword', message: 'Incorrect current password.' }],
      });
    }

    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please keep your credentials secure.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password.',
      error: error.message,
    });
  }
});

// @route   GET /api/students/courses
// @desc    Get courses enrolled by the current student
// @access  Private
router.get('/courses', authenticate, async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate('enrolledCourses');
    res.status(200).json({
      success: true,
      courses: student.enrolledCourses || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled courses.',
      error: error.message,
    });
  }
});

export default router;
