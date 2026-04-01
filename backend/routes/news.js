const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const NewsEvent = require('../models/NewsEvent');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all news and events
// @route   GET /api/news
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  // Accept comma-separated or array for type
  query('type').optional(),
  query('category').optional().isIn(['academic', 'research', 'extension', 'general', 'placement']),
  query('featured').optional().isBoolean(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Build query
    let query = { isPublished: true };

    if (req.query.type) {
      // Support comma-separated or array for type
      let types = req.query.type;
      if (typeof types === 'string' && types.includes(',')) {
        types = types.split(',').map(t => t.trim()).filter(Boolean);
      }
      if (Array.isArray(types)) {
        query.type = { $in: types };
      } else {
        query.type = types;
      }
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Get all news/events - use lean() to avoid validation issues with attachments
    const newsEvents = await NewsEvent.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        newsEvents
      }
    });

  } catch (error) {
    console.error('Get news/events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching news/events'
    });
  }
});

// @desc    Get single news/event by ID or slug
// @route   GET /api/news/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    console.log('=== GET NEWS/EVENT BY IDENTIFIER ===');
    console.log('Identifier:', req.params.identifier);
    
    const identifier = req.params.identifier;
    let newsEvent;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Finding by ID');
      // Find by ID - use lean() to get plain object and avoid validation issues
      newsEvent = await NewsEvent.findById(identifier)
        .populate('createdBy', 'username')
        .lean();
    } else {
      console.log('Finding by slug');
      // Find by slug - use lean() to get plain object and avoid validation issues
      newsEvent = await NewsEvent.findOne({ slug: identifier })
        .populate('createdBy', 'username')
        .lean();
    }

    console.log('NewsEvent found:', newsEvent ? newsEvent._id : 'NOT FOUND');
    if (newsEvent) {
      console.log('NewsEvent attachments:', newsEvent.attachments);
    }

    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        message: 'News/Event not found'
      });
    }

    if (!newsEvent.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'News/Event not available'
      });
    }

    // Increment views using direct MongoDB operation
    await mongoose.connection.db.collection('newsevents').updateOne(
      { _id: new mongoose.Types.ObjectId(newsEvent._id) },
      { $inc: { views: 1 } }
    );

    // Manually increment the views in the current object for response
    newsEvent.views = (newsEvent.views || 0) + 1;

    res.json({
      success: true,
      data: {
        newsEvent
      }
    });

  } catch (error) {
    console.error('Get news/event error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching news/event',
      error: error.message
    });
  }
});

// @desc    Create new news/event
// @route   POST /api/news
// @access  Private (Admin only)
router.post('/', protect, adminOnly, [
  body('title').notEmpty().trim().escape(),
  body('content').notEmpty().trim(),
  body('excerpt').notEmpty().trim().isLength({ max: 300 }),
  body('type').isIn(['news', 'event', 'announcement', 'seminar', 'workshop', 'visit']),
  body('category').isIn(['academic', 'research', 'extension', 'general', 'placement']),
  body('eventDate').optional().isISO8601(),
  body('venue').optional().trim(),
  body('organizer').optional().trim()
], async (req, res) => {
  try {
    console.log('=== CREATE NEWS/EVENT DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('req.body.attachments type:', typeof req.body.attachments);
    console.log('req.body.attachments is array?:', Array.isArray(req.body.attachments));
    console.log('req.body.attachments value:', req.body.attachments);
    console.log('Request user/admin:', req.admin ? req.admin._id : 'No admin found');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const newsEventData = {
      ...req.body,
      createdBy: req.admin._id
    };

    console.log('Creating news with data:', newsEventData);

    const newsEvent = await NewsEvent.create(newsEventData);

    console.log('News created successfully:', newsEvent._id);

    res.status(201).json({
      success: true,
      message: 'News/Event created successfully',
      data: {
        newsEvent
      }
    });

  } catch (error) {
    console.error('Create news/event error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.log('Mongoose validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating news/event',
      error: error.message
    });
  }
});

// @desc    Update news/event
// @route   PUT /api/news/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, [
  body('title').optional().notEmpty().trim().escape(),
  body('content').optional().notEmpty().trim(),
  body('excerpt').optional().notEmpty().trim().isLength({ max: 300 }),
  body('type').optional().isIn(['news', 'event', 'announcement', 'seminar', 'workshop', 'visit']),
  body('category').optional().isIn(['academic', 'research', 'extension', 'general', 'placement']),
  body('eventDate').optional().isISO8601(),
  body('venue').optional().trim(),
  body('organizer').optional().trim()
], async (req, res) => {
  try {
    console.log('=== UPDATE NEWS/EVENT ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Separate images and attachments from other data
    const { images, attachments, ...otherData } = req.body;
    
    let newsEvent;
    
    // First update other fields
    newsEvent = await NewsEvent.findByIdAndUpdate(
      req.params.id,
      otherData,
      { new: true, runValidators: true }
    );

    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        message: 'News/Event not found'
      });
    }

    // Update images and attachments using direct MongoDB operation if they exist
    const updateFields = {};
    if (images !== undefined) {
      updateFields.images = images;
    }
    if (attachments !== undefined) {
      updateFields.attachments = attachments;
    }

    if (Object.keys(updateFields).length > 0) {
      await mongoose.connection.db.collection('newsevents').updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { $set: updateFields }
      );
      
      // Fetch the final updated document
      newsEvent = await NewsEvent.findById(req.params.id);
    }

    console.log('News/Event updated successfully:', newsEvent._id);

    res.json({
      success: true,
      message: 'News/Event updated successfully',
      data: {
        newsEvent
      }
    });

  } catch (error) {
    console.error('Update news/event error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid news/event ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating news/event'
    });
  }
});

// @desc    Upload images for news/event
// @route   POST /api/news/upload
// @access  Private (Admin only)
router.post('/upload', protect, adminOnly, (req, res) => {
  console.log('News upload route hit - before multer');
  console.log('Request headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'referer': req.headers.referer
  });
  
  // Use multer middleware
  const uploadSingle = require('../middleware/upload').upload.single('file');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }

    try {
      console.log('News upload route - after multer');
      console.log('File received:', req.file ? req.file.filename : 'No file');
      
      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }

      // Ensure the file went to the news directory
      console.log('File path:', req.file.path);
      console.log('File destination:', req.file.destination);
      
      const imageUrl = req.file.path;

      console.log('Returning success response with Cloudinary URL:', imageUrl);
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: imageUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('News image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading image'
      });
    }
  });
});

// @desc    Upload attachment (PDF/Document) for news/event
// @route   POST /api/news/upload-attachment
// @access  Private (Admin only)
router.post('/upload-attachment', protect, adminOnly, (req, res) => {
  console.log('News attachment upload route hit');
  
  // Use multer middleware for document uploads
  const uploadSingle = require('../middleware/upload').upload.single('file');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate file type - only allow PDF and documents
      const allowedTypes = ['application/pdf', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only PDF and DOC/DOCX files are allowed'
        });
      }

      const attachmentUrl = req.file.path;

      console.log('Attachment uploaded successfully to Cloudinary:', req.file.filename);
      
      res.json({
        success: true,
        message: 'Attachment uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: attachmentUrl,
          size: req.file.size,
          type: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('News attachment upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading attachment'
      });
    }
  });
});

// @desc    Delete news/event
// @route   DELETE /api/news/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);

    if (!newsEvent) {
      return res.status(404).json({
        success: false,
        message: 'News/Event not found'
      });
    }

    // Delete all associated image files from Cloudinary
    if (newsEvent.images && newsEvent.images.length > 0) {
      for (const image of newsEvent.images) {
        if (image.url) {
          await deleteFile(image.url);
        }
      }
    }

    // Delete all associated attachments from Cloudinary
    if (newsEvent.attachments && newsEvent.attachments.length > 0) {
      for (const attachment of newsEvent.attachments) {
        if (attachment.url) {
          await deleteFile(attachment.url);
        }
      }
    }

    await NewsEvent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'News/Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete news/event error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid news/event ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting news/event'
    });
  }
});

module.exports = router;




