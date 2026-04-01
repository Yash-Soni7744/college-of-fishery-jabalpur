const express = require('express');
const path = require('path');
const fs = require('fs');
const Content = require('../models/Content');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get content by section
// @route   GET /api/content/:section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { subsection } = req.query;

    let query = { 
      section: section,
      isPublished: true 
    };

    if (subsection) {
      query.subsection = subsection;
    }

    const content = await Content.find(query)
      .sort({ order: 1, createdAt: 1 })
      .populate('lastModifiedBy', 'username');

    res.json({
      success: true,
      data: { content }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching content'
    });
  }
});

// @desc    Get content by key
// @route   GET /api/content/key/:key
// @access  Public
router.get('/key/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ 
      key: req.params.key,
      isPublished: true 
    }).populate('lastModifiedBy', 'username');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: { content }
    });

  } catch (error) {
    console.error('Get content by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching content'
    });
  }
});

// @desc    Create or update content
// @route   POST /api/content
// @access  Private (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { key, content } = req.body;
    
    // Validate content field - ensure it's a string
    if (content !== undefined && typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content must be a string. Arrays should be JSON stringified.'
      });
    }
    
    // Check if content with this key already exists
    const existingContent = await Content.findOne({ key });

    if (existingContent) {
      // Update existing content
      const updatedContent = await Content.findOneAndUpdate(
        { key },
        { ...req.body, lastModifiedBy: req.admin._id },
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Content updated successfully',
        data: { content: updatedContent }
      });
    } else {
      // Create new content
      const contentData = {
        ...req.body,
        lastModifiedBy: req.admin._id
      };

      const content = await Content.create(contentData);

      return res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: { content }
      });
    }

  } catch (error) {
    console.error('Create/Update content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating/updating content'
    });
  }
});

// @desc    Update content by ID
// @route   PUT /api/content/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { content: contentValue } = req.body;
    
    // Validate content field - ensure it's a string
    if (contentValue !== undefined && typeof contentValue !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content must be a string. Arrays should be JSON stringified.'
      });
    }
    
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.admin._id },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: { content: updatedContent }
    });

  } catch (error) {
    console.error('Update content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating content'
    });
  }
});

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete all associated image files from Cloudinary
    if (content.images && content.images.length > 0) {
      for (const imagePath of content.images) {
        if (imagePath) {
          await deleteFile(imagePath);
        }
      }
    }

    await Content.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting content'
    });
  }
});

// @desc    Get all content (for admin)
// @route   GET /api/content/admin/all
// @access  Private (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    let query = {};

    if (req.query.section) {
      query.section = req.query.section;
    }

    if (req.query.published !== undefined) {
      query.isPublished = req.query.published === 'true';
    }

    const content = await Content.find(query)
      .populate('lastModifiedBy', 'username')
      .sort({ section: 1, subsection: 1, order: 1 });

    res.json({
      success: true,
      data: {
        content
      }
    });

  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching content'
    });
  }
});

module.exports = router;




