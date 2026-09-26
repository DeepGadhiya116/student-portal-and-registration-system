import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validateRegistration, validateLogin } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_eduportal_2026_dev',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new student with full form validation
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, studentId, department, year, semester, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: [{ field: 'email', message: 'Email address is already in use.' }],
      });
    }

    // Auto-generate or check student ID
    let finalStudentId = studentId;
    if (!finalStudentId) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      finalStudentId = `STU-2026-${randomSuffix}`;
    } else {
      const existingId = await User.findOne({ studentId: finalStudentId });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'This Student ID is already registered.',
          errors: [{ field: 'studentId', message: 'Student ID is already registered to another account.' }],
        });
      }
    }

    // Create student
    const user = new User({
      name,
      email,
      password,
      studentId: finalStudentId,
      department: department || 'Computer Science and Engineering',
      year: year || 1,
      semester: semester || 1,
      phone: phone || '',
      role: 'student',
      status: 'Active',
      cgpa: 3.8,
      creditsEarned: 0,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Student Portal.',
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate student/admin & return JWT
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('enrolledCourses');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
        errors: [{ field: 'email', message: 'No registered user found with this email.' }],
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
        errors: [{ field: 'password', message: 'Incorrect password.' }],
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.',
      });
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('enrolledCourses');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching authenticated profile.',
      error: error.message,
    });
  }
});

export default router;
