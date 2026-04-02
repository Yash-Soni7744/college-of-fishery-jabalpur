import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, User, Mail, Phone, Award, X } from 'lucide-react'
import { facultyAPI, uploadAPI, academicsAPI } from '../../services/api'
import LoadingSpinner, { LoadingCard } from '../common/LoadingSpinner'
import Modal, { ConfirmModal } from '../common/Modal'
import { Form, FormGroup, Input, Textarea, Select, SubmitButton } from '../common/Form'
import toast from 'react-hot-toast'

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Teaching Staff')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [deletingFaculty, setDeletingFaculty] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    staffType: 'Teaching Staff',
    department: '',
    qualification: '',
    specialization: '',
    experience: '',
    bio: '',
    researchInterests: [],
    publications: [],
    awards: [],
    image: '',
    socialLinks: {
      linkedin: '',
      researchgate: '',
      googleScholar: '',
      orcid: ''
    }
  })

  const [departments, setDepartments] = useState([])
  // Fetch departments from academics API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await academicsAPI.getPage()
        if (response.data.success && response.data.data.departments) {
          setDepartments(response.data.data.departments.map(d => ({ value: d.name, label: d.name })))
        }
      } catch (err) {
        console.error('Failed to fetch departments', err)
      }
    }
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchFaculty()
  }, [searchTerm, activeTab])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const params = { staffType: activeTab }
      if (searchTerm) params.search = searchTerm

      const response = await facultyAPI.getAll(params)
      if (response.data.success) {
        setFaculty(response.data.data.faculty || [])
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      toast.error('Failed to fetch faculty')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const data = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        researchInterests: Array.isArray(formData.researchInterests) 
          ? formData.researchInterests 
          : formData.researchInterests.split(',').map(s => s.trim()).filter(Boolean)
      }

      // Only include department for teaching staff
      if (formData.staffType !== 'Teaching Staff') {
        delete data.department
      }

      console.log('Submitting faculty data:', data)
      console.log('Image field value:', data.image)

      if (editingFaculty) {
        await facultyAPI.update(editingFaculty._id, data)
        toast.success('Faculty updated successfully')
      } else {
        await facultyAPI.create(data)
        toast.success('Faculty created successfully')
      }

      setShowModal(false)
      resetForm()
      fetchFaculty()
    } catch (error) {
      console.error('Error saving faculty:', error)
      toast.error(error.response?.data?.message || 'Failed to save faculty')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (facultyMember) => {
    setEditingFaculty(facultyMember)
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      phone: facultyMember.phone,
      designation: facultyMember.designation,
      staffType: facultyMember.staffType || 'Teaching Staff',
      department: facultyMember.department,
      qualification: facultyMember.qualification,
      specialization: facultyMember.specialization,
      experience: facultyMember.experience?.toString() || '',
      bio: facultyMember.bio,
      researchInterests: Array.isArray(facultyMember.researchInterests) 
        ? facultyMember.researchInterests.join(', ') 
        : facultyMember.researchInterests || '',
      publications: facultyMember.publications || [],
      awards: facultyMember.awards || [],
      image: facultyMember.image || '',
      socialLinks: facultyMember.socialLinks || {
        linkedin: '',
        researchgate: '',
        googleScholar: '',
        orcid: ''
      }
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingFaculty) return

    try {
      await facultyAPI.delete(deletingFaculty._id)
      toast.success('Faculty deleted successfully')
      setShowDeleteModal(false)
      setDeletingFaculty(null)
      fetchFaculty()
    } catch (error) {
      console.error('Error deleting faculty:', error)
      toast.error(error.response?.data?.message || 'Failed to delete faculty')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
    toast.success('Image removed')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingImage(true)
      console.log('Starting faculty image upload:', file.name)
      
      // Use uploadAPI with faculty category
      const response = await uploadAPI.single(file, 'faculty')
      console.log('Upload response:', response.data)
      
      if (response.data.success) {
        // Use the full URL from the response
        const imageUrl = response.data.data.url || response.data.data.filename
        console.log('Faculty image uploaded URL:', imageUrl)
        
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }))
        toast.success('Image uploaded successfully')
      } else {
        console.error('Upload failed:', response.data)
        toast.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      staffType: activeTab,
      department: activeTab === 'Teaching Staff' ? '' : '',
      qualification: '',
      specialization: '',
      experience: '',
      bio: '',
      researchInterests: [],
      publications: [],
      awards: [],
      image: '',
      socialLinks: {
        linkedin: '',
        researchgate: '',
        googleScholar: '',
        orcid: ''
      }
    })
    setEditingFaculty(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value
        }
      }))
    } else if (name === 'staffType') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        department: value === 'Teaching Staff' ? prev.department : ''
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">Manage faculty profiles and information</p>
        </div>
        
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="w-full sm:w-auto btn-primary flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['Teaching Staff', 'Non-Teaching Staff'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            className="form-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                {activeTab === 'Teaching Staff' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : faculty.length > 0 ? (
                faculty.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={uploadAPI.getImageUrl(member.image, 'faculty') || 'https://via.placeholder.com/40x40?text=User'}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.qualification}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.designation}
                    </td>
                    {activeTab === 'Teaching Staff' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.department}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingFaculty(member)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No faculty found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <Form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Full Name" required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </FormGroup>

              <FormGroup label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </FormGroup>

              <FormGroup label="Phone">
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </FormGroup>

              <FormGroup label="Experience (Years)" required>
                <Input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  required
                />
              </FormGroup>
            </div>
          </div>

          {/* Professional Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Staff Type" required>
                <Select
                  name="staffType"
                  value={formData.staffType}
                  onChange={handleChange}
                  options={[
                    { value: 'Teaching Staff', label: 'Teaching Staff' },
                    { value: 'Non-Teaching Staff', label: 'Non-Teaching Staff' }
                  ]}
                  placeholder="Select staff type"
                  required
                />
              </FormGroup>

              <FormGroup label="Designation" required>
                <Input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  required
                />
              </FormGroup>

              {formData.staffType === 'Teaching Staff' && (
                <FormGroup label="Department" required>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={departments}
                    placeholder="Select department"
                    required
                  />
                </FormGroup>
              )}
            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormGroup label="Qualification" required>
                <Input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., Ph.D. in Fishery Science"
                  required
                />
              </FormGroup>

              <FormGroup label="Specialization">
                <Input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Area of specialization (optional)"
                />
              </FormGroup>

              <div className="md:col-span-2">
                <FormGroup label="Research Interests">
                  <Input
                    name="researchInterests"
                    value={formData.researchInterests}
                    onChange={handleChange}
                    placeholder="Comma-separated research interests"
                  />
                </FormGroup>
              </div>

              <div className="md:col-span-2">
                <FormGroup label="Biography">
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Brief biography"
                    rows={3}
                  />
                </FormGroup>
              </div>
            </div>
          </div>

          {/* Profile Image Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Image</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              <div className="flex-shrink-0">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={uploadAPI.getImageUrl(formData.image, 'faculty')}
                      alt="Profile"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src)
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', uploadAPI.getImageUrl(formData.image, 'faculty'))
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
                
                {!formData.image && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                  </div>
                )}
                
                {/* Fallback placeholder for failed images */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center" style={{display: 'none'}}>
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center py-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-gray-500" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> profile image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                
                {uploadingImage && (
                  <div className="flex items-center justify-center mt-2">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormGroup label="LinkedIn">
                <Input
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn profile URL"
                />
              </FormGroup>

              <FormGroup label="ResearchGate">
                <Input
                  name="socialLinks.researchgate"
                  value={formData.socialLinks.researchgate}
                  onChange={handleChange}
                  placeholder="ResearchGate profile URL"
                />
              </FormGroup>

              <FormGroup label="Google Scholar">
                <Input
                  name="socialLinks.googleScholar"
                  value={formData.socialLinks.googleScholar}
                  onChange={handleChange}
                  placeholder="Google Scholar profile URL"
                />
              </FormGroup>

              <FormGroup label="ORCID">
                <Input
                  name="socialLinks.orcid"
                  value={formData.socialLinks.orcid}
                  onChange={handleChange}
                  placeholder="ORCID ID"
                />
              </FormGroup>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto btn-ghost order-2 sm:order-1"
            >
              Cancel
            </button>
            <SubmitButton 
              isLoading={submitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Faculty"
        message={`Are you sure you want to delete "${deletingFaculty?.name}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  )
}

export default FacultyManagement






