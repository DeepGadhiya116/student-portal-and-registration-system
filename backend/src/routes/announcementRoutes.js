import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { validateAnnouncement } from '../middleware/validate.js';

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get all announcements with filtering
// @access  Public / Authenticated
router.get('/', async (req, res) => {
  try {
    const { category, priority, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Pinned announcements first, then descending order of date
    const announcements = await Announcement.find(filter).sort({ pinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements.',
      error: error.message,
    });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorizeAdmin, validateAnnouncement, async (req, res) => {
  try {
    const { title, content, category, priority, pinned, targetDepartment } = req.body;

    const announcement = new Announcement({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      pinned: Boolean(pinned),
      targetDepartment: targetDepartment || 'All',
      author: req.user.name || 'Academic Administration',
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully!',
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement.',
      error: error.message,
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorizeAdmin, validateAnnouncement, async (req, res) => {
  try {
    const { title, content, category, priority, pinned, targetDepartment } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.category = category || announcement.category;
    announcement.priority = priority || announcement.priority;
    if (pinned !== undefined) announcement.pinned = Boolean(pinned);
    if (targetDepartment) announcement.targetDepartment = targetDepartment;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement.',
      error: error.message,
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement.',
      error: error.message,
    });
  }
});

export default router;
