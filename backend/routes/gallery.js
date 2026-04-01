const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const { upload, deleteFile } = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;

// Get all gallery images (public route)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const images = await Gallery.find(query)
      .populate('uploadedBy', 'username')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    console.log('Public gallery fetch request');
    console.log(`Found ${images.length} images for public`);
    
    // Debug: Log first few images' data
    if (images.length > 0) {
      console.log('Public gallery sample data:', JSON.stringify(images.slice(0, 2), null, 2));
    }

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery images'
    });
  }
});

// Admin route to get all gallery images (protected route)
router.get('/admin/all', protect, async (req, res) => {
  try {
    console.log('Admin gallery fetch request');
    const { category, status } = req.query;
    
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const images = await Gallery.find(query)
      .populate('uploadedBy', 'username')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    console.log(`Found ${images.length} images for admin`);
    
    // Debug: Log first few images' data
    if (images.length > 0) {
      console.log('Sample image data:', JSON.stringify(images.slice(0, 2), null, 2));
    }

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching admin gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery images'
    });
  }
});

// Create new gallery image (protected route)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Gallery upload request received');
    console.log('File:', req.file ? req.file.filename : 'No file');
    console.log('Body:', req.body);
    console.log('Admin:', req.admin ? req.admin._id : 'No admin');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const { title, description, category, tags, order } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
      });
    }

    const imageUrl = req.file.path;
    const imagePath = req.file.path;
    
    console.log('Image uploaded to Cloudinary:', imageUrl);

    const galleryImage = new Gallery({
      title,
      description,
      category,
      imageUrl,
      imagePath,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      order: order ? parseInt(order) : 0,
      uploadedBy: req.admin._id // Changed from req.user.id to req.admin._id
    });

    await galleryImage.save();
    await galleryImage.populate('uploadedBy', 'username'); // Changed from 'name' to 'username'

    console.log('Gallery image saved successfully:', galleryImage._id);

    res.status(201).json({
      success: true,
      data: galleryImage,
      message: 'Gallery image uploaded successfully'
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    
    // Delete uploaded file from Cloudinary if database save fails
    if (req.file && req.file.path) {
      try {
        await deleteFile(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload gallery image'
    });
  }
});

// Update gallery image (protected route)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Gallery update request received for ID:', req.params.id);
    
    const { title, description, category, tags, order, isActive } = req.body;
    
    const updateData = {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      order: order ? parseInt(order) : 0,
      isActive: isActive === 'true' || isActive === true
    };
    
    // If new image is uploaded, update the image fields
    if (req.file) {
      // Delete old image file if it exists
      const existingGallery = await Gallery.findById(req.params.id);
      if (existingGallery && existingGallery.imageUrl) {
        await deleteFile(existingGallery.imageUrl);
      }
      
      updateData.imageUrl = req.file.path;
      updateData.imagePath = req.file.path;
      
      console.log('Updated image Cloudinary URL:', updateData.imageUrl);
    }
    
    const galleryImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username');
    
    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        error: 'Gallery image not found'
      });
    }
    
    console.log('Gallery image updated successfully:', galleryImage._id);
    
    res.json({
      success: true,
      data: galleryImage,
      message: 'Gallery image updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update gallery image'
    });
  }
});

// Delete gallery image (protected route)
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('Gallery delete request received for ID:', req.params.id);
    
    const galleryImage = await Gallery.findById(req.params.id);
    
    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        error: 'Gallery image not found'
      });
    }
    
    // Delete the physical file from Cloudinary
    if (galleryImage.imageUrl) {
      await deleteFile(galleryImage.imageUrl);
    }
    
    // Delete from database
    await Gallery.findByIdAndDelete(req.params.id);
    
    console.log('Gallery image deleted successfully:', req.params.id);
    
    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete gallery image'
    });
  }
});

module.exports = router;





