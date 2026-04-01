const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Research = require('../models/Research');
const { protect, adminOnly } = require('../middleware/auth');

const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all research
// @route   GET /api/research
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check if this is an admin request (authenticated user)
    const isAdmin = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    
    let query = {};
    
    // For public requests, only show published content
    if (!isAdmin) {
      query.isPublished = true;
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.section) {
      query.section = req.query.section;
    }

    // For admin requests or when specifically requested, fetch all data without pagination
    if (isAdmin || req.query.all === 'true') {
      const research = await Research.find(query)
        .select('-__v') // Exclude version field
        .sort({ section: 1, order: 1, createdAt: -1 })
        .lean(); // Use lean() for better performance

      return res.json({
        success: true,
        data: {
          research,
          total: research.length
        }
      });
    }

    // For all requests, return all data without pagination
    const research = await Research.find(query)
      .sort({ createdAt: -1 });

    // Sanitize data to prevent corrupted fields from causing performance issues
    const sanitizedResearch = research.map(item => {
      const obj = item.toObject();
      
      // Check for corrupted duration field (string when it should be object)
      if (obj.duration && typeof obj.duration === 'string' && obj.duration.length > 1000) {
        console.warn(`Corrupted duration field detected for research ${obj._id}, sanitizing...`);
        obj.duration = { startDate: null, endDate: null };
      }
      
      return obj;
    });

    res.json({
      success: true,
      data: {
        research: sanitizedResearch
      }
    });

  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching research'
    });
  }
});

// @desc    Create new research
// @route   POST /api/research
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  console.log('=== RESEARCH CREATION REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('File:', req.file);
  console.log('Admin:', req.admin);
  console.log('=== END REQUEST LOG ===');
  
  try {
    const researchData = {
      ...req.body,
      createdBy: req.admin._id
    };

    // Handle individual duration fields
    if (req.body.duration_startDate || req.body.duration_endDate) {
      researchData.duration = {
        startDate: req.body.duration_startDate || null,
        endDate: req.body.duration_endDate || null
      };
      // Remove the individual fields
      delete researchData.duration_startDate;
      delete researchData.duration_endDate;
    }

    // Handle individual publication details fields
    const publicationFields = ['journal', 'volume', 'issue', 'pages', 'year', 'doi', 'impactFactor', 'authors'];
    let hasPublicationDetails = false;
    const publicationDetails = {};
    
    publicationFields.forEach(field => {
      const fieldName = `publicationDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasPublicationDetails = true;
        if (field === 'authors') {
          try {
            publicationDetails[field] = JSON.parse(req.body[fieldName]);
          } catch (e) {
            publicationDetails[field] = [];
          }
        } else if (field === 'year') {
          publicationDetails[field] = parseInt(req.body[fieldName]) || null;
        } else if (field === 'impactFactor') {
          publicationDetails[field] = parseFloat(req.body[fieldName]) || null;
        } else {
          publicationDetails[field] = req.body[fieldName];
        }
        delete researchData[fieldName];
      }
    });
    
    if (hasPublicationDetails) {
      researchData.publicationDetails = publicationDetails;
    }

    // Handle individual student details fields
    const studentFields = ['studentName', 'degree', 'supervisor', 'completionYear'];
    let hasStudentDetails = false;
    const studentDetails = {};
    
    studentFields.forEach(field => {
      const fieldName = `studentDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasStudentDetails = true;
        if (field === 'completionYear') {
          studentDetails[field] = parseInt(req.body[fieldName]) || null;
        } else {
          studentDetails[field] = req.body[fieldName];
        }
        delete researchData[fieldName];
      }
    });
    
    if (hasStudentDetails) {
      researchData.studentDetails = studentDetails;
    }

    // Handle individual collaboration details fields
    const collaborationFields = ['partnerInstitution', 'partnerCountry', 'collaborationType', 'mou'];
    let hasCollaborationDetails = false;
    const collaborationDetails = {};
    
    collaborationFields.forEach(field => {
      const fieldName = `collaborationDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasCollaborationDetails = true;
        if (field === 'mou') {
          collaborationDetails[field] = req.body[fieldName] === 'true';
        } else {
          collaborationDetails[field] = req.body[fieldName];
        }
        delete researchData[fieldName];
      }
    });
    
    if (hasCollaborationDetails) {
      researchData.collaborationDetails = collaborationDetails;
    }

    // Handle individual facility details fields
    const facilityFields = ['type', 'capacity', 'specifications', 'utilizationAreas'];
    let hasFacilityDetails = false;
    const facilityDetails = {};
    
    facilityFields.forEach(field => {
      const fieldName = `facilityDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasFacilityDetails = true;
        if (field === 'utilizationAreas') {
          try {
            facilityDetails[field] = JSON.parse(req.body[fieldName]);
          } catch (e) {
            facilityDetails[field] = [];
          }
        } else {
          facilityDetails[field] = req.body[fieldName];
        }
        delete researchData[fieldName];
      }
    });
    
    if (hasFacilityDetails) {
      researchData.facilityDetails = facilityDetails;
    }

    // Handle array fields (these still need JSON parsing but are safer)
    const arrayFields = ['objectives', 'coInvestigators', 'keyFindings', 'tags'];
    arrayFields.forEach(field => {
      if (researchData[field] && typeof researchData[field] === 'string') {
        try {
          const parsed = JSON.parse(researchData[field]);
          if (Array.isArray(parsed)) {
            researchData[field] = parsed;
          }
        } catch (e) {
          console.log(`Failed to parse ${field} as JSON:`, e.message);
          researchData[field] = [];
        }
      }
    });

    // If PDF file is uploaded to Cloudinary, add URL and originalName
    if (req.file) {
      researchData.filename = req.file.path; // Store Cloudinary URL in filename field for compatibility or update schema
      researchData.originalName = req.file.originalname;
    }

    const research = await Research.create(researchData);

    res.status(201).json({
      success: true,
      message: 'Research created successfully',
      data: { research }
    });

  } catch (error) {
    console.error('Create research error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating research'
    });
  }
});

// Additional routes following similar pattern...
router.get('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research || !research.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }
    res.json({ success: true, data: { research } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  console.log('=== RESEARCH UPDATE REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Params:', req.params);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Admin:', req.admin);
  console.log('=== END REQUEST LOG ===');
  
  try {
    // Validate ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid research ID format'
      });
    }

    // Clean the data to remove undefined values
    const cleanData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        cleanData[key] = req.body[key];
      }
    });

    console.log('Cleaned data:', JSON.stringify(cleanData, null, 2));

    // Handle individual duration fields
    if (req.body.duration_startDate || req.body.duration_endDate) {
      cleanData.duration = {
        startDate: req.body.duration_startDate || null,
        endDate: req.body.duration_endDate || null
      };
      // Remove the individual fields
      delete cleanData.duration_startDate;
      delete cleanData.duration_endDate;
    }

    // Handle individual publication details fields
    const publicationFields = ['journal', 'volume', 'issue', 'pages', 'year', 'doi', 'impactFactor', 'authors'];
    let hasPublicationDetails = false;
    const publicationDetails = {};
    
    publicationFields.forEach(field => {
      const fieldName = `publicationDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasPublicationDetails = true;
        if (field === 'authors') {
          try {
            publicationDetails[field] = JSON.parse(req.body[fieldName]);
          } catch (e) {
            publicationDetails[field] = [];
          }
        } else if (field === 'year') {
          publicationDetails[field] = parseInt(req.body[fieldName]) || null;
        } else if (field === 'impactFactor') {
          publicationDetails[field] = parseFloat(req.body[fieldName]) || null;
        } else {
          publicationDetails[field] = req.body[fieldName];
        }
        delete cleanData[fieldName];
      }
    });
    
    if (hasPublicationDetails) {
      cleanData.publicationDetails = publicationDetails;
    }

    // Handle individual student details fields
    const studentFields = ['studentName', 'degree', 'supervisor', 'completionYear'];
    let hasStudentDetails = false;
    const studentDetails = {};
    
    studentFields.forEach(field => {
      const fieldName = `studentDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasStudentDetails = true;
        if (field === 'completionYear') {
          studentDetails[field] = parseInt(req.body[fieldName]) || null;
        } else {
          studentDetails[field] = req.body[fieldName];
        }
        delete cleanData[fieldName];
      }
    });
    
    if (hasStudentDetails) {
      cleanData.studentDetails = studentDetails;
    }

    // Handle individual collaboration details fields
    const collaborationFields = ['partnerInstitution', 'partnerCountry', 'collaborationType', 'mou'];
    let hasCollaborationDetails = false;
    const collaborationDetails = {};
    
    collaborationFields.forEach(field => {
      const fieldName = `collaborationDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasCollaborationDetails = true;
        if (field === 'mou') {
          collaborationDetails[field] = req.body[fieldName] === 'true';
        } else {
          collaborationDetails[field] = req.body[fieldName];
        }
        delete cleanData[fieldName];
      }
    });
    
    if (hasCollaborationDetails) {
      cleanData.collaborationDetails = collaborationDetails;
    }

    // Handle individual facility details fields
    const facilityFields = ['type', 'capacity', 'specifications', 'utilizationAreas'];
    let hasFacilityDetails = false;
    const facilityDetails = {};
    
    facilityFields.forEach(field => {
      const fieldName = `facilityDetails_${field}`;
      if (req.body[fieldName] !== undefined) {
        hasFacilityDetails = true;
        if (field === 'utilizationAreas') {
          try {
            facilityDetails[field] = JSON.parse(req.body[fieldName]);
          } catch (e) {
            facilityDetails[field] = [];
          }
        } else {
          facilityDetails[field] = req.body[fieldName];
        }
        delete cleanData[fieldName];
      }
    });
    
    if (hasFacilityDetails) {
      cleanData.facilityDetails = facilityDetails;
    }

    // Handle array fields (these still need JSON parsing but are safer)
    const arrayFields = ['objectives', 'coInvestigators', 'keyFindings', 'tags'];
    arrayFields.forEach(field => {
      if (cleanData[field] && typeof cleanData[field] === 'string') {
        try {
          const parsed = JSON.parse(cleanData[field]);
          if (Array.isArray(parsed)) {
            cleanData[field] = parsed;
          }
        } catch (e) {
          console.log(`Failed to parse ${field} as JSON:`, e.message);
          cleanData[field] = [];
        }
      }
    });

    // Handle PDF removal flag or new upload
    const existingResearch = await Research.findById(req.params.id);
    if (!existingResearch) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }

    // If removePdf flag is set, delete the PDF from Cloudinary
    if (req.body.removePdf === 'true') {
      if (existingResearch.filename) {
        await deleteFile(existingResearch.filename);
      }
      cleanData.filename = '';
      cleanData.originalName = '';
    }
    // If PDF file is uploaded, add filename and originalName
    else if (req.file) {
      if (existingResearch.filename) {
        await deleteFile(existingResearch.filename);
      }
      
      researchData.filename = req.file.path;
      researchData.originalName = req.file.originalname;
      console.log('PDF file uploaded to Cloudinary:', req.file.path);
    }

    // Convert string numbers to actual numbers where needed
    if (cleanData.budget && typeof cleanData.budget === 'string') {
      cleanData.budget = parseFloat(cleanData.budget) || undefined;
    }

    console.log('Data after processing:', JSON.stringify(cleanData, null, 2));

    // Handle documents separately if they exist
    let research;
    if (cleanData.documents && Array.isArray(cleanData.documents)) {
      // Separate documents from other data
      const { documents, ...otherData } = cleanData;
      
      console.log('Updating with documents separately');
      console.log('Documents to set:', JSON.stringify(documents, null, 2));
      console.log('Other data:', JSON.stringify(otherData, null, 2));
      
      // First update other fields
      research = await Research.findByIdAndUpdate(
        req.params.id, 
        otherData, 
        { new: true, runValidators: true }
      );
      
      if (!research) {
        return res.status(404).json({ 
          success: false, 
          message: 'Research not found' 
        });
      }

      // Then update documents using direct MongoDB operation
      await mongoose.connection.db.collection('researches').updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { $set: { documents: documents } }
      );

      // Fetch the final updated document
      research = await Research.findById(req.params.id);
    } else {
      // No documents to update, use regular update
      research = await Research.findByIdAndUpdate(
        req.params.id, 
        cleanData, 
        { new: true, runValidators: true }
      );
    }
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        message: 'Research not found' 
      });
    }
    
    console.log('Research updated successfully:', research._id);
    res.json({ 
      success: true, 
      message: 'Research updated successfully',
      data: { research } 
    });
  } catch (error) {
    console.error('Update research error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: validationErrors,
        details: error.errors
      });
    }
    
    // Handle cast errors (like invalid ObjectId references)
    if (error.name === 'CastError') {
      console.log('Cast error:', error.message);
      return res.status(400).json({ 
        success: false,
        message: `Invalid ${error.path}: ${error.value}` 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error updating research'
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ success: false, message: 'Research not found' });
    }

    // Delete all associated image files from Cloudinary
    if (research.images && research.images.length > 0) {
      for (const imagePath of research.images) {
        if (imagePath) {
          await deleteFile(imagePath);
        }
      }
    }

    // Delete all associated document files from Cloudinary
    if (research.documents && research.documents.length > 0) {
      for (const docPath of research.documents) {
        if (docPath) {
          await deleteFile(docPath);
        }
      }
    }
    
    // Delete the main PDF from Cloudinary
    if (research.filename) {
      await deleteFile(research.filename);
    }

    await Research.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Research deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;



