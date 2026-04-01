const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Faculty = require('../models/Faculty');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = { isActive: true };
    
    if (req.query.department) {
      query.department = new RegExp(req.query.department, 'i');
    }

    if (req.query.staffType) {
      query.staffType = req.query.staffType;
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const faculty = await Faculty.find(query)
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        faculty
      }
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching faculty'
    });
  }
});

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty || !faculty.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      data: { faculty }
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching faculty member'
    });
  }
});

// @desc    Create new faculty member
// @route   POST /api/faculty
// @access  Private (Admin only)
router.post('/', protect, adminOnly, [
  body('name').notEmpty().trim().escape(),
  body('designation').notEmpty().trim(),
  body('staffType').isIn(['Teaching Staff', 'Non-Teaching Staff']),
  body('department').custom((value, { req }) => {
    // Department is required only for Teaching Staff
    if (req.body.staffType === 'Teaching Staff') {
      if (!value || !value.trim()) {
        throw new Error('Department is required for Teaching Staff');
      }
    }
    return true;
  }),
  body('qualification').notEmpty().trim(),
  body('specialization').notEmpty().trim(),
  body('experience').isInt({ min: 0 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    console.log('Faculty POST request received');
    console.log('Request body:', req.body);
    console.log('Required fields check:');
    console.log('- name:', req.body.name);
    console.log('- designation:', req.body.designation);
    console.log('- department:', req.body.department);
    console.log('- qualification:', req.body.qualification);
    console.log('- specialization:', req.body.specialization);
    console.log('- experience:', req.body.experience);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const facultyData = {
      ...req.body,
      createdBy: req.admin._id
    };

    console.log('Creating faculty with data:', facultyData);
    console.log('Image field in request:', req.body.image);

    const faculty = await Faculty.create(facultyData);

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully',
      data: { faculty }
    });

  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating faculty member'
    });
  }
});

// @desc    Update faculty member
// @route   PUT /api/faculty/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, [
  body('name').optional().notEmpty().trim().escape(),
  body('designation').optional().notEmpty().trim(),
  body('staffType').optional().isIn(['Teaching Staff', 'Non-Teaching Staff']),
  body('department').optional().custom((value, { req }) => {
    // Department is required only for Teaching Staff
    if (req.body.staffType === 'Teaching Staff' || (!req.body.staffType && req.body.department)) {
      if (!value || !value.trim()) {
        throw new Error('Department is required for Teaching Staff');
      }
    }
    return true;
  }),
    body('qualification').notEmpty().trim(),
  body('specialization').notEmpty().trim(),
  body('experience').optional().isInt({ min: 0 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty member updated successfully',
      data: { faculty }
    });

  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating faculty member'
    });
  }
});

// @desc    Delete faculty member
// @route   DELETE /api/faculty/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    // Delete the physical image file from Cloudinary if it exists
    if (faculty.image) {
      await deleteFile(faculty.image);
    }

    await Faculty.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Faculty member deleted successfully'
    });

  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting faculty member'
    });
  }
});

// @desc    Get faculty metadata (departments, designations, etc.)
// @route   GET /api/faculty/metadata
// @access  Public
router.get('/metadata', async (req, res) => {
  try {
    // Get all active faculty
    const faculty = await Faculty.find({ isActive: true }).select('department designation staffType');
    
    // Extract unique departments only from teaching staff
    const teachingFaculty = faculty.filter(f => f.staffType === 'Teaching Staff');
    const nonTeachingFaculty = faculty.filter(f => f.staffType === 'Non-Teaching Staff');
    
    const departments = [...new Set(teachingFaculty.map(f => f.department).filter(Boolean))].sort();
    
    // Extract unique designations by staff type
    const teachingDesignations = [...new Set(teachingFaculty.map(f => f.designation).filter(Boolean))].sort();
    const nonTeachingDesignations = [...new Set(nonTeachingFaculty.map(f => f.designation).filter(Boolean))].sort();
    
    // Get staff counts
    const staffCounts = {
      total: faculty.length,
      teaching: teachingFaculty.length,
      nonTeaching: nonTeachingFaculty.length
    };
    
    res.json({
      success: true,
      data: {
        departments,
        designations: {
          teaching: teachingDesignations,
          nonTeaching: nonTeachingDesignations
        },
        staffCounts
      }
    });

  } catch (error) {
    console.error('Error fetching faculty metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching faculty metadata'
    });
  }
});

module.exports = router;




