const express = require('express');
const Alumni = require('../models/Alumni');
const { protect, adminOnly } = require('../middleware/auth');
const { queueEmail } = require('../services/emailQueue');
const { upload, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all alumni items
// @route   GET /api/alumni
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = { isPublished: true };
    
    if (req.query.section) {
      query.section = req.query.section;
    }

    const alumni = await Alumni.find(query)
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        alumni
      }
    });

  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alumni data'
    });
  }
});

// @desc    Get single alumni item
// @route   GET /api/alumni/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const alumniItem = await Alumni.findById(req.params.id);
    if (!alumniItem || !alumniItem.isPublished) {
      return res.status(404).json({ success: false, message: 'Alumni item not found' });
    }
    res.json({ success: true, data: { alumni: alumniItem } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create alumni item
// @route   POST /api/alumni
// @access  Private (Admin)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const alumniData = { 
      ...req.body, 
      createdBy: req.admin._id,
      image: req.file ? req.file.path : undefined 
    };
    const alumniItem = await Alumni.create(alumniData);
    res.status(201).json({ success: true, data: { alumni: alumniItem } });
  } catch (error) {
    console.error('Create alumni error:', error);
    res.status(500).json({ success: false, message: 'Server error creating alumni item' });
  }
});

// @desc    Update alumni item
// @route   PUT /api/alumni/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    let alumniItem = await Alumni.findById(req.params.id);
    if (!alumniItem) {
      return res.status(404).json({ success: false, message: 'Alumni item not found' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      if (alumniItem.image) {
        await deleteFile(alumniItem.image);
      }
      updateData.image = req.file.path;
    }

    alumniItem = await Alumni.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: { alumni: alumniItem } });
  } catch (error) {
    console.error('Update alumni error:', error);
    res.status(500).json({ success: false, message: 'Server error updating alumni item' });
  }
});

// @desc    Delete alumni item
// @route   DELETE /api/alumni/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const alumniItem = await Alumni.findById(req.params.id);
    if (!alumniItem) {
      return res.status(404).json({ success: false, message: 'Alumni item not found' });
    }

    if (alumniItem.image) {
      await deleteFile(alumniItem.image);
    }

    await Alumni.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alumni item deleted successfully' });
  } catch (error) {
    console.error('Delete alumni error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting alumni item' });
  }
});

// @desc    Register for alumni event
// @route   POST /api/alumni/register-event
// @access  Public
router.post('/register-event', async (req, res) => {
  try {
    const {
      eventId,
      eventTitle,
      name,
      email,
      phone,
      batch,
      currentOrganization,
      designation
    } = req.body;

    if (!eventId || !eventTitle || !name || !email || !phone || !batch || !currentOrganization || !designation) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `New Alumni Event Registration - ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 15px 0; padding: 12px; background: white; border-left: 4px solid #3B82F6; border-radius: 4px; }
            .label { font-weight: bold; color: #3B82F6; margin-bottom: 5px; }
            .value { color: #4b5563; }
            .event-box { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #3B82F6; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎓 New Event Registration</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Alumni Network - COF Jabalpur</p>
            </div>
            <div class="content">
              <div class="event-box">
                <h2 style="color: #1E40AF; margin: 0 0 10px 0;">Event: ${eventTitle}</h2>
              </div>
              
              <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">An alumnus has registered for the event:</p>
              
              <div class="info-row">
                <div class="label">👤 Name</div>
                <div class="value">${name}</div>
              </div>

              <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">${email}</div>
              </div>

              <div class="info-row">
                <div class="label">📱 Phone</div>
                <div class="value">${phone}</div>
              </div>

              <div class="info-row">
                <div class="label">🎓 Batch Year</div>
                <div class="value">${batch}</div>
              </div>

              <div class="info-row">
                <div class="label">🏢 Current Organization</div>
                <div class="value">${currentOrganization}</div>
              </div>

              <div class="info-row">
                <div class="label">💼 Designation</div>
                <div class="value">${designation}</div>
              </div>

              <div class="footer">
                <p><strong>Action Required:</strong> Please acknowledge this registration and add the attendee to the event list.</p>
                <p style="margin-top: 10px;">This is an automated notification from the Alumni Event Registration system.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Applicant confirmation email
    const applicantMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: `Event Registration Confirmed - ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3B82F6; }
            .info-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✓ Registration Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">College of Fishery, Jabalpur</p>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <h2 style="color: #3B82F6; text-align: center; margin-bottom: 20px;">Thank You, ${name}!</h2>
              
              <p style="text-align: center; font-size: 16px; color: #4b5563; margin-bottom: 30px;">
                Your registration for the alumni event has been confirmed. We're excited to see you there!
              </p>

              <div class="event-details">
                <h3 style="color: #1E40AF; margin-top: 0;">📋 Event Details</h3>
                <p><strong>Event:</strong> ${eventTitle}</p>
              </div>

              <div class="info-box">
                <h3 style="color: #1E40AF; margin-top: 0;">👤 Your Registration Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Batch:</strong> ${batch}</p>
                <p><strong>Organization:</strong> ${currentOrganization}</p>
                <p><strong>Designation:</strong> ${designation}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong style="color: #92400e;">📞 Important</strong><br>
                <span style="color: #78350f;">Please keep this confirmation email for your records. You may be asked to present it at the event check-in.</span>
              </div>

              <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong style="color: #065f46;">✉️ Contact Us</strong><br>
                <span style="color: #047857;">If you have any questions or need to update your registration, please contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #3B82F6;">${process.env.ADMIN_EMAIL}</a></span>
              </div>

              <div class="footer">
                <p><strong>College of Fishery, Jabalpur</strong></p>
                <p>Alumni Network - Connecting Generations</p>
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
    console.error('Alumni event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration. Please try again later.'
    });
  }
});

module.exports = router;
