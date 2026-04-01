const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { queueEmail } = require('../services/emailQueue')
require('dotenv').config()

const router = express.Router()

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Placement route is working!', timestamp: new Date().toISOString() })
})

const { upload, deleteFile } = require('../middleware/upload');



// Email templates
const createEmailTemplate = (type, formData) => {
  const commonHeader = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">College of Fishery, Jabalpur</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New ${type} Application Received</p>
      </div>
      <div style="padding: 30px; background: white;">
  `

  const commonFooter = `
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
        <p style="margin: 0;">This is an automated email from the College of Fishery placement portal.</p>
        <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
      </div>
    </div>
  `

  let content = ''
  let subject = ''

  switch (type) {
    case 'join-us':
      subject = `New Job Application - ${formData.name} - ${formData.position}`
      content = `
        <h2 style="color: #3B82F6; margin-bottom: 20px;">Job Application Details</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${formData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${formData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Position:</td>
              <td style="padding: 8px 0;">${formData.position}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Experience:</td>
              <td style="padding: 8px 0;">${formData.experience || 'Not specified'}</td>
            </tr>
          </table>
        </div>
        ${formData.message ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Cover Letter:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${formData.message}</div>
          </div>
        ` : ''}
      `
      break

    case 'careers':
      subject = `New Career Application - ${formData.name} - ${formData.department}`
      content = `
        <h2 style="color: #10B981; margin-bottom: 20px;">Career Application Details</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${formData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${formData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Current Position:</td>
              <td style="padding: 8px 0;">${formData.currentPosition || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Preferred Dept:</td>
              <td style="padding: 8px 0;">${formData.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Experience:</td>
              <td style="padding: 8px 0;">${formData.yearsExperience}</td>
            </tr>
          </table>
        </div>
        ${formData.message ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Career Goals & Message:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${formData.message}</div>
          </div>
        ` : ''}
      `
      break

    case 'internship':
      subject = `New Internship Application - ${formData.name} - ${formData.course}`
      content = `
        <h2 style="color: #8B5CF6; margin-bottom: 20px;">Internship Application Details</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${formData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${formData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${formData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">College:</td>
              <td style="padding: 8px 0;">${formData.college}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Course:</td>
              <td style="padding: 8px 0;">${formData.course}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Current Year:</td>
              <td style="padding: 8px 0;">${formData.year}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0;">${formData.duration}</td>
            </tr>
          </table>
        </div>
        ${formData.message ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${formData.message}</div>
          </div>
        ` : ''}
      `
      break
  }

  return {
    subject,
    html: commonHeader + content + commonFooter
  }
}

// Applicant confirmation email templates
const createApplicantEmailTemplate = (type, formData) => {
  const commonHeader = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">✓ Application Received!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">College of Fishery, Jabalpur</p>
      </div>
      <div style="padding: 30px; background: white;">
  `

  const commonFooter = `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong style="color: #92400e;">📞 Need Help?</strong><br>
          <span style="color: #78350f;">If you have any questions, contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #3B82F6;">${process.env.ADMIN_EMAIL}</a></span>
        </div>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
        <p style="margin: 0;"><strong>College of Fishery, Jabalpur</strong></p>
        <p style="margin: 5px 0 0 0;">Building careers in fisheries and aquaculture</p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated confirmation email.</p>
      </div>
    </div>
  `

  let content = ''
  let subject = ''
  let typeLabel = ''
  let color = ''

  switch (type) {
    case 'join-us':
      subject = 'Job Application Received - College of Fishery'
      typeLabel = 'Job Application'
      color = '#3B82F6'
      content = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
          <h2 style="color: ${color}; margin: 0;">Thank You, ${formData.name}!</h2>
        </div>
        <p style="text-align: center; font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          We have successfully received your job application. We appreciate your interest in joining our team!
        </p>
        <div style="background: #f0f9ff; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: ${color}; margin-top: 0;">📋 Application Summary</h3>
          <p><strong>Position Applied:</strong> ${formData.position}</p>
          <p><strong>Experience:</strong> ${formData.experience || 'Not specified'}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
        </div>
      `
      break

    case 'careers':
      subject = 'Career Application Received - College of Fishery'
      typeLabel = 'Career Application'
      color = '#10B981'
      content = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
          <h2 style="color: ${color}; margin: 0;">Thank You, ${formData.name}!</h2>
        </div>
        <p style="text-align: center; font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          We have successfully received your career application. We're excited about the possibility of you joining our team!
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: ${color}; margin-top: 0;">📋 Application Summary</h3>
          <p><strong>Preferred Department:</strong> ${formData.department}</p>
          <p><strong>Experience:</strong> ${formData.yearsExperience}</p>
          <p><strong>Current Position:</strong> ${formData.currentPosition || 'Not specified'}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
        </div>
      `
      break

    case 'internship':
      subject = 'Internship Application Received - College of Fishery'
      typeLabel = 'Internship Application'
      color = '#8B5CF6'
      content = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
          <h2 style="color: ${color}; margin: 0;">Thank You, ${formData.name}!</h2>
        </div>
        <p style="text-align: center; font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          We have successfully received your internship application. We're thrilled about your interest in learning with us!
        </p>
        <div style="background: #faf5ff; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: ${color}; margin-top: 0;">📋 Application Summary</h3>
          <p><strong>College/University:</strong> ${formData.college}</p>
          <p><strong>Course:</strong> ${formData.course}</p>
          <p><strong>Current Year:</strong> ${formData.year}</p>
          <p><strong>Duration:</strong> ${formData.duration}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
        </div>
      `
      break
  }

  const nextSteps = `
    <div style="background: white; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #374151; margin-top: 0;">🚀 What Happens Next?</h3>
      <div style="padding: 12px; margin: 10px 0; background: #f3f4f6; border-radius: 6px; border-left: 4px solid ${color};">
        <strong>1. Review Period (3-5 Days)</strong><br>
        Our HR team will carefully review your application and qualifications.
      </div>
      <div style="padding: 12px; margin: 10px 0; background: #f3f4f6; border-radius: 6px; border-left: 4px solid ${color};">
        <strong>2. Shortlisting</strong><br>
        Qualified candidates will be shortlisted based on requirements.
      </div>
      <div style="padding: 12px; margin: 10px 0; background: #f3f4f6; border-radius: 6px; border-left: 4px solid ${color};">
        <strong>3. Interview Invitation</strong><br>
        Shortlisted candidates will be contacted for an interview.
      </div>
      <div style="padding: 12px; margin: 10px 0; background: #f3f4f6; border-radius: 6px; border-left: 4px solid ${color};">
        <strong>4. Final Decision</strong><br>
        You'll be notified about the outcome via email or phone.
      </div>
    </div>
  `

  return {
    subject,
    html: commonHeader + content + nextSteps + commonFooter
  }
}

// POST route for form submission
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    console.log('Received placement submission:', {
      type: req.body.type,
      hasFile: !!req.file,
      body: req.body
    })

    const { type } = req.body

    if (!type) {
      return res.status(400).json({ message: 'Application type is required' })
    }

    // Validate required fields based on type
    let requiredFields = ['name', 'email', 'phone']
    
    switch (type) {
      case 'join-us':
        requiredFields.push('position')
        break
      case 'careers':
        requiredFields.push('department', 'yearsExperience')
        break
      case 'internship':
        requiredFields.push('college', 'course', 'year', 'duration')
        break
      default:
        return res.status(400).json({ message: 'Invalid application type' })
    }

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !req.body[field])
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      })
    }

    // Check for resume file
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' })
    }

    // Create email template
    console.log('Creating email template for type:', type)
    const adminEmailTemplate = createEmailTemplate(type, req.body)
    const applicantEmailTemplate = createApplicantEmailTemplate(type, req.body)

    // Admin email options
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      attachments: [
        {
          filename: `Resume_${req.body.name.replace(/\s+/g, '_')}_${Date.now()}${path.extname(req.file.originalname)}`,
          path: req.file.path
        }
      ]
    }

    // Applicant confirmation email options
    const applicantMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: req.body.email,
      subject: applicantEmailTemplate.subject,
      html: applicantEmailTemplate.html
    }

    console.log('Queueing emails to HR and applicant...')
    // Queue both emails (non-blocking)
    const [adminJobId, applicantJobId] = await Promise.all([
      queueEmail(adminMailOptions),
      queueEmail(applicantMailOptions)
    ])
    console.log(`Emails queued successfully - Admin: ${adminJobId}, Applicant: ${applicantJobId}`)

    // Optionally, you can also save the application to a database here
    // For now, we'll just send the email

    // Clean up uploaded file (optional - you might want to keep it)
    // fs.unlinkSync(req.file.path)

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Check your email for confirmation.'
    })

  } catch (error) {
    console.error('Error processing placement application:', error)
    console.error('Stack trace:', error.stack)
    
    // Clean up uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        await deleteFile(req.file.path)
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError)
      }
    }

    if (error.message === 'Only PDF and Word documents are allowed') {
      return res.status(400).json({ message: error.message })
    }

    // Check for specific email errors
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      console.error('Email authentication or connection error:', error.message)
      return res.status(500).json({ 
        message: 'Email service unavailable. Please try again later or contact support directly.' 
      })
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application. Please try again.',
      error: error.message,
      stack: error.stack
    })
  }
})

// GET route to fetch placement statistics (optional)
router.get('/stats', async (req, res) => {
  try {
    // This would typically come from a database
    // For now, returning static data
    const stats = {
      totalApplications: 156,
      monthlyApplications: 23,
      placementRate: 95,
      partnerOrganizations: 52,
      studentsPlaced: 201,
      averageSalary: '4.5 LPA',
      topRecruiters: [
        'ICAR Research Institutes',
        'State Fishery Departments',
        'Private Aquaculture Companies',
        'Feed Manufacturing Companies',
        'Processing Units'
      ]
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching placement stats:', error)
    res.status(500).json({ message: 'Failed to fetch statistics' })
  }
})

module.exports = router
