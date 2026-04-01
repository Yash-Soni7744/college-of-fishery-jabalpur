const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on the category
    let folder = 'fishery_college/images'; // default folder
    
    const url = req.originalUrl || req.url;
    const category = req.body?.category;
    const categoryHeader = req.headers['x-upload-category'];
    const finalCategory = category || categoryHeader;
    
    if (url.includes('/partners') || finalCategory === 'partners') {
      folder = 'fishery_college/partners';
    } else if (url.includes('/incubation') || finalCategory === 'incubation') {
      folder = 'fishery_college/incubation';
    } else if (url.includes('/news/upload') || finalCategory === 'news') {
      folder = 'fishery_college/news';
    } else if (url.includes('/gallery') || finalCategory === 'gallery') {
      folder = 'fishery_college/gallery';
    } else if (url.includes('/faculty/upload') || finalCategory === 'faculty') {
      folder = 'fishery_college/faculty';
    } else if (url.includes('/research/upload') || finalCategory === 'research') {
      folder = 'fishery_college/research';
    } else if (finalCategory === 'dean') {
      folder = 'fishery_college/dean';
    } else if (finalCategory === 'resumes') {
      folder = 'fishery_college/resumes';
    } else if (finalCategory === 'programs') {
      folder = 'fishery_college/programs';
    } else if (finalCategory === 'farmers') {
      folder = 'fishery_college/farmers';
    } else if (finalCategory === 'infrastructure') {
      folder = 'fishery_college/infrastructure';
    } else if (finalCategory === 'slideshow') {
      folder = 'fishery_college/slideshow';
    } else if (file.mimetype.startsWith('application/')) {
      folder = 'fishery_college/documents';
    }

    // Return the configuration for this file
    const config = {
      folder: folder,
      resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
      public_id: path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now()
    };
    
    if (config.resource_type === 'image') {
      config.allowed_formats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    }
    
    return config;
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  if (mimeType.startsWith('image/')) {
    cb(null, true);
  } else if (mimeType.startsWith('application/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = Math.round((parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024) / (1024 * 1024));
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${maxSizeMB}MB.`
      });
    }
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Delete file helper function (Adapted for Cloudinary)
const deleteFile = async (publicIdOrPath) => {
  try {
    if (!publicIdOrPath) return false;
    
    // In production (Cloudinary), we use the public_id
    // But we need to handle local paths too for backward compatibility
    if (publicIdOrPath.startsWith('uploads/')) {
       if (fs.existsSync(publicIdOrPath)) {
         fs.unlinkSync(publicIdOrPath);
         return true;
       }
       return false;
    }

    // If it's a full Cloudinary URL, extract the public_id
    let publicId = publicIdOrPath;
    if (publicIdOrPath.includes('res.cloudinary.com')) {
      const parts = publicIdOrPath.split('/');
      const filenameWithExtension = parts[parts.length - 1];
      const folder = parts[parts.length - 2];
      const subfolder = parts[parts.length - 3];
      // Handles 'fishery_college/folder/id' or similar
      const publicIdWithPossibleFolders = publicIdOrPath.split('/upload/')[1].split('/').slice(1).join('/');
      publicId = publicIdWithPossibleFolders.split('.')[0];
    }

    // Cloudinary deletion
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  upload,
  handleMulterError,
  deleteFile
};

module.exports = {
  upload,
  handleMulterError,
  deleteFile
};




