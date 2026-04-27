import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Image, Calendar, FileText, X, Upload } from 'lucide-react'
import { newsAPI, uploadAPI } from '../../services/api'
import LoadingSpinner, { LoadingCard } from '../common/LoadingSpinner'
import Modal, { ConfirmModal } from '../common/Modal'
import { Form, FormGroup, Input, Textarea, Select, SubmitButton } from '../common/Form'
import toast from 'react-hot-toast'

const NewsAndEventsManagement = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // all, news, events
  const [formType, setFormType] = useState('news') // Which form to show in modal

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    type: 'news',
    category: 'general',
    eventDate: '',
    venue: '',
    organizer: '',
    images: [],
    attachments: [],
    isPublished: true,
    isFeatured: false,
    tags: ''
  })

  const newsTypes = [
    { value: 'news', label: 'News Article' },
    { value: 'announcement', label: 'Announcement' }
  ]

  const eventTypes = [
    { value: 'event', label: 'Event' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'visit', label: 'Field Visit' }
  ]

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'research', label: 'Research' },
    { value: 'extension', label: 'Extension' },
    { value: 'general', label: 'General' },
    { value: 'placement', label: 'Placement' }
  ]

  useEffect(() => {
    fetchItems()
  }, [searchTerm, activeTab])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm) params.search = searchTerm

      const response = await newsAPI.getAll(params)
      if (response.data.success) {
        const allItems = response.data.data.newsEvents || []
        
        let filteredItems = allItems
        if (activeTab === 'news') {
          filteredItems = allItems.filter(item => 
            ['news', 'announcement'].includes(item.type)
          )
        } else if (activeTab === 'events') {
          filteredItems = allItems.filter(item => 
            ['event', 'seminar', 'workshop', 'visit'].includes(item.type)
          )
        }
        
        setItems(filteredItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Ensure arrays are properly formatted
      const images = Array.isArray(formData.images) ? formData.images : []
      const attachments = Array.isArray(formData.attachments) ? formData.attachments : []
      const tags = (formData.tags && typeof formData.tags === 'string') 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) 
        : []

      console.log('=== FORM DATA DEBUG ===')
      console.log('formData.images:', formData.images)
      console.log('formData.attachments:', formData.attachments)
      console.log('Processed images:', images)
      console.log('Processed attachments:', attachments)
      console.log('Images is array?', Array.isArray(images))
      console.log('Attachments is array?', Array.isArray(attachments))
      console.log('Attachments content:', JSON.stringify(attachments, null, 2))

      const data = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        type: formData.type,
        category: formData.category,
        isPublished: Boolean(formData.isPublished),
        isFeatured: Boolean(formData.isFeatured),
        images,
        attachments,
        tags
      }

      // Add event-specific fields if it's an event
      if (['event', 'seminar', 'workshop', 'visit'].includes(formData.type)) {
        data.eventDate = formData.eventDate || null
        data.venue = formData.venue || ''
        data.organizer = formData.organizer || ''
      }

      console.log('=== DATA TO SEND ===')
      console.log('Full data object:', data)
      console.log('data.attachments:', data.attachments)
      console.log('data.attachments type:', typeof data.attachments)
      console.log('data.attachments is array?', Array.isArray(data.attachments))
      console.log('Stringified data:', JSON.stringify(data, null, 2))

      if (editingItem) {
        await newsAPI.update(editingItem._id, data)
        toast.success('Item updated successfully')
      } else {
        await newsAPI.create(data)
        toast.success('Item created successfully')
      }

      setShowModal(false)
      resetForm()
      fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
      console.error('Error details:', error.response?.data) // Debug log
      
      // Extract specific validation error message if available
      let errorMessage = 'Failed to save item';
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        // Express-validator errors are objects, mongoose errors might be strings
        const firstError = error.response.data.errors[0];
        errorMessage = typeof firstError === 'string' ? firstError : (firstError.msg || 'Validation error');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    console.log('=== EDITING ITEM ===')
    console.log('Full item:', item)
    console.log('item.images:', item.images)
    console.log('item.attachments:', item.attachments)
    
    setEditingItem(item)
    const isEvent = ['event', 'seminar', 'workshop', 'visit'].includes(item.type)
    setFormType(isEvent ? 'event' : 'news')
    
    setFormData({
      title: item.title || '',
      content: item.content || '',
      excerpt: item.excerpt || '',
      type: item.type || 'news',
      category: item.category || 'general',
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
      venue: item.venue || '',
      organizer: item.organizer || '',
      images: item.images || [],
      attachments: item.attachments || [],
      isPublished: item.isPublished !== undefined ? item.isPublished : true,
      isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      await newsAPI.delete(deletingItem._id)
      toast.success('Item deleted successfully')
      setShowDeleteModal(false)
      setDeletingItem(null)
      fetchItems()
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
      const response = await newsAPI.uploadImage(file)
      
      if (response.data.success) {
        const imageUrl = response.data.data.url
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            url: imageUrl,
            caption: file.name.split('.')[0]
          }]
        }))
        toast.success('Image uploaded successfully')
        e.target.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOC/DOCX files are allowed')
      e.target.value = ''
      return
    }

    try {
      setUploadingAttachment(true)
      const response = await newsAPI.uploadAttachment(file)
      
      if (response.data.success) {
        const fileData = response.data.data
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            name: fileData.originalName,
            url: fileData.url,
            type: fileData.type
          }]
        }))
        toast.success('Attachment uploaded successfully')
        e.target.value = ''
      }
    } catch (error) {
      console.error('Error uploading attachment:', error)
      toast.error(error.response?.data?.message || 'Failed to upload attachment')
    } finally {
      setUploadingAttachment(false)
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      type: formType === 'event' ? 'event' : 'news',
      category: 'general',
      eventDate: '',
      venue: '',
      organizer: '',
      images: [],
      attachments: [],
      isPublished: true,
      isFeatured: false,
      tags: ''
    })
    setEditingItem(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const openNewsForm = () => {
    setFormType('news')
    resetForm()
    setShowModal(true)
  }

  const openEventForm = () => {
    setFormType('event')
    setFormData(prev => ({ ...prev, type: 'event' }))
    setShowModal(true)
  }

  const isEventType = (type) => {
    return ['event', 'seminar', 'workshop', 'visit'].includes(type)
  }

  const tabs = [
    { id: 'all', label: 'All Items' },
    { id: 'news', label: 'News Only' },
    { id: 'events', label: 'Events Only' }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Events Management</h1>
          <p className="text-gray-600">Create and manage news articles, announcements, and events</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={openNewsForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add News
          </button>
          <button
            onClick={openEventForm}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
              {activeTab === tab.id ? items.length : items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search items..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.images?.[0] && (
                          <img
                            src={uploadAPI.getImageUrl(item.images[0].url, 'news')}
                            alt=""
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          {item.slug && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                /{item.slug}
                              </span>
                            </div>
                          )}
                          {item.eventDate && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.eventDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isEventType(item.type) 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center flex-wrap gap-2">
                        {item.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            Featured
                          </span>
                        )}
                        {item.attachments && item.attachments.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <FileText className="w-3 h-3 mr-1" />
                            {item.attachments.length} PDF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem(item)
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
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal - NEWS FORM */}
      {formType === 'news' && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Edit News Article' : 'Add News Article'}
          size="large"
        >
          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <FormGroup label="Title" required>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter news title"
                required
              />
            </FormGroup>

            {/* Excerpt */}
            <FormGroup label="Summary" required>
              <Textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief summary (max 300 characters)"
                rows={3}
                maxLength={300}
                required
                className="text-base"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Brief description for preview</p>
                <p className={`text-xs font-semibold ${
                  formData.excerpt.length > 250 ? 'text-orange-600' : 
                  formData.excerpt.length > 280 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {formData.excerpt.length}/300 characters
                </p>
              </div>
            </FormGroup>

            {/* Content */}
            <FormGroup label="Full Content" required>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Full article content"
                rows={12}
                required
                className="text-base leading-relaxed"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.split(/\s+/).filter(Boolean).length} words
              </p>
            </FormGroup>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="News Type" required>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={newsTypes}
                  required
                />
              </FormGroup>

              <FormGroup label="Category" required>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categories}
                  required
                />
              </FormGroup>
            </div>

            {/* Tags */}
            <FormGroup label="Tags">
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. research, scholarship, admission (comma-separated)"
              />
            </FormGroup>

            {/* Image Upload */}
            <FormGroup label="Images">
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-blue-500" />
                    <p className="mb-2 text-sm text-blue-700 font-semibold">
                      Click to upload images
                    </p>
                    <p className="text-xs text-blue-600">PNG, JPG, WebP, GIF (MAX. 5MB)</p>
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
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-blue-700 font-medium">Uploading image...</span>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {formData.images.length} image{formData.images.length > 1 ? 's' : ''} uploaded
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => {
                        const imageUrl = image.url.startsWith('http') ? image.url : uploadAPI.getImageUrl(image.url, 'news')
                        console.log(`Image ${index} URL:`, imageUrl);
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={image.caption || 'Image'}
                              className="w-full h-28 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                              onError={(e) => console.error(`Failed to load image: ${imageUrl}`)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              Image {index + 1}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Attachment Upload */}
            <FormGroup label="Attachments (PDF/DOC)">
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all">
                  <div className="flex flex-col items-center justify-center py-4">
                    <FileText className="w-8 h-8 mb-2 text-purple-500" />
                    <p className="text-sm text-purple-700 font-semibold">
                      Click to upload PDF/DOC files
                    </p>
                    <p className="text-xs text-purple-600 mt-1">PDF, DOC, DOCX (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleAttachmentUpload}
                    disabled={uploadingAttachment}
                  />
                </label>

                {uploadingAttachment && (
                  <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-purple-700 font-medium">Uploading attachment...</span>
                  </div>
                )}

                {formData.attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {formData.attachments.length} attachment{formData.attachments.length > 1 ? 's' : ''} uploaded
                    </p>
                    <div className="space-y-2">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-purple-200 rounded-lg shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
                          <div className="flex items-center flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <div className="ml-3 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500 uppercase mt-0.5">{attachment.type}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">
                  <span className="text-sm font-medium text-gray-700">Featured Article</span>
                  <span className="block text-xs text-gray-500">Show on homepage</span>
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Publish Immediately</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <SubmitButton isLoading={submitting}>
                {editingItem ? 'Update News' : 'Create News'}
              </SubmitButton>
            </div>
          </Form>
        </Modal>
      )}

      {/* Add/Edit Modal - EVENT FORM */}
      {formType === 'event' && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Edit Event' : 'Add Event'}
          size="large"
        >
          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <FormGroup label="Event Title" required>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
            </FormGroup>

            {/* Excerpt */}
            <FormGroup label="Brief Description" required>
              <Textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief event description (max 300 characters)"
                rows={2}
                maxLength={300}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/300 characters
              </p>
            </FormGroup>

            {/* Content */}
            <FormGroup label="Full Description" required>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Detailed event description, agenda, objectives, etc."
                rows={8}
                required
              />
            </FormGroup>

            {/* Event Details - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-sm">
              <FormGroup label="Event Date" className="bg-white p-3 rounded-lg shadow-sm">
                <Input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="text-base font-medium"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Select event date</p>
              </FormGroup>

              <FormGroup label="Venue" className="bg-white p-3 rounded-lg shadow-sm">
                <Input
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Event location"
                  className="text-base"
                />
              </FormGroup>

              <FormGroup label="Organizer" className="bg-white p-3 rounded-lg shadow-sm">
                <Input
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Organized by"
                  className="text-base"
                />
              </FormGroup>
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Event Type" required>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={eventTypes}
                  required
                />
              </FormGroup>

              <FormGroup label="Category" required>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categories}
                  required
                />
              </FormGroup>
            </div>

            {/* Tags */}
            <FormGroup label="Tags">
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. workshop, training, conference (comma-separated)"
              />
            </FormGroup>

            {/* Image Upload */}
            <FormGroup label="Event Images">
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-purple-500" />
                    <p className="mb-2 text-sm text-purple-600">
                      <span className="font-semibold">Click to upload images</span>
                    </p>
                    <p className="text-xs text-purple-500">PNG, JPG, GIF (MAX. 5MB)</p>
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
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Uploading...</span>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => {
                      const imageUrl = image.url.startsWith('http') ? image.url : uploadAPI.getImageUrl(image.url, 'news')
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={image.caption || 'Image'}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Attachment Upload */}
            <FormGroup label="Event Documents (PDF/DOC)">
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                  <div className="flex flex-col items-center justify-center py-4">
                    <FileText className="w-6 h-6 mb-2 text-purple-500" />
                    <p className="text-sm text-purple-600">
                      <span className="font-semibold">Click to upload PDF/DOC files</span>
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleAttachmentUpload}
                    disabled={uploadingAttachment}
                  />
                </label>

                {uploadingAttachment && (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Uploading attachment...</span>
                  </div>
                )}

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-purple-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.type}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Featured Event</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Publish Immediately</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <SubmitButton isLoading={submitting} className="bg-purple-600 hover:bg-purple-700">
                {editingItem ? 'Update Event' : 'Create Event'}
              </SubmitButton>
            </div>
          </Form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  )
}

export default NewsAndEventsManagement
