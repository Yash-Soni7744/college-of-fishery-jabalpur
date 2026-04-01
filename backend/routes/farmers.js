const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const FarmerResource = require('../models/FarmerResource')
const { protect, adminOnly } = require('../middleware/auth')
const { queueEmail } = require('../services/emailQueue')

const { upload, deleteFile } = require('../middleware/upload');



// Advisory Services Endpoint
router.post('/advisory', async (req, res) => {
  try {
    const { name, email, phone, query, category } = req.body
    
    // Validate required fields
    if (!name || !email || !query) {
      return res.status(400).json({ 
        message: 'Name, email, and query are required fields' 
      })
    }

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'admin@fisherycollegejabalpur.edu.in',
      subject: `New Advisory Query - ${category || 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">New Advisory Query Received</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Farmer Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Category:</strong></td>
                  <td style="padding: 8px 0;">${category || 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">Query Details</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; line-height: 1.6;">${query}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px;">Please respond to the farmer at the earliest.</p>
          </div>
        </div>
      `
    }

    // Confirmation email to farmer
    const farmerMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Advisory Query Received - CoF Jabalpur',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Query Received Successfully</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">College of Fishery, Jabalpur</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Dear ${name},</p>
              <p style="color: #4b5563; line-height: 1.6;">
                Thank you for reaching out to us through our Farmers' Corner Advisory Services. 
                We have successfully received your query and our experts are reviewing it.
              </p>
              
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1e40af;">Your Query Summary:</h4>
                <p style="margin-bottom: 0; color: #1f2937;"><strong>Category:</strong> ${category || 'General'}</p>
                <p style="margin: 10px 0 0 0; color: #4b5563; font-style: italic;">"${query.substring(0, 150)}${query.length > 150 ? '...' : ''}"</p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Our subject matter experts will review your query and provide a comprehensive response within 24-48 hours. 
                You will receive the expert advice directly to this email address.
              </p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">Need Immediate Assistance?</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                <div style="flex: 1; min-width: 200px;">
                  <p style="margin: 5px 0; color: #4b5563;"><strong>📞 Helpline:</strong> 1800-123-4567</p>
                  <p style="margin: 5px 0; color: #4b5563;"><strong>📱 WhatsApp:</strong> +91 98765 43210</p>
                  <p style="margin: 5px 0; color: #4b5563;"><strong>✉️ Email:</strong> support@fisherycollegejabalpur.edu.in</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>Advisory Services Team</strong><br>
              College of Fishery, Jabalpur
            </p>
          </div>
        </div>
      `
    }

    // Queue emails
    await Promise.all([
      queueEmail(adminMailOptions),
      queueEmail(farmerMailOptions)
    ])

    res.status(200).json({ 
      success: true,
      message: 'Advisory query submitted successfully. You will receive a response within 24-48 hours.' 
    })

  } catch (error) {
    console.error('Error submitting advisory query:', error)
    res.status(500).json({ 
      message: 'Failed to submit advisory query. Please try again.' 
    })
  }
})

// Training Registration Endpoint
router.post('/training', async (req, res) => {
  try {
    const { name, email, phone, program, experience, expectations } = req.body
    
    // Validate required fields
    if (!name || !email || !program) {
      return res.status(400).json({ 
        message: 'Name, email, and program selection are required fields' 
      })
    }

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'training@fisherycollegejabalpur.edu.in',
      subject: `New Training Registration - ${program}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">New Training Registration</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Participant Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Program:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>${program}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Experience Level:</strong></td>
                  <td style="padding: 8px 0;">${experience || 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            ${expectations ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">Expectations from Training</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; line-height: 1.6;">${expectations}</p>
              </div>
            </div>
            ` : ''}
          </div>
          
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px;">Please confirm the registration and send joining instructions.</p>
          </div>
        </div>
      `
    }

    // Confirmation email to participant
    const participantMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Training Registration Confirmed - CoF Jabalpur',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Registration Confirmed</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">College of Fishery, Jabalpur</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Dear ${name},</p>
              <p style="color: #4b5563; line-height: 1.6;">
                Congratulations! Your registration for the training program has been successfully confirmed.
              </p>
              
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #047857;">Training Program Details</h3>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Program:</strong> ${program}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Venue:</strong> College of Fishery, Jabalpur</p>
                <p style="margin: 5px 0; color: #4b5563;">Detailed joining instructions and schedule will be sent to you within 2-3 working days.</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Important:</strong> Please keep checking your email for further updates and joining instructions. 
                  Also check your spam/junk folder if you don't receive emails in your inbox.
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                We look forward to having you in our training program. If you have any questions, 
                please don't hesitate to contact our training coordinator.
              </p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">What to Expect</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Expert-led sessions by experienced faculty</li>
                <li>Hands-on practical training</li>
                <li>Course materials and resources</li>
                <li>Certificate of completion</li>
                <li>Networking opportunities</li>
              </ul>
              
              <h3 style="color: #1f2937;">Contact Information</h3>
              <p style="margin: 5px 0; color: #4b5563;"><strong>📞 Training Coordinator:</strong> +91 761-2681367</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>✉️ Email:</strong> training@fisherycollegejabalpur.edu.in</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>📱 WhatsApp:</strong> +91 98765 43210</p>
            </div>
          </div>
          
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>Training & Development Team</strong><br>
              College of Fishery, Jabalpur
            </p>
          </div>
        </div>
      `
    }

    // Queue emails
    await Promise.all([
      queueEmail(adminMailOptions),
      queueEmail(participantMailOptions)
    ])

    res.status(200).json({ 
      success: true,
      message: 'Training registration successful! You will receive joining instructions via email within 2-3 working days.' 
    })

  } catch (error) {
    console.error('Error submitting training registration:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit training registration. Please try again.' 
    })
  }
})

// ========== FARMER RESOURCES MANAGEMENT ==========

// Get all farmer resources (public endpoint)
router.get('/resources', async (req, res) => {
  try {
    const { category } = req.query
    
    const query = { isActive: true }
    if (category) {
      query.category = category
    }
    
    const resources = await FarmerResource.find(query)
      .select('title description filename originalName fileSize category createdAt downloadCount')
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name')
    
    res.json({
      success: true,
      data: {
        resources
      }
    })
  } catch (error) {
    console.error('Get farmer resources error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer resources'
    })
  }
})

// Get single farmer resource by ID (public endpoint)
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await FarmerResource.findById(req.params.id)
      .populate('uploadedBy', 'name')
    
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
    
    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Get farmer resource error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer resource'
    })
  }
})

// Download farmer resource (public endpoint)
router.get('/resources/:id/download', async (req, res) => {
  try {
    const resource = await FarmerResource.findById(req.params.id)
    
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
    
    if (!resource.filename) {
      return res.status(404).json({
        success: false,
        message: 'File URL not found in database'
      })
    }
    
    // Increment download count
    await FarmerResource.findByIdAndUpdate(req.params.id, {
      $inc: { downloadCount: 1 }
    })
    
    // Redirect to Cloudinary URL
    res.redirect(resource.filename)
  } catch (error) {
    console.error('Download farmer resource error:', error)
    res.status(500).json({
      success: false,
      message: 'Error downloading resource'
    })
  }
})

// Create new farmer resource (admin only)
router.post('/resources', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  console.log('=== Farmer Resource Creation Request ===')
  console.log('Body:', req.body)
  console.log('File:', req.file)
  console.log('Admin:', req.admin ? req.admin._id : 'No admin')
  
  try {
    const { title, description, category = 'other' } = req.body
    
    if (!title || !description) {
      console.log('Missing required fields:', { title: !!title, description: !!description })
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      })
    }
    
    if (!req.file) {
      console.log('No file uploaded')
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      })
    }
    
    console.log('Creating resource with data:', {
      title: title.trim(),
      description: description.trim(),
      filename: req.file.path,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      uploadedBy: req.admin._id
    })
    
    const resource = new FarmerResource({
      title: title.trim(),
      description: description.trim(),
      filename: req.file.path,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      uploadedBy: req.admin._id
    })
    
    await resource.save()
    console.log('Resource saved successfully:', resource._id)
    
    res.status(201).json({
      success: true,
      message: 'Farmer resource created successfully',
      data: resource
    })
  } catch (error) {
    console.error('Create farmer resource error:', error)
    console.error('Error stack:', error.stack)
    
    // Clean up uploaded file from Cloudinary if database save fails
    if (req.file && req.file.path) {
      try {
        await deleteFile(req.file.path);
        console.log('Cleaned up uploaded file from Cloudinary:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating farmer resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Update farmer resource (admin only)
router.put('/resources/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body
    
    const resource = await FarmerResource.findById(req.params.id)
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
    
    // Update fields if provided
    if (title !== undefined) resource.title = title.trim()
    if (description !== undefined) resource.description = description.trim()
    if (category !== undefined) resource.category = category
    if (isActive !== undefined) resource.isActive = isActive
    
    await resource.save()
    
    res.json({
      success: true,
      message: 'Farmer resource updated successfully',
      data: resource
    })
  } catch (error) {
    console.error('Update farmer resource error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating farmer resource'
    })
  }
})

// Update farmer resource with file (admin only)
router.put('/resources/:id/file', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body
    
    const resource = await FarmerResource.findById(req.params.id)
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
    
    // Update fields if provided
    if (title !== undefined) resource.title = title.trim()
    if (description !== undefined) resource.description = description.trim()
    if (category !== undefined) resource.category = category
    if (isActive !== undefined) resource.isActive = isActive
    
    // Handle file operations
    if (req.file) {
      // New file uploaded - delete old file and update file information
      if (resource.filename) {
        await deleteFile(resource.filename);
        console.log('Deleted old file from Cloudinary:', resource.filename);
      }
      
      // Update file information
      resource.filename = req.file.path;
      resource.originalName = req.file.originalname;
      resource.fileSize = req.file.size;
      resource.mimeType = req.file.mimetype;
    }
    
    await resource.save()
    
    res.json({
      success: true,
      message: 'Farmer resource updated successfully',
      data: resource
    })
  } catch (error) {
    console.error('Update farmer resource with file error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating farmer resource'
    })
  }
})

// Delete farmer resource (admin only)
router.delete('/resources/:id', protect, adminOnly, async (req, res) => {
  try {
    const resource = await FarmerResource.findById(req.params.id)
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
    
    // Delete file from Cloudinary
    if (resource.filename) {
      await deleteFile(resource.filename);
    }
    
    // Delete from database
    await FarmerResource.findByIdAndDelete(req.params.id)
    
    res.json({
      success: true,
      message: 'Farmer resource deleted successfully'
    })
  } catch (error) {
    console.error('Delete farmer resource error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting farmer resource'
    })
  }
})

// Get all farmer resources for admin (includes inactive)
router.get('/admin/resources', protect, adminOnly, async (req, res) => {
  try {
    const { category, isActive } = req.query
    
    const query = {}
    if (category) query.category = category
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true'
    
    const resources = await FarmerResource.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
    
    res.json({
      success: true,
      data: {
        resources
      }
    })
  } catch (error) {
    console.error('Get admin farmer resources error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer resources'
    })
  }
})

// ========== EXISTING EMAIL FUNCTIONALITY ==========

module.exports = router
