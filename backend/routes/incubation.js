const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Incubation = require('../models/Incubation');
const { protect, adminOnly } = require('../middleware/auth');
const { queueEmail } = require('../services/emailQueue');

const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all incubation items (public)
// @route   GET /api/incubation
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = { isPublished: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    const incubationItems = await Incubation.find(query)
      .sort({ category: 1, order: 1, createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    const total = incubationItems.length;

    // Group by category for easier frontend consumption
    const groupedItems = {
      'activity': [],
      'governing-body': [],
      'management-committee': []
    };

    incubationItems.forEach(item => {
      if (groupedItems[item.category]) {
        groupedItems[item.category].push(item);
      }
    });

    res.json({
      success: true,
      data: {
        incubation: groupedItems,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get incubation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching incubation data'
    });
  }
});

// @desc    Get all incubation items for admin
// @route   GET /api/incubation/admin
// @access  Private (Admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const incubationItems = await Incubation.find()
      .sort({ category: 1, order: 1, createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    // Group by category
    const groupedItems = {
      'activity': [],
      'governing-body': [],
      'management-committee': []
    };

    incubationItems.forEach(item => {
      if (groupedItems[item.category]) {
        groupedItems[item.category].push(item);
      }
    });

    res.json({
      success: true,
      data: { incubation: groupedItems }
    });
  } catch (error) {
    console.error('Get admin incubation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching incubation data'
    });
  }
});

// @desc    Create new incubation item
// @route   POST /api/incubation
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      order = 0,
      isPublished = true,
      image,
      document,
      // Activity fields
      icon,
      color,
      subtitle,
      // Person fields
      name,
      position,
      designation,
      organization,
      location,
      email,
      phone,
      bio,
      expertise,
      tags
    } = req.body;

    const incubationData = {
      title,
      description,
      category,
      order: parseInt(order) || 0,
      isPublished: isPublished !== false,
      // File fields
      image,
      document
    };

    // Add category-specific fields
    if (category === 'activity') {
      if (icon) incubationData.icon = icon;
      if (color) incubationData.color = color;
      if (subtitle) incubationData.subtitle = subtitle;
    } else if (category === 'governing-body' || category === 'management-committee') {
      if (name) incubationData.name = name;
      if (position) incubationData.position = position;
      if (designation) incubationData.designation = designation;
      if (organization) incubationData.organization = organization;
      if (location) incubationData.location = location;
      if (email) incubationData.email = email;
      if (phone) incubationData.phone = phone;
      if (bio) incubationData.bio = bio;
      if (expertise && expertise.length > 0) incubationData.expertise = expertise;
    }

    if (tags && tags.length > 0) incubationData.tags = tags;

    const incubationItem = await Incubation.create(incubationData);

    res.status(201).json({
      success: true,
      data: incubationItem,
      message: 'Incubation item created successfully'
    });
  } catch (error) {
    console.error('Create incubation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating incubation item'
    });
  }
});

// @desc    Update incubation item
// @route   PUT /api/incubation/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incubation ID format'
      });
    }

    const incubationItem = await Incubation.findById(req.params.id);
    if (!incubationItem) {
      return res.status(404).json({
        success: false,
        message: 'Incubation item not found'
      });
    }

    const {
      title,
      description,
      category,
      order,
      isPublished,
      image,
      document,
      // Activity fields
      icon,
      color,
      subtitle,
      // Person fields
      name,
      position,
      designation,
      organization,
      location,
      email,
      phone,
      bio,
      expertise,
      tags
    } = req.body;

    // Update basic fields
    if (title !== undefined) incubationItem.title = title;
    if (description !== undefined) incubationItem.description = description;
    if (category !== undefined) incubationItem.category = category;
    if (order !== undefined) incubationItem.order = parseInt(order) || 0;
    if (isPublished !== undefined) incubationItem.isPublished = isPublished !== false;
    
    // Update file fields
    if (image !== undefined) incubationItem.image = image;
    if (document !== undefined) incubationItem.document = document;

    // Update category-specific fields
    if (category === 'activity' || incubationItem.category === 'activity') {
      if (icon !== undefined) incubationItem.icon = icon;
      if (color !== undefined) incubationItem.color = color;
      if (subtitle !== undefined) incubationItem.subtitle = subtitle;
    }
    
    if (category === 'governing-body' || category === 'management-committee' || 
        incubationItem.category === 'governing-body' || incubationItem.category === 'management-committee') {
      if (name !== undefined) incubationItem.name = name;
      if (position !== undefined) incubationItem.position = position;
      if (designation !== undefined) incubationItem.designation = designation;
      if (organization !== undefined) incubationItem.organization = organization;
      if (location !== undefined) incubationItem.location = location;
      if (email !== undefined) incubationItem.email = email;
      if (phone !== undefined) incubationItem.phone = phone;
      if (bio !== undefined) incubationItem.bio = bio;
      if (expertise !== undefined) incubationItem.expertise = expertise;
    }

    if (tags !== undefined) incubationItem.tags = tags;

    await incubationItem.save();

    res.json({
      success: true,
      data: incubationItem,
      message: 'Incubation item updated successfully'
    });
  } catch (error) {
    console.error('Update incubation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating incubation item'
    });
  }
});

// @desc    Delete incubation item
// @route   DELETE /api/incubation/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incubation ID format'
      });
    }

    const incubationItem = await Incubation.findById(req.params.id);
    if (!incubationItem) {
      return res.status(404).json({
        success: false,
        message: 'Incubation item not found'
      });
    }

    // Delete the physical image file from Cloudinary if it exists
    if (incubationItem.image) {
      await deleteFile(incubationItem.image);
    }

    // Delete the physical document file from Cloudinary if it exists
    if (incubationItem.document || incubationItem.filename) {
      await deleteFile(incubationItem.document || incubationItem.filename);
    }

    await Incubation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Incubation item deleted successfully'
    });
  } catch (error) {
    console.error('Delete incubation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting incubation item'
    });
  }
});

// @desc    Submit incubation program registration
// @route   POST /api/incubation/register
// @access  Public
router.post('/register', upload.single('businessPlan'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      organization,
      businessIdea,
      stage,
      fundingRequired,
      message
    } = req.body;



    // Prepare business plan attachment if provided
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        path: req.file.path
      });
    }

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `New Incubation Program Registration - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 15px 0; padding: 12px; background: white; border-left: 4px solid #7c3aed; border-radius: 4px; }
            .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
            .value { color: #4b5563; }
            .idea-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .badge { display: inline-block; background: #ddd6fe; color: #5b21b6; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">💡 New Incubation Registration</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Fisheries Incubation Program</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #4b5563;">A new applicant has registered for the incubation program:</p>
              
              <div class="info-row">
                <div class="label">👤 Applicant Name</div>
                <div class="value">${name}</div>
              </div>

              <div class="info-row">
                <div class="label">📧 Email Address</div>
                <div class="value">${email}</div>
              </div>

              <div class="info-row">
                <div class="label">📱 Phone Number</div>
                <div class="value">${phone}</div>
              </div>

              ${organization ? `
              <div class="info-row">
                <div class="label">🏢 Organization</div>
                <div class="value">${organization}</div>
              </div>
              ` : ''}

              <div class="idea-box">
                <div class="label" style="margin-bottom: 10px;">💡 Business Idea/Concept</div>
                <div class="value" style="white-space: pre-wrap;">${businessIdea}</div>
              </div>

              ${stage ? `
              <div class="info-row">
                <div class="label">📊 Business Stage</div>
                <div class="value">
                  ${stage.charAt(0).toUpperCase() + stage.slice(1)} Stage
                  <span class="badge">${stage}</span>
                </div>
              </div>
              ` : ''}

              ${fundingRequired ? `
              <div class="info-row">
                <div class="label">💰 Funding Required</div>
                <div class="value">${fundingRequired}</div>
              </div>
              ` : ''}

              ${message ? `
              <div class="idea-box">
                <div class="label" style="margin-bottom: 10px;">📝 Additional Information</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
              ` : ''}

              ${req.file ? `
              <div class="info-row">
                <div class="label">📎 Business Plan Attached</div>
                <div class="value">✓ ${req.file.originalname}</div>
              </div>
              ` : ''}

              <div class="footer">
                <p><strong>Action Required:</strong> Please review this application and contact the applicant within 3-5 working days.</p>
                <p style="margin-top: 10px;">This is an automated notification from the COF Incubation Program registration system.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments
    };

    // Email to applicant (confirmation)
    const applicantMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Incubation Program Registration Received',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #7c3aed; }
            .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { padding: 12px; margin: 10px 0; background: #f3f4f6; border-radius: 6px; border-left: 4px solid #7c3aed; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✓ Registration Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Fisheries Incubation Program</p>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <h2 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">Thank You, ${name}!</h2>
              
              <p style="text-align: center; font-size: 16px; color: #4b5563;">
                We have successfully received your incubation program registration. Your innovative idea in fisheries/aquaculture has the potential to make a real impact!
              </p>

              <div class="info-box">
                <h3 style="color: #7c3aed; margin-top: 0;">📋 Registration Summary</h3>
                <p><strong>Business Idea:</strong> ${businessIdea.substring(0, 100)}${businessIdea.length > 100 ? '...' : ''}</p>
                ${stage ? `<p><strong>Stage:</strong> ${stage.charAt(0).toUpperCase() + stage.slice(1)}</p>` : ''}
                ${fundingRequired ? `<p><strong>Funding Required:</strong> ${fundingRequired}</p>` : ''}
                ${req.file ? `<p><strong>Business Plan:</strong> ✓ Attached</p>` : ''}
              </div>

              <div class="next-steps">
                <h3 style="color: #7c3aed; margin-top: 0;">🚀 What Happens Next?</h3>
                <div class="step">
                  <strong>1. Review Period (3-5 Days)</strong><br>
                  Our team will carefully review your application and business concept.
                </div>
                <div class="step">
                  <strong>2. Initial Contact</strong><br>
                  We'll reach out via email or phone to discuss your idea further.
                </div>
                <div class="step">
                  <strong>3. Evaluation Meeting</strong><br>
                  If shortlisted, we'll schedule a meeting to explore collaboration opportunities.
                </div>
                <div class="step">
                  <strong>4. Onboarding</strong><br>
                  Upon selection, we'll guide you through our incubation program.
                </div>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong style="color: #92400e;">📞 Need Help?</strong><br>
                <span style="color: #78350f;">If you have any questions, feel free to contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #7c3aed;">${process.env.ADMIN_EMAIL}</a></span>
              </div>

              <div class="footer">
                <p><strong>College of Fisheries</strong></p>
                <p>Empowering Innovation in Fisheries & Aquaculture</p>
                <p style="margin-top: 15px; font-size: 12px;">This is an automated confirmation email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Queue both emails
    await Promise.all([
      queueEmail(adminMailOptions),
      queueEmail(applicantMailOptions)
    ]);

    res.json({
      success: true,
      message: 'Registration submitted successfully! Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Incubation registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration. Please try again later.'
    });
  }
});

module.exports = router;