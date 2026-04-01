import React, { useState } from 'react'
import { Briefcase, Users, GraduationCap, Mail, Phone, User, FileText, Upload, Send, CheckCircle, XCircle } from 'lucide-react'
import Section, { SectionHeader } from '../components/common/Section'
import Card from '../components/common/Card'
import { toast } from 'react-hot-toast'
import { placementAPI } from '../services/api'

const Placement = () => {
  const [activeTab, setActiveTab] = useState('join-us')
  const [loading, setLoading] = useState(false)

  // Form states
  const [joinUsForm, setJoinUsForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume: null,
    message: ''
  })

  const [careersForm, setCareersForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPosition: '',
    department: '',
    yearsExperience: '',
    resume: null,
    message: ''
  })

  const [internshipForm, setInternshipForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    duration: '',
    resume: null,
    message: ''
  })

  const tabs = [
    {
      id: 'join-us',
      label: 'Join Us Now',
      icon: Users,
      description: 'Apply for immediate job openings'
    },
    {
      id: 'careers',
      label: 'Careers',
      icon: Briefcase,
      description: 'Explore long-term career opportunities'
    },
    {
      id: 'internship',
      label: 'Internship',
      icon: GraduationCap,
      description: 'Apply for internship programs'
    }
  ]

  const handleFileChange = (e, formType) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only PDF or Word documents')
        return
      }
      // Validate file size (5MB max)
      const maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default
      const maxFileSizeMB = Math.round(maxFileSize / (1024 * 1024));
      if (file.size > maxFileSize) {
        toast.error(`File size should be less than ${maxFileSizeMB}MB`)
        return
      }

      if (formType === 'join-us') {
        setJoinUsForm(prev => ({ ...prev, resume: file }))
      } else if (formType === 'careers') {
        setCareersForm(prev => ({ ...prev, resume: file }))
      } else if (formType === 'internship') {
        setInternshipForm(prev => ({ ...prev, resume: file }))
      }
    }
  }

  const handleSubmit = async (e, formType) => {
    e.preventDefault()
    setLoading(true)

    let formData = new FormData()
    let currentForm

    if (formType === 'join-us') {
      currentForm = joinUsForm
    } else if (formType === 'careers') {
      currentForm = careersForm
    } else if (formType === 'internship') {
      currentForm = internshipForm
    }

    // Append form fields
    Object.keys(currentForm).forEach(key => {
      if (key === 'resume' && currentForm[key]) {
        formData.append('resume', currentForm[key])
      } else if (key !== 'resume') {
        formData.append(key, currentForm[key])
      }
    })

    formData.append('type', formType)

    try {
      const response = await placementAPI.submit(formData)
      const data = response.data

      if (data.success) {
        toast.success('Application submitted successfully! We will get back to you soon.')
        // Reset form
        if (formType === 'join-us') {
          setJoinUsForm({
            name: '',
            email: '',
            phone: '',
            position: '',
            experience: '',
            resume: null,
            message: ''
          })
        } else if (formType === 'careers') {
          setCareersForm({
            name: '',
            email: '',
            phone: '',
            currentPosition: '',
            department: '',
            yearsExperience: '',
            resume: null,
            message: ''
          })
        } else if (formType === 'internship') {
          setInternshipForm({
            name: '',
            email: '',
            phone: '',
            college: '',
            course: '',
            year: '',
            duration: '',
            resume: null,
            message: ''
          })
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMsg = error.response?.data?.message || 'Failed to submit application. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const renderJoinUsForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'join-us')} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="join-name"
              type="text"
              required
              value={joinUsForm.name}
              onChange={(e) => setJoinUsForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="join-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="join-email"
              type="email"
              required
              value={joinUsForm.email}
              onChange={(e) => setJoinUsForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="join-phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="join-phone"
              type="tel"
              required
              value={joinUsForm.phone}
              onChange={(e) => setJoinUsForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="join-position" className="block text-sm font-medium text-gray-700 mb-2">
            Position Applied For *
          </label>
          <select
            id="join-position"
            required
            value={joinUsForm.position}
            onChange={(e) => setJoinUsForm(prev => ({ ...prev, position: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Position</option>
            <option value="faculty">Faculty Position</option>
            <option value="research-associate">Research Associate</option>
            <option value="lab-technician">Lab Technician</option>
            <option value="extension-officer">Extension Officer</option>
            <option value="administrative">Administrative Staff</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="join-experience" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <select
            id="join-experience"
            value={joinUsForm.experience}
            onChange={(e) => setJoinUsForm(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Experience</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div>
          <label htmlFor="join-resume" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume *
          </label>
          <div className="relative">
            <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="join-resume"
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'join-us')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload PDF or Word document (Max 5MB)</p>
        </div>
      </div>

      <div>
        <label htmlFor="join-message" className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter / Message
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="join-message"
            rows={4}
            value={joinUsForm.message}
            onChange={(e) => setJoinUsForm(prev => ({ ...prev, message: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about yourself and why you want to join us..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Application
          </>
        )}
      </button>
    </form>
  )

  const renderCareersForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'careers')} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="careers-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="careers-name"
              type="text"
              required
              value={careersForm.name}
              onChange={(e) => setCareersForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="careers-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="careers-email"
              type="email"
              required
              value={careersForm.email}
              onChange={(e) => setCareersForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="careers-phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="careers-phone"
              type="tel"
              required
              value={careersForm.phone}
              onChange={(e) => setCareersForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="careers-current-position" className="block text-sm font-medium text-gray-700 mb-2">
            Current Position
          </label>
          <input
            id="careers-current-position"
            type="text"
            value={careersForm.currentPosition}
            onChange={(e) => setCareersForm(prev => ({ ...prev, currentPosition: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your current job title"
          />
        </div>

        <div>
          <label htmlFor="careers-department" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Department *
          </label>
          <select
            id="careers-department"
            required
            value={careersForm.department}
            onChange={(e) => setCareersForm(prev => ({ ...prev, department: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            <option value="fishery-science">Fishery Science</option>
            <option value="aquaculture">Aquaculture</option>
            <option value="fish-processing">Fish Processing Technology</option>
            <option value="extension">Extension & Outreach</option>
            <option value="research">Research & Development</option>
            <option value="administration">Administration</option>
          </select>
        </div>

        <div>
          <label htmlFor="careers-experience" className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <select
            id="careers-experience"
            required
            value={careersForm.yearsExperience}
            onChange={(e) => setCareersForm(prev => ({ ...prev, yearsExperience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="2-5">2-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10-15">10-15 years</option>
            <option value="15+">15+ years</option>
          </select>
        </div>

        <div>
          <label htmlFor="careers-resume" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume *
          </label>
          <div className="relative">
            <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="careers-resume"
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'careers')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload PDF or Word document (Max 5MB)</p>
        </div>
      </div>

      <div>
        <label htmlFor="careers-message" className="block text-sm font-medium text-gray-700 mb-2">
          Career Goals & Message
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="careers-message"
            rows={4}
            value={careersForm.message}
            onChange={(e) => setCareersForm(prev => ({ ...prev, message: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about your career goals and why you're interested in long-term opportunities with us..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Application
          </>
        )}
      </button>
    </form>
  )

  const renderInternshipForm = () => (
    <form onSubmit={(e) => handleSubmit(e, 'internship')} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="intern-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="intern-name"
              type="text"
              required
              value={internshipForm.name}
              onChange={(e) => setInternshipForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="intern-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="intern-email"
              type="email"
              required
              value={internshipForm.email}
              onChange={(e) => setInternshipForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="intern-phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="intern-phone"
              type="tel"
              required
              value={internshipForm.phone}
              onChange={(e) => setInternshipForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="intern-college" className="block text-sm font-medium text-gray-700 mb-2">
            College/University *
          </label>
          <input
            id="intern-college"
            type="text"
            required
            value={internshipForm.college}
            onChange={(e) => setInternshipForm(prev => ({ ...prev, college: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your college/university name"
          />
        </div>

        <div>
          <label htmlFor="intern-course" className="block text-sm font-medium text-gray-700 mb-2">
            Course/Program *
          </label>
          <select
            id="intern-course"
            required
            value={internshipForm.course}
            onChange={(e) => setInternshipForm(prev => ({ ...prev, course: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Course</option>
            <option value="b-fishery-science">B.F.Sc (Fishery Science)</option>
            <option value="m-fishery-science">M.F.Sc (Fishery Science)</option>
            <option value="biotechnology">Biotechnology</option>
            <option value="aquaculture">Aquaculture</option>
            <option value="marine-science">Marine Science</option>
            <option value="food-technology">Food Technology</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="intern-year" className="block text-sm font-medium text-gray-700 mb-2">
            Current Year/Semester *
          </label>
          <select
            id="intern-year"
            required
            value={internshipForm.year}
            onChange={(e) => setInternshipForm(prev => ({ ...prev, year: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Year</option>
            <option value="1st-year">1st Year</option>
            <option value="2nd-year">2nd Year</option>
            <option value="3rd-year">3rd Year</option>
            <option value="4th-year">4th Year</option>
            <option value="final-year">Final Year</option>
            <option value="masters">Master's</option>
          </select>
        </div>

        <div>
          <label htmlFor="intern-duration" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Duration *
          </label>
          <select
            id="intern-duration"
            required
            value={internshipForm.duration}
            onChange={(e) => setInternshipForm(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Duration</option>
            <option value="1-month">1 Month</option>
            <option value="2-months">2 Months</option>
            <option value="3-months">3 Months</option>
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
          </select>
        </div>

        <div>
          <label htmlFor="intern-resume" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume *
          </label>
          <div className="relative">
            <Upload className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="intern-resume"
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'internship')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload PDF or Word document (Max 5MB)</p>
        </div>
      </div>

      <div>
        <label htmlFor="intern-message" className="block text-sm font-medium text-gray-700 mb-2">
          Why do you want to intern with us?
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="intern-message"
            rows={4}
            value={internshipForm.message}
            onChange={(e) => setInternshipForm(prev => ({ ...prev, message: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about your interests, what you hope to learn, and how this internship aligns with your career goals..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Application
          </>
        )}
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-left">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-green-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/4 w-44 h-44 bg-blue-300 rounded-full blur-4xl"></div>
        </div>
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Career/placement themed shapes */}
          <div className="absolute top-20 right-20 w-8 h-12 bg-white/10 rounded animate-float transform rotate-12" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-24 left-24 w-10 h-6 bg-cyan-300/15 rounded-full animate-float transform -rotate-12" style={{animationDelay: '2s'}}></div>
          
          {/* Professional bubbles */}
          <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Explore career opportunities, apply for positions, and kickstart your journey with internships at College of Fishery, Jabalpur
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm">Placement Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Partner Organizations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm">Students Placed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 right-16 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-28 h-28 bg-purple-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-indigo-400 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating career elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-8 h-6 bg-blue-200/15 rounded-full animate-float transform rotate-6" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 right-24 w-6 h-8 bg-purple-200/20 rounded animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-10 h-4 bg-indigo-200/15 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-8 bg-white rounded-2xl p-2 shadow-sm">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Form Content */}
          <Card className="max-w-4xl mx-auto p-8 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden group">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
            <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-bounce" style={{animationDelay: '1s'}}></div>
            
            {activeTab === 'join-us' && (
              <div>
                <div className="text-center mb-8">
                  <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Us Now</h2>
                  <p className="text-gray-600">
                    Apply for immediate job openings at College of Fishery, Jabalpur. We're always looking for passionate individuals to join our team.
                  </p>
                </div>
                {renderJoinUsForm()}
              </div>
            )}

            {activeTab === 'careers' && (
              <div>
                <div className="text-center mb-8">
                  <Briefcase className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Opportunities</h2>
                  <p className="text-gray-600">
                    Explore long-term career opportunities and build your professional journey with us. We offer growth-oriented positions across various departments.
                  </p>
                </div>
                {renderCareersForm()}
              </div>
            )}

            {activeTab === 'internship' && (
              <div>
                <div className="text-center mb-8">
                  <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Internship Programs</h2>
                  <p className="text-gray-600">
                    Gain practical experience and enhance your skills through our comprehensive internship programs. Perfect for students and recent graduates.
                  </p>
                </div>
                {renderInternshipForm()}
              </div>
            )}
          </Card>


        </div>
      </Section>
    </div>
  )
}

export default Placement
