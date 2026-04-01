const express = require('express');
const path = require('path');
const fs = require('fs');
const Partner = require('../models/Partner');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all active partners for public display
// @route   GET /api/partners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: { partners }
    });

  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partners'
    });
  }
});

// @desc    Get all partners for admin
// @route   GET /api/partners/admin
// @access  Private (Admin only)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    let query = {};

    // Filter by category if provided
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by active status if provided
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    // Search by name if provided
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const partners = await Partner.find(query)
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        partners
      }
    });

  } catch (error) {
    console.error('Get partners admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partners'
    });
  }
});

// @desc    Get single partner
// @route   GET /api/partners/:id
// @access  Private (Admin only)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: { partner }
    });

  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partner'
    });
  }
});

// @desc    Create new partner
// @route   POST /api/partners
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const partnerData = {
      name: req.body.name,
      altText: req.body.altText,
      link: req.body.link,
      description: req.body.description,
      category: req.body.category,
      isActive: req.body.isActive !== 'false',
      order: parseInt(req.body.order) || 0
    };

    // Handle logo upload
    if (req.file) {
      partnerData.logo = req.file.path;
    } else if (req.body.logo) {
      partnerData.logo = req.body.logo;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Partner logo is required'
      });
    }

    const partner = await Partner.create(partnerData);

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: { partner }
    });

  } catch (error) {
    console.error('Create partner error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating partner'
    });
  }
});

// @desc    Update partner
// @route   PUT /api/partners/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      altText: req.body.altText,
      link: req.body.link,
      description: req.body.description,
      category: req.body.category,
      isActive: req.body.isActive !== 'false',
      order: parseInt(req.body.order) || 0
    };

    // Fetch existing partner first
    const existingPartner = await Partner.findById(req.params.id);
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Handle logo upload or removal
    if (req.file) {
      // New logo uploaded - delete old one from Cloudinary
      if (existingPartner.logo) {
        await deleteFile(existingPartner.logo);
      }
      updateData.logo = req.file.path;
    } else if (req.body.logo && req.body.logo !== 'undefined' && req.body.logo !== '') {
      // Keep existing logo
      updateData.logo = req.body.logo;
    } else if (req.body.logo === '') {
      // Logo was explicitly removed
      if (existingPartner.logo) {
        await deleteFile(existingPartner.logo);
      }
      updateData.logo = '';
    }

    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Partner updated successfully',
      data: { partner }
    });

  } catch (error) {
    console.error('Update partner error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating partner'
    });
  }
});

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Delete the physical logo file from Cloudinary if it exists
    if (partner.logo) {
      await deleteFile(partner.logo);
    }

    await Partner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });

  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting partner'
    });
  }
});

// @desc    Bulk delete partners
// @route   DELETE /api/partners/bulk/delete
// @access  Private (Admin only)
router.delete('/bulk/delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No partner IDs provided'
      });
    }

    // Fetch all partners to delete their files
    const partners = await Partner.find({ _id: { $in: ids } });
    
    // Delete all associated logo files from Cloudinary
    for (const partner of partners) {
      if (partner.logo) {
        await deleteFile(partner.logo);
      }
    }

    const result = await Partner.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} partners deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.error('Bulk delete partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk delete'
    });
  }
});

// @desc    Reorder partners
// @route   POST /api/partners/reorder
// @access  Private (Admin only)
router.post('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { partners } = req.body;

    if (!partners || !Array.isArray(partners)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid partners data'
      });
    }

    // Update order for each partner
    const updatePromises = partners.map((partner, index) => 
      Partner.findByIdAndUpdate(partner.id, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Partners reordered successfully'
    });

  } catch (error) {
    console.error('Reorder partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering partners'
    });
  }
});

module.exports = router;
