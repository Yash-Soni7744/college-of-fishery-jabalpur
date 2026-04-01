const express = require('express');
const path = require('path');
const { upload, handleMulterError, deleteFile } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Serve uploaded files with proper CORS headers (Deprecated for Cloudinary)
// @route   GET /api/upload/serve/:type/:filename
// @access  Public
router.get('/serve/:type/:filename', (req, res) => {
  res.status(410).json({
    success: false,
    message: 'This endpoint is deprecated. Use direct Cloudinary URLs instead.'
  });
});

// @desc    Upload single file (fallback route)
// @route   POST /api/upload
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.single('file'), (req, res) => {
  try {
    console.log('Fallback upload endpoint hit');
    console.log('Request body category:', req.body.category);
    console.log('Request headers x-upload-category:', req.headers['x-upload-category']);
    console.log('File received:', req.file ? req.file.filename : 'No file');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = req.file.path;

    console.log('File uploaded to Cloudinary:', req.file.path);
    console.log('Returning URL:', fileUrl);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        path: req.file.path
      }
    });

  } catch (error) {
    console.error('Fallback upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private (Admin only)
router.post('/single', protect, adminOnly, upload.single('file'), (req, res) => {
  try {
    console.log('General upload endpoint hit');
    console.log('Request body category:', req.body.category);
    console.log('Request headers x-upload-category:', req.headers['x-upload-category']);
    console.log('File received:', req.file ? req.file.filename : 'No file');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get the category from body or headers, default to 'images'
    const category = req.body.category || req.headers['x-upload-category'] || 'images';
    
    // Create relative path for URL
    const fileUrl = req.file.path;

    console.log('File uploaded to Cloudinary:', req.file.path);
    console.log('Category:', category);
    console.log('Returning URL:', fileUrl);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        category: category,
        url: fileUrl,
        path: req.file.path
      }
    });

  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private (Admin only)
router.post('/multiple', protect, adminOnly, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileUrl = file.path;
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl,
        path: file.path
      };
    });

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: req.files.length
      }
    });

  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private (Admin only)
router.delete('/:filename', protect, adminOnly, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Try to find and delete the file in all upload directories
    // Keep this list in sync with middleware/upload.js (add new upload folders here as needed)
    const fileDeleted = await deleteFile(filename);

    if (fileDeleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or could not be deleted from Cloudinary'
      });
    }

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion'
    });
  }
});

// @desc    Get file info
// @route   GET /api/upload/info/:filename
// @access  Private (Admin only)
router.get('/info/:filename', protect, adminOnly, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const fs = require('fs');
    // Keep this list in sync with the delete route above
    const uploadDirs = [
      'uploads/images',
      'uploads/documents',
      'uploads/faculty',
      'uploads/news',
      'uploads/research',
      'uploads/dean',
      'uploads/gallery',
      'uploads/partners',
      'uploads/incubation',
      'uploads/resumes',
      'uploads/programs',
      'uploads/farmers',
      'uploads/infrastructure',
      'uploads/slideshow'
    ];
    
    for (const dir of uploadDirs) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.relative('uploads', filePath).replace(/\\/g, '/')}`;
        
        return res.json({
          success: true,
          data: {
            filename: filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: fileUrl,
            directory: dir
          }
        });
      }
    }

    res.status(404).json({
      success: false,
      message: 'File not found'
    });

  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting file info'
    });
  }
});

// Apply error handling middleware
router.use(handleMulterError);

module.exports = router;




