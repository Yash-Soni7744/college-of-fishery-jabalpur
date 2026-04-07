import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, FileText, Download, Eye, EyeOff } from 'lucide-react'
import { farmersAPI } from '../../services/api'
import { getImageUrl, downloadFile } from '../../services/files'
import LoadingSpinner, { LoadingCard } from '../common/LoadingSpinner'
import Modal, { ConfirmModal } from '../common/Modal'
import { Form, FormGroup, Input, Textarea, Select, SubmitButton, FileUpload } from '../common/Form'
import toast from 'react-hot-toast'

const FarmersResourceManagement = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [deletingResource, setDeletingResource] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    pdf: null,
    isActive: true,
    selectedDocuments: []
  })

  const [filters, setFilters] = useState({
    category: '',
    isActive: ''
  })

  const categories = [
    { value: 'advisory', label: 'Advisory Services' },
    { value: 'training', label: 'Training Materials' },
    { value: 'techniques', label: 'Aquaculture Techniques' },
    { value: 'research', label: 'Research Papers' },
    { value: 'government-schemes', label: 'Government Schemes' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchResources()
  }, [filters, searchTerm])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = { ...filters }
      if (searchTerm) params.search = searchTerm
      
      const response = await farmersAPI.getAdminResources(params)
      if (response.data.success) {
        setResources(response.data.data.resources)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      pdf: null,
      isActive: true,
      selectedDocuments: []
    })
    setEditingResource(null)
    setShowModal(false)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      pdf: null,
      isActive: resource.isActive,
      selectedDocuments: []
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    if (!editingResource && !formData.pdf) {
      toast.error('Please select a PDF file')
      setSubmitting(false)
      return
    }

    try {
      if (editingResource) {
        // Update existing resource
        if (formData.pdf) {
          // If new PDF is uploaded, use FormData for file upload
          const updateData = new FormData()
          updateData.append('title', formData.title)
          updateData.append('description', formData.description)
          updateData.append('category', formData.category)
          updateData.append('isActive', formData.isActive)
          updateData.append('pdf', formData.pdf)
          
          const response = await farmersAPI.updateResourceWithFile(editingResource._id, updateData)
          if (response.data.success) {
            toast.success('Resource updated successfully')
            fetchResources()
            resetForm()
          }
        } else {
          // If no new PDF, update only basic fields
          const updateData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            isActive: formData.isActive
          }
          
          const response = await farmersAPI.updateResource(editingResource._id, updateData)
          if (response.data.success) {
            toast.success('Resource updated successfully')
            fetchResources()
            resetForm()
          }
        }
      } else {
        // Create new resource
        const submitData = new FormData()
        submitData.append('title', formData.title)
        submitData.append('description', formData.description)
        submitData.append('category', formData.category)
        submitData.append('pdf', formData.pdf)
        
        const response = await farmersAPI.createResource(submitData)
        if (response.data.success) {
          toast.success('Resource created successfully')
          fetchResources()
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving resource:', error)
      toast.error(error.response?.data?.message || 'Failed to save resource')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingResource) return

    try {
      const response = await farmersAPI.deleteResource(deletingResource._id)
      if (response.data.success) {
        toast.success('Resource deleted successfully')
        fetchResources()
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    } finally {
      setDeletingResource(null)
      setShowDeleteModal(false)
    }
  }


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farmers Resource Management</h1>
          <p className="text-gray-600 mt-2">
            Manage PDF resources for farmers including advisory services, training materials, and research papers.
          </p>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers Resource Management</h1>
          <p className="text-gray-600">Manage PDF resources for farmers</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto btn-primary flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {resources.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Start by adding your first farmer resource.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-500 mb-2">{resource.description}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium">{resource.originalName}</span>
                            <span>({formatFileSize(resource.fileSize)})</span>
                            <button
                              onClick={() => downloadFile(getImageUrl('farmers', resource.filename), resource.originalName)}
                              className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              View PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find(cat => cat.value === resource.category)?.label || resource.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        resource.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {resource.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(resource)}
                          className="text-blue-500 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingResource(resource)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <Form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Resource Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <FormGroup label="Title" required>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter resource title"
                  required
                />
              </FormGroup>

              <FormGroup label="Description" required>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter resource description"
                  required
                />
              </FormGroup>

              <FormGroup label="Category">
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={categories}
                  placeholder="Select category"
                />
              </FormGroup>

              {/* PDF File Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document {!editingResource && '(Required)'}
                </label>
                
                {/* File Upload */}
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) => setFormData({ ...formData, pdf: file })}
                  maxSize={10}
                  allowedTypes={['pdf', 'doc', 'docx']}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                
                {/* Display current file when editing */}
                {editingResource && editingResource.filename && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current file:</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">{editingResource.originalName}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(editingResource.fileSize)})</span>
                      <button
                        type="button"
                        onClick={() => downloadFile(getImageUrl('farmers', editingResource.filename), editingResource.originalName)}
                        className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        View Document
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new file to replace the current one
                    </p>
                  </div>
                )}
              </div>

              {/* Status Toggle - only show when editing */}
              {editingResource && (
                <FormGroup label="Status">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        checked={formData.isActive === true}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        checked={formData.isActive === false}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </FormGroup>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto btn-ghost order-2 sm:order-1"
            >
              Cancel
            </button>
            <SubmitButton 
              isLoading={submitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {editingResource ? 'Update Resource' : 'Create Resource'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setDeletingResource(null)
          setShowDeleteModal(false)
        }}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Are you sure you want to delete "${deletingResource?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default FarmersResourceManagement
