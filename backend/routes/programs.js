const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Program = require('../models/Program');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().trim(),
  query('level').optional().isIn(['undergraduate', 'postgraduate', 'diploma', 'certificate']),
  query('search').optional().trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Build query
    let query = { isActive: true };

    if (req.query.department) {
      query.department = new RegExp(req.query.department, 'i');
    }

    if (req.query.level) {
      query.level = req.query.level;
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Get all programs
    const programs = await Program.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        programs
      }
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching programs'
    });
  }
});

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    if (!program.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Program not available'
      });
    }

    res.json({
      success: true,
      data: {
        program
      }
    });

  } catch (error) {
    console.error('Get program error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching program'
    });
  }
});

// @desc    Get program by slug
// @route   GET /api/programs/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const program = await Program.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('createdBy', 'username');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });

  } catch (error) {
    console.error('Get program by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching program'
    });
  }
});

// @desc    Create new program
// @route   POST /api/programs
// @access  Private (Admin only)
router.post('/', protect, adminOnly, [
  body('title').notEmpty().trim().escape(),
  body('description').notEmpty().trim(),
  body('duration').notEmpty().trim(),
  body('eligibility').optional(),
  body('fees').optional(),
  body('intake').isInt({ min: 1 }),
  body('department').notEmpty().trim(),
  body('level').isIn(['undergraduate', 'postgraduate', 'diploma', 'certificate'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const programData = { ...req.body, createdBy: req.admin._id };
    // If `fees` is numeric (legacy), convert to object
    if (typeof programData.fees === 'number') {
      programData.fees = { annual: programData.fees };
    }
    // Coerce `fees.annual` to number when possible
    if (programData.fees && typeof programData.fees === 'object' && programData.fees.annual !== undefined) {
      const n = Number(programData.fees.annual)
      if (!Number.isNaN(n)) programData.fees.annual = n
      else delete programData.fees.annual
    }

    const program = await Program.create(programData);

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: {
        program
      }
    });

  } catch (error) {
    console.error('Create program error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating program'
    });
  }
});

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, [
  body('title').optional().notEmpty().trim().escape(),
  body('description').optional().notEmpty().trim(),
  body('duration').optional().notEmpty().trim(),
  body('eligibility').optional(),
  body('fees').optional(),
  body('intake').optional().isInt({ min: 1 }),
  body('department').optional().notEmpty().trim(),
  body('level').optional().isIn(['undergraduate', 'postgraduate', 'diploma', 'certificate'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Normalize update payload (handle legacy numeric fees and coerce annual)
    const updateData = { ...req.body };
    if (typeof updateData.fees === 'number') {
      updateData.fees = { annual: updateData.fees };
    }
    if (updateData.fees && typeof updateData.fees === 'object' && updateData.fees.annual !== undefined) {
      const n = Number(updateData.fees.annual)
      if (!Number.isNaN(n)) updateData.fees.annual = n
      else delete updateData.fees.annual
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: {
        program
      }
    });

  } catch (error) {
    console.error('Update program error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating program'
    });
  }
});

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Delete the physical image file from Cloudinary if it exists
    if (program.image) {
      await deleteFile(program.image);
    }

    // Delete any document files from Cloudinary if they exist
    if (program.documents && program.documents.length > 0) {
      for (const docPath of program.documents) {
        if (docPath) {
          await deleteFile(docPath);
        }
      }
    }

    await Program.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });

  } catch (error) {
    console.error('Delete program error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting program'
    });
  }
});

module.exports = router;




