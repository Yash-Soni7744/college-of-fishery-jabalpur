const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { queueEmail } = require('../services/emailQueue')

const { upload } = require('../middleware/upload');



// @route   POST /api/job-application/submit
// @desc    Submit job application form
// @access  Public
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, positionType, position, qualification, experience, message } = req.body

    console.log('Job application received:')
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('Position Type:', positionType)
    console.log('Position:', position)

    // Validation
    if (!name || !email || !phone || !position) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume'
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cof.edu.in'
    const hrEmail = process.env.HR_EMAIL || adminEmail
    const resumePath = req.file.path; // Cloudinary URL
    const resumeFilename = req.file.originalname;

    const positionTypeLabel = positionType === 'faculty' ? 'Faculty Position' : 'Staff Position'

    // Email to HR/Admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: hrEmail,
      cc: adminEmail,
      subject: `New Job Application - ${positionTypeLabel} - ${position}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
            New Job Application Received
          </h2>
          
          <div style="background-color: ${positionType === 'faculty' ? '#eff6ff' : '#f0fdf4'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${positionType === 'faculty' ? '#1e40af' : '#16a34a'};">
            <h3 style="margin-top: 0; color: #374151;">Position Details</h3>
            <p><strong>Position Type:</strong> ${positionTypeLabel}</p>
            <p><strong>Position:</strong> ${position}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Applicant Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${qualification ? `<p><strong>Qualification:</strong> ${qualification}</p>` : ''}
            ${experience ? `<p><strong>Experience:</strong> ${experience}</p>` : ''}
          </div>
          
          ${message ? `
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Cover Letter</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          ` : ''}
          
          <p style="color: #059669;">
            <strong>📎 Resume/CV: ${resumeFilename}</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message from the College of Fishery Science recruitment system.
            <br>
            Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `,
      attachments: [{
        filename: resumeFilename,
        path: resumePath
      }]
    }

    // Email to applicant (confirmation)
    const applicantMailOptions = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Application Received - College of Fishery Science',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
            Application Received Successfully
          </h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for your interest in joining the College of Fishery Science. We have received your application for the following position:</p>
          
          <div style="background-color: ${positionType === 'faculty' ? '#eff6ff' : '#f0fdf4'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${positionType === 'faculty' ? '#1e40af' : '#16a34a'};">
            <p style="margin: 0;"><strong>Position:</strong> ${position}</p>
            <p style="margin: 5px 0 0 0;"><strong>Category:</strong> ${positionTypeLabel}</p>
          </div>
          
          <p>Our HR team will review your application and contact you if your profile matches our requirements. This process typically takes 1-2 weeks.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What's Next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your application will be reviewed by our recruitment team</li>
              <li>Shortlisted candidates will be contacted for further rounds</li>
              <li>Please keep checking your email for updates</li>
            </ul>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p style="margin: 5px 0;">📧 Email: ${hrEmail}</p>
            <p style="margin: 5px 0;">📞 Phone: +91-761-2681948</p>
          </div>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Human Resources Department</strong><br>
            College of Fishery Science<br>
            Nanaji Deshmukh Veterinary Science University, Jabalpur
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      `
    }

    // Queue emails
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await Promise.all([
          queueEmail(adminMailOptions),
          queueEmail(applicantMailOptions)
        ])
        console.log('Job application emails queued successfully')
      } catch (emailError) {
        console.error('Error queueing emails:', emailError)
      }
    } else {
      console.log('Email configuration not set up. Application received but emails not sent.')
    }

    res.json({
      success: true,
      message: 'Job application submitted successfully! We will contact you soon.',
      data: {
        name,
        email,
        position,
        positionType
      }
    })

  } catch (error) {
    console.error('Error submitting job application:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit job application. Please try again later.',
      error: error.message
    })
  }
})

module.exports = router
