import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Users, Award, GraduationCap, Calendar, FileText, Upload, Save, X, Download } from 'lucide-react'
import { studentCornerAPI, uploadAPI } from '../../services/api'
import { getDocumentUrl, downloadFile } from '../../services/files'
import LoadingSpinner, { LoadingCard } from '../common/LoadingSpinner'
import Modal, { ConfirmModal } from '../common/Modal'
import { Form, FormGroup, Input, Textarea, Select, SubmitButton } from '../common/Form'
import toast from 'react-hot-toast'

const StudentCornerManagement = () => {
  // File size utility functions
  const getMaxFileSize = () => parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default
  const getMaxFileSizeMB = () => Math.round(getMaxFileSize() / (1024 * 1024));
  const validateFileSize = (file) => file.size <= getMaxFileSize();
  const getFileSizeErrorMessage = () => `File size should not exceed ${getMaxFileSizeMB()}MB`;
  const getMultipleFileSizeErrorMessage = () => `Some files exceed ${getMaxFileSizeMB()}MB limit`;
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('admission')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [admissionGuidelines, setAdmissionGuidelines] = useState([])
  const [scholarships, setScholarships] = useState([])
  const [clubs, setClubs] = useState([])

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    name: '',
    eligibility: '',
    amount: '',
    duration: '',
    role: '',
    activities: [],
    positions: [],
    benefits: [],
    guidelines: [],
    batch: '',
    currentPosition: '',
    testimonial: '',
    achievements: [],
      contact: '',
      image: '',
      pdfs: [], // Changed from single pdf to multiple pdfs
      selectedDocuments: [] // For managing existing documents
    })

  const tabs = [
    { id: 'admission', name: 'Admission Guidelines', icon: GraduationCap },
    { id: 'scholarships', name: 'Scholarships', icon: Award },
    { id: 'clubs', name: 'Student Clubs', icon: Users }
  ]

  useEffect(() => {
    fetchStudentCornerData()
  }, [])

  const fetchStudentCornerData = async () => {
    try {
      setLoading(true)
      const response = await studentCornerAPI.getAll()
      if (response.data.success) {
        const data = response.data.data
        setAdmissionGuidelines(data.admissionGuidelines || [])
        setScholarships(data.scholarships || [])
        setClubs(data.clubs || [])
      }
    } catch (error) {
      console.error('Error fetching student corner data:', error)
      toast.error('Failed to fetch student corner data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const toArray = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? v.split('\n').filter(Boolean) : [])

      // Always use FormData when dealing with multiple file uploads
      const fd = new FormData()
      fd.append('type', activeTab)
      if (formData.category) fd.append('category', formData.category)
      if (formData.description) fd.append('description', formData.description)
      if (formData.name) fd.append('name', formData.name)
      if (formData.eligibility) fd.append('eligibility', formData.eligibility)
      if (formData.amount) fd.append('amount', formData.amount)
      if (formData.duration) fd.append('duration', formData.duration)
      toArray(formData.benefits).forEach(b => fd.append('benefits', b))
      toArray(formData.guidelines).forEach(g => fd.append('guidelines', g))
      if (formData.role) fd.append('role', formData.role)
      toArray(formData.activities).forEach(a => fd.append('activities', a))
      toArray(formData.positions).forEach(p => fd.append('positions', p))
      if (typeof formData.sortOrder === 'number') fd.append('sortOrder', String(formData.sortOrder))
      if (typeof formData.isActive === 'boolean') fd.append('isActive', String(formData.isActive))
      
      // Append multiple PDF files
      if (formData.pdfs && formData.pdfs.length > 0) {
        formData.pdfs.forEach(pdf => {
          fd.append('pdfs', pdf)
        })
      }
      
      // Handle document removal for editing
      if (editingItem && formData.selectedDocuments && formData.selectedDocuments.length > 0) {
        formData.selectedDocuments.forEach(docId => {
          fd.append('removeDocuments', docId)
        })
      }

      if (editingItem) {
        await studentCornerAPI.update(editingItem._id, fd)
        toast.success('Item updated successfully')
      } else {
        await studentCornerAPI.create(fd)
        toast.success('Item created successfully')
      }

      setShowModal(false)
      resetForm()
      fetchStudentCornerData()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error(error.response?.data?.message || 'Failed to save item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      category: item.category || '',
      description: item.description || '',
      name: item.name || '',
      eligibility: item.eligibility || '',
      amount: item.amount || '',
      duration: item.duration || '',
      role: item.role || '',
      activities: Array.isArray(item.activities) ? item.activities.join('\n') : '',
      positions: Array.isArray(item.positions) ? item.positions.join('\n') : '',
      benefits: Array.isArray(item.benefits) ? item.benefits.join('\n') : '',
      guidelines: Array.isArray(item.guidelines) ? item.guidelines.join('\n') : '',
      batch: item.batch || '',
      currentPosition: item.currentPosition || '',
      testimonial: item.testimonial || '',
      achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : '',
      contact: item.contact || '',
      image: item.image || '',
      pdfs: [], // Reset to empty for new uploads
      selectedDocuments: [] // Reset document selection
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await studentCornerAPI.delete(deletingItem._id)
      toast.success('Item deleted successfully')
      setShowDeleteModal(false)
      setDeletingItem(null)
      fetchStudentCornerData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const response = await uploadAPI.single(file, 'students')
      
      if (response.data.success) {
        const filename = response.data.data.filename
        setFormData(prev => ({
          ...prev,
          image: filename
        }))
        toast.success('Image uploaded successfully')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      name: '',
      eligibility: '',
      amount: '',
      duration: '',
      role: '',
      activities: [],
      positions: [],
      benefits: [],
      guidelines: [],
      batch: '',
      currentPosition: '',
      testimonial: '',
      achievements: [],
      contact: '',
      image: '',
      pdfs: [], // Changed from pdf: null to pdfs: []
      selectedDocuments: [] // Added for document management
    })
    setEditingItem(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'admission':
        return admissionGuidelines
      case 'scholarships':
        return scholarships
      case 'clubs':
        return clubs
      default:
        return []
    }
  }

  const renderForm = () => {
    switch (activeTab) {
      case 'admission':
        return (
          <div className="space-y-6">
            <FormGroup>
              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Eligibility Criteria"
                required
              />
            </FormGroup>

            <FormGroup>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
                rows={3}
                required
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guidelines (one per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.guidelines}
                onChange={(e) => setFormData(prev => ({ ...prev, guidelines: e.target.value }))}
                placeholder="Enter each guideline on a new line&#10;Press Enter to create new lines&#10;Example:&#10;• First guideline&#10;• Second guideline&#10;• Third guideline"
                rows={6}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[150px] bg-white font-mono text-sm"
                style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>
            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Documents (multiple files supported)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return
                  
                  // Validate all files are PDFs or Word documents
                  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                  const invalidFiles = files.filter(file => !validTypes.includes(file.type))
                  if (invalidFiles.length > 0) {
                    toast.error('Please select only PDF or Word documents (DOC, DOCX)')
                    return
                  }
                  
                  // Check file sizes
                  const oversizedFiles = files.filter(file => !validateFileSize(file))
                  if (oversizedFiles.length > 0) {
                    toast.error(getMultipleFileSizeErrorMessage())
                    return
                  }
                  
                  setFormData(prev => ({ ...prev, pdfs: [...prev.pdfs, ...files] }))
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {/* Display selected new files */}
              {formData.pdfs.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">New files to upload:</p>
                  {formData.pdfs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((_, i) => i !== index)
                          }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display existing documents when editing */}
              {editingItem?.documents && editingItem.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Existing documents:</p>
                  {editingItem.documents
                    .filter(doc => !formData.selectedDocuments.includes(doc._id))
                    .map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span 
                          className="text-sm text-gray-700 truncate" 
                          title={doc.originalName}
                          style={{ maxWidth: '200px' }}
                        >
                          {doc.originalName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                        <a 
                          href={getDocumentUrl(doc.filename)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 text-xs flex-shrink-0"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this document?')) {
                            // Add to removal list
                            setFormData(prev => ({
                              ...prev,
                              selectedDocuments: [...prev.selectedDocuments, doc._id]
                            }))
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>
          </div>
        )

      case 'scholarships':
        return (
          <div className="space-y-6">
            <FormGroup>
              <Input
                label="Scholarship Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Merit-cum-Means Scholarship"
                required
              />
            </FormGroup>

            <FormGroup>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the scholarship"
                rows={3}
                required
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <Input
                  label="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g., ₹12,000 per year"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Input
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., Throughout the course"
                  required
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Textarea
                label="Eligibility"
                value={formData.eligibility}
                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                placeholder="Eligibility criteria for this scholarship"
                rows={3}
                required
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits (one per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                placeholder="Enter each benefit on a new line&#10;Press Enter to create new lines&#10;Example:&#10;• Monthly stipend&#10;• Tuition fee waiver&#10;• Library access"
                rows={5}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] bg-white font-mono text-sm"
                style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>
            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Documents (multiple files supported)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return
                  
                  // Validate all files are PDFs or Word documents
                  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                  const invalidFiles = files.filter(file => !validTypes.includes(file.type))
                  if (invalidFiles.length > 0) {
                    toast.error('Please select only PDF or Word documents (DOC, DOCX)')
                    return
                  }
                  
                  // Check file sizes
                  const oversizedFiles = files.filter(file => !validateFileSize(file))
                  if (oversizedFiles.length > 0) {
                    toast.error(getMultipleFileSizeErrorMessage())
                    return
                  }
                  
                  setFormData(prev => ({ ...prev, pdfs: [...prev.pdfs, ...files] }))
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {/* Display selected new files */}
              {formData.pdfs.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">New files to upload:</p>
                  {formData.pdfs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((_, i) => i !== index)
                          }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display existing documents when editing */}
              {editingItem?.documents && editingItem.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Existing documents:</p>
                  {editingItem.documents
                    .filter(doc => !formData.selectedDocuments.includes(doc._id))
                    .map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span 
                          className="text-sm text-gray-700 truncate" 
                          title={doc.originalName}
                          style={{ maxWidth: '200px' }}
                        >
                          {doc.originalName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                        <button 
                          type="button"
                          onClick={() => downloadFile(getDocumentUrl(doc.filename), doc.originalName)} 
                          className="text-blue-600 hover:text-blue-800 text-xs flex-shrink-0 border-none bg-transparent cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this document?')) {
                            // Add to removal list
                            setFormData(prev => ({
                              ...prev,
                              selectedDocuments: [...prev.selectedDocuments, doc._id]
                            }))
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Legacy single PDF support */}
              {editingItem?.filename && !editingItem?.documents?.length && !formData.removeLegacyPdf && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{editingItem.originalName || editingItem.filename}</span>
                      <button 
                        type="button"
                        onClick={() => downloadFile(getDocumentUrl(editingItem.filename), editingItem.originalName || editingItem.filename)} 
                        className="text-blue-600 hover:text-blue-800 text-sm border-none bg-transparent cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this document?')) {
                          setFormData(prev => ({
                            ...prev,
                            removeLegacyPdf: true
                          }))
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </FormGroup>
          </div>
        )

      case 'clubs':
        return (
          <div className="space-y-6">
            <FormGroup>
              <Input
                label="Club Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Student Council"
                required
              />
            </FormGroup>

            <FormGroup>
              <Input
                label="Role/Type"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Student Governance"
                required
              />
            </FormGroup>

            <FormGroup>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the club"
                rows={3}
                required
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities (one per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) => setFormData(prev => ({ ...prev, activities: e.target.value }))}
                placeholder="Enter each activity on a new line&#10;Press Enter to create new lines&#10;Example:&#10;• Organizing events&#10;• Student mentoring&#10;• Community service"
                rows={6}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[150px] bg-white font-mono text-sm"
                style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Positions (one per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.positions}
                onChange={(e) => setFormData(prev => ({ ...prev, positions: e.target.value }))}
                placeholder="Enter each position on a new line&#10;Press Enter to create new lines&#10;Example:&#10;• President&#10;• Vice President&#10;• Secretary"
                rows={4}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] bg-white font-mono text-sm"
                style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
              />
            </FormGroup>
            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Documents (multiple files supported)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return
                  
                  // Validate all files are PDFs or Word documents
                  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                  const invalidFiles = files.filter(file => !validTypes.includes(file.type))
                  if (invalidFiles.length > 0) {
                    toast.error('Please select only PDF or Word documents (DOC, DOCX)')
                    return
                  }
                  
                  // Check file sizes
                  const oversizedFiles = files.filter(file => !validateFileSize(file))
                  if (oversizedFiles.length > 0) {
                    toast.error(getMultipleFileSizeErrorMessage())
                    return
                  }
                  
                  setFormData(prev => ({ ...prev, pdfs: [...prev.pdfs, ...files] }))
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {/* Display selected new files */}
              {formData.pdfs.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">New files to upload:</p>
                  {formData.pdfs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((_, i) => i !== index)
                          }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display existing documents when editing */}
              {editingItem?.documents && editingItem.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Existing documents:</p>
                  {editingItem.documents
                    .filter(doc => !formData.selectedDocuments.includes(doc._id))
                    .map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span 
                          className="text-sm text-gray-700 truncate" 
                          title={doc.originalName}
                          style={{ maxWidth: '200px' }}
                        >
                          {doc.originalName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                        <a 
                          href={getDocumentUrl(doc.filename)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 text-xs flex-shrink-0"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this document?')) {
                            // Add to removal list
                            setFormData(prev => ({
                              ...prev,
                              selectedDocuments: [...prev.selectedDocuments, doc._id]
                            }))
                          }
                        }}
                        className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>
          </div>
        )

      default:
        return null
    }
  }

  const renderDataCard = (item, index) => {
    const getCardTitle = () => {
      switch (activeTab) {
        case 'admission':
          return item.category
        case 'scholarships':
        case 'clubs':
          return item.name
        default:
          return 'Item'
      }
    }

    const getCardSubtitle = () => {
      switch (activeTab) {
        case 'admission':
          return item.description
        case 'scholarships':
          return item.amount
        case 'clubs':
          return item.role
        default:
          return ''
      }
    }

    return (
      <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getCardTitle()}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {getCardSubtitle()}
            </p>
            {item.description && activeTab !== 'admission' && (
              <p className="text-sm text-gray-700">
                {item.description}
              </p>
            )}
            {/* Multiple PDF Documents Display */}
            {item.documents && item.documents.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">PDF Documents ({item.documents.length}):</p>
                <div className="space-y-1">
                  {item.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-1">
                      <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span 
                        className="text-xs text-gray-700 truncate flex-1" 
                        title={doc.originalName}
                        style={{ maxWidth: '150px' }}
                      >
                        {doc.originalName}
                      </span>
                      <span className="text-xs text-gray-400">({(doc.fileSize / 1024 / 1024).toFixed(1)}MB)</span>
                      <button
                        onClick={() => downloadFile(getDocumentUrl(doc.filename || doc.url), doc.originalName || doc.name)}
                        className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 border-none cursor-pointer"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        {doc.originalName || doc.name || 'Document'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingItem(item)
              setShowDeleteModal(true)
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const currentData = getCurrentData()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Corner Management</h1>
        <p className="text-gray-600 mt-2">
          Manage admission guidelines, scholarships, student clubs, and alumni testimonials.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {currentData.length} items
          </span>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add {tabs.find(tab => tab.id === activeTab)?.name.slice(0, -1)}</span>
        </button>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentData.length > 0 ? (
          currentData.map((item, index) => renderDataCard(item, index))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first item.
            </p>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add {tabs.find(tab => tab.id === activeTab)?.name.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={`${editingItem ? 'Edit' : 'Add'} ${tabs.find(tab => tab.id === activeTab)?.name.slice(0, -1)}`}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          {renderForm()}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <SubmitButton isLoading={submitting}>
              {editingItem ? 'Update' : 'Create'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingItem(null)
        }}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingItem?.name || deletingItem?.category}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default StudentCornerManagement