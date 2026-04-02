import React, { useState, useEffect } from 'react'
import { Save, Eye, RefreshCw, BookOpen, Users, Target, Award, Plus, Edit, Trash2, Upload, FileText, Download, X } from 'lucide-react'
import Card from '../common/Card'
import toast from 'react-hot-toast'
import { extensionAPI, uploadAPI } from '../../services/api'
import { getDocumentUrl } from '../../services/files'

const ExtensionManagement = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [extensionData, setExtensionData] = useState({
    'farmer-training': [],
    'ffpo-shg': [],
    'demonstrations': [],
    'success-stories': []
  })
  const [activeTab, setActiveTab] = useState('farmer-training')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [originalItem, setOriginalItem] = useState(null)
  const [formData, setFormData] = useState({})

  const tabs = [
    { 
      id: 'farmer-training', 
      name: 'Farmer Training', 
      icon: BookOpen, 
      color: 'blue',
      description: 'Training programs for farmers and youth'
    },
    { 
      id: 'ffpo-shg', 
      name: 'FFPO & SHG', 
      icon: Users, 
      color: 'green',
      description: 'FFPO and Self Help Group activities'
    },
    { 
      id: 'demonstrations', 
      name: 'Demonstrations', 
      icon: Target, 
      color: 'purple',
      description: 'Aquaculture technology demonstrations'
    },
    { 
      id: 'success-stories', 
      name: 'Success Stories', 
      icon: Award, 
      color: 'yellow',
      description: 'Farmer and beneficiary success stories'
    }
  ]

  const getDefaultFormData = (section) => {
    const base = {
      section,
      title: '',
      description: '',
      order: 0,
      isPublished: true,
      tags: [],
      pdf: null,
      image: null
    }

    switch (section) {
      case 'farmer-training':
        return {
          ...base,
          duration: '',
          frequency: '',
          participants: '',
          modules: []
        }
      case 'ffpo-shg':
        return {
          ...base,
          type: '',
          activities: [],
          beneficiaries: '',
          impact: ''
        }
      case 'demonstrations':
        return {
          ...base,
          location: '',
          area: '',
          features: [],
          results: ''
        }
      case 'success-stories':
        return {
          ...base,
          name: '',
          program: '',
          achievement: '',
          story: '',
          impactPoints: [],
          year: new Date().getFullYear().toString()
        }
      default:
        return base
    }
  }

  useEffect(() => {
    fetchExtensions()
  }, [])

  useEffect(() => {
    setFormData(getDefaultFormData(activeTab))
  }, [activeTab])

  const fetchExtensions = async () => {
    try {
      setLoading(true)
      const response = await extensionAPI.getAdmin()
      setExtensionData(response.data.data.extensions || {
        'farmer-training': [],
        'ffpo-shg': [],
        'demonstrations': [],
        'success-stories': []
      })
    } catch (error) {
      console.error('Error fetching extensions:', error)
      toast.error('Failed to load extension data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    const formattedData = {
      ...item,
      modules: item.modules || [],
      activities: item.activities || [],
      features: item.features || [],
      impactPoints: item.impactPoints || [],
      tags: item.tags || []
    }
    setEditingItem(item)
    setOriginalItem({ ...item }) // Store original for comparison
    setFormData(formattedData)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await extensionAPI.delete(id)
      toast.success('Item deleted successfully')
      fetchExtensions()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInput = (field, value) => {
    // Store the raw text value to preserve line breaks and empty lines during editing
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (type, e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (type === 'pdf' && allowedTypes.includes(file.type)) {
        setFormData(prev => ({
          ...prev,
          pdf: file
        }))
      } else if (type === 'image' && file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          image: file
        }))
      } else {
        const fileTypeText = type === 'pdf' ? 'PDF or Word document (DOC, DOCX)' : 'image';
        toast.error(`Please select a valid ${fileTypeText} file`)
        e.target.value = ''
      }
    }
  }

  const handleRemoveFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null
    }))
    toast.success(`${type === 'pdf' ? 'PDF' : 'Image'} removed`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error('Title and description are required')
      return
    }

    try {
      setSaving(true)
      
      // Create FormData for file upload support
      const formDataToSend = new FormData()
      
      // Add basic fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('section', formData.section)
      formDataToSend.append('order', formData.order || 0)
      formDataToSend.append('isPublished', formData.isPublished !== undefined ? formData.isPublished : true)
      
      // Add PDF file if selected
      if (formData.pdf) {
        formDataToSend.append('pdf', formData.pdf)
      } else if (originalItem?.filename && (!editingItem?.filename || editingItem?.filename === null)) {
        // If original had a PDF but now it's been removed (editingItem.filename set to null)
        formDataToSend.append('removePdf', 'true')
      }
      
      // Add Image file if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      } else if (originalItem?.imageUrl && (!editingItem?.imageUrl || editingItem?.imageUrl === null)) {
        // If original had an image but now it's been removed (editingItem.imageUrl set to null)
        formDataToSend.append('removeImage', 'true')
      }
      
      // Add section-specific fields
      if (formData.section === 'farmer-training') {
        if (formData.duration) formDataToSend.append('duration', formData.duration)
        if (formData.frequency) formDataToSend.append('frequency', formData.frequency)
        if (formData.participants) formDataToSend.append('participants', formData.participants)
        if (formData.modules) {
          // Convert string to array and filter out empty lines
          const modulesArray = typeof formData.modules === 'string' 
            ? formData.modules.split('\n').filter(item => item.trim())
            : formData.modules
          if (modulesArray && modulesArray.length > 0) {
            formDataToSend.append('modules', JSON.stringify(modulesArray))
          }
        }
      } else if (formData.section === 'ffpo-shg') {
        if (formData.type) formDataToSend.append('type', formData.type)
        if (formData.beneficiaries) formDataToSend.append('beneficiaries', formData.beneficiaries)
        if (formData.impact) formDataToSend.append('impact', formData.impact)
        if (formData.activities) {
          // Convert string to array and filter out empty lines
          const activitiesArray = typeof formData.activities === 'string'
            ? formData.activities.split('\n').filter(item => item.trim())
            : formData.activities
          if (activitiesArray && activitiesArray.length > 0) {
            formDataToSend.append('activities', JSON.stringify(activitiesArray))
          }
        }
      } else if (formData.section === 'demonstrations') {
        if (formData.location) formDataToSend.append('location', formData.location)
        if (formData.area) formDataToSend.append('area', formData.area)
        if (formData.results) formDataToSend.append('results', formData.results)
        if (formData.features) {
          // Convert string to array and filter out empty lines
          const featuresArray = typeof formData.features === 'string'
            ? formData.features.split('\n').filter(item => item.trim())
            : formData.features
          if (featuresArray && featuresArray.length > 0) {
            formDataToSend.append('features', JSON.stringify(featuresArray))
          }
        }
      } else if (formData.section === 'success-stories') {
        if (formData.name) formDataToSend.append('name', formData.name)
        if (formData.program) formDataToSend.append('program', formData.program)
        if (formData.achievement) formDataToSend.append('achievement', formData.achievement)
        if (formData.story) formDataToSend.append('story', formData.story)
        if (formData.year) formDataToSend.append('year', formData.year)
        if (formData.impactPoints) {
          // Convert string to array and filter out empty lines
          const impactPointsArray = typeof formData.impactPoints === 'string'
            ? formData.impactPoints.split('\n').filter(item => item.trim())
            : formData.impactPoints
          if (impactPointsArray && impactPointsArray.length > 0) {
            formDataToSend.append('impactPoints', JSON.stringify(impactPointsArray))
          }
        }
      }
      
      // Add tags
      if (formData.tags && formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags))
      }

      if (editingItem) {
        await extensionAPI.update(editingItem._id, formDataToSend)
        toast.success('Extension item updated successfully')
      } else {
        await extensionAPI.create(formDataToSend)
        toast.success('Extension item created successfully')
      }

      setShowAddModal(false)
      setEditingItem(null)
      setOriginalItem(null)
      setFormData(getDefaultFormData(activeTab))
      fetchExtensions()
    } catch (error) {
      console.error('Error saving extension:', error)
      toast.error('Failed to save extension item')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingItem(null)
    setOriginalItem(null)
    setFormData(getDefaultFormData(activeTab))
  }

  const renderTabContent = () => {
    const items = extensionData[activeTab] || []
    const tabInfo = tabs.find(tab => tab.id === activeTab)

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tabInfo?.name}</h3>
            <p className="text-sm text-gray-600">{tabInfo?.description}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6">
            {items.map((item) => (
              <Card key={item._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                      {item.type && (
                        <span className={`px-2 py-1 bg-${tabInfo?.color}-100 text-${tabInfo?.color}-800 text-xs rounded-full`}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.description}</p>
                    
                    {/* Section-specific display */}
                    {activeTab === 'farmer-training' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {item.duration && (
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium">{item.duration}</p>
                          </div>
                        )}
                        {item.frequency && (
                          <div>
                            <p className="text-xs text-gray-500">Frequency</p>
                            <p className="text-sm font-medium">{item.frequency}</p>
                          </div>
                        )}
                        {item.participants && (
                          <div>
                            <p className="text-xs text-gray-500">Participants</p>
                            <p className="text-sm font-medium">{item.participants}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'ffpo-shg' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {item.beneficiaries && (
                          <div>
                            <p className="text-xs text-gray-500">Beneficiaries</p>
                            <p className="text-sm font-medium">{item.beneficiaries}</p>
                          </div>
                        )}
                        {item.impact && (
                          <div>
                            <p className="text-xs text-gray-500">Impact</p>
                            <p className="text-sm font-medium">{item.impact}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'demonstrations' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {item.location && (
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium">{item.location}</p>
                          </div>
                        )}
                        {item.area && (
                          <div>
                            <p className="text-xs text-gray-500">Area</p>
                            <p className="text-sm font-medium">{item.area}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'success-stories' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {item.name && (
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium">{item.name}</p>
                          </div>
                        )}
                        {item.program && (
                          <div>
                            <p className="text-xs text-gray-500">Program</p>
                            <p className="text-sm font-medium">{item.program}</p>
                          </div>
                        )}
                        {item.year && (
                          <div>
                            <p className="text-xs text-gray-500">Year</p>
                            <p className="text-sm font-medium">{item.year}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* PDF File Display */}
                    {item.filename && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">PDF Document:</p>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">{item.originalName || item.filename}</span>
                          <a
                            href={getDocumentUrl(item.filename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <tabInfo.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {tabInfo?.name.toLowerCase()} items yet. Create your first one!</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading extension data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Extension & Outreach Management</h1>
            <p className="text-gray-600">Manage training programs, demonstrations, and success stories</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open('/extension', '_blank')}
              className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={fetchExtensions}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {tabs.map(tab => {
            const count = extensionData[tab.id]?.length || 0
            return (
              <div key={tab.id} className={`bg-${tab.color}-50 rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm text-${tab.color}-600`}>{tab.name}</p>
                    <p className={`text-2xl font-bold text-${tab.color}-900`}>{count}</p>
                  </div>
                  <tab.icon className={`w-8 h-8 text-${tab.color}-600`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Section-specific fields */}
              {activeTab === 'farmer-training' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 5 Days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <input
                        type="text"
                        value={formData.frequency || ''}
                        onChange={(e) => handleInputChange('frequency', e.target.value)}
                        placeholder="e.g., Monthly"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                      <input
                        type="text"
                        value={formData.participants || ''}
                        onChange={(e) => handleInputChange('participants', e.target.value)}
                        placeholder="e.g., 25-30 farmers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Modules (One per line) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={typeof formData.modules === 'string' ? formData.modules : (formData.modules || []).join('\n')}
                      onChange={(e) => handleArrayInput('modules', e.target.value)}
                      rows={5}
                      placeholder="Enter training modules, one per line&#10;Press Enter to create new lines&#10;Example:&#10;• Crop Management Techniques&#10;• Soil Health Assessment&#10;• Pest Control Methods"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] bg-white font-mono text-sm"
                      style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                    />
                  </div>
                </>
              )}

              {activeTab === 'ffpo-shg' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type || ''}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="FFPO Support">FFPO Support</option>
                        <option value="SHG Support">SHG Support</option>
                        <option value="Cooperative Support">Cooperative Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiaries</label>
                      <input
                        type="text"
                        value={formData.beneficiaries || ''}
                        onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                        placeholder="e.g., 150+ farmers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Impact</label>
                      <input
                        type="text"
                        value={formData.impact || ''}
                        onChange={(e) => handleInputChange('impact', e.target.value)}
                        placeholder="e.g., 25% increase in farmers income"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activities (One per line) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={typeof formData.activities === 'string' ? formData.activities : (formData.activities || []).join('\n')}
                      onChange={(e) => handleArrayInput('activities', e.target.value)}
                      rows={5}
                      placeholder="Enter activities, one per line&#10;Press Enter to create new lines&#10;Example:&#10;• Field demonstrations&#10;• Farmer training sessions&#10;• Technology transfer programs"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] bg-white font-mono text-sm"
                      style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                    />
                  </div>
                </>
              )}

              {activeTab === 'demonstrations' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., College Demo Farm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                      <input
                        type="text"
                        value={formData.area || ''}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="e.g., 0.5 hectares"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features (One per line) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={typeof formData.features === 'string' ? formData.features : (formData.features || []).join('\n')}
                      onChange={(e) => handleArrayInput('features', e.target.value)}
                      rows={5}
                      placeholder="Enter key features, one per line&#10;Press Enter to create new lines&#10;Example:&#10;• Climate-controlled environment&#10;• Advanced irrigation system&#10;• Digital monitoring tools"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] bg-white font-mono text-sm"
                      style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                    <input
                      type="text"
                      value={formData.results || ''}
                      onChange={(e) => handleInputChange('results', e.target.value)}
                      placeholder="e.g., 30% higher productivity, 50% water savings"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'success-stories' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Person/Organization name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                      <input
                        type="text"
                        value={formData.program || ''}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                        placeholder="Program participated in"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="text"
                        value={formData.year || ''}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        placeholder="e.g., 2023"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Achievement</label>
                    <input
                      type="text"
                      value={formData.achievement || ''}
                      onChange={(e) => handleInputChange('achievement', e.target.value)}
                      placeholder="Brief achievement description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Story</label>
                    <textarea
                      value={formData.story || ''}
                      onChange={(e) => handleInputChange('story', e.target.value)}
                      rows={4}
                      placeholder="Detailed success story"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impact Points (One per line) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={typeof formData.impactPoints === 'string' ? formData.impactPoints : (formData.impactPoints || []).join('\n')}
                      onChange={(e) => handleArrayInput('impactPoints', e.target.value)}
                      rows={4}
                      placeholder="Enter impact points, one per line&#10;Press Enter to create new lines&#10;Example:&#10;• 30% increase in crop yield&#10;• 50% reduction in pesticide use&#10;• Improved farmer income by 25%"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] bg-white font-mono text-sm"
                      style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                    />
                  </div>
                </>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image (Optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image', e)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  {formData.image && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-600">New image selected: {formData.image.name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('image')}
                          className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {editingItem?.imageUrl && !formData.image && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Current image</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(prev => ({ ...prev, imageUrl: null }))
                            toast.success('Image removed')
                          }}
                          className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                      <img
                        src={uploadAPI.getImageUrl(editingItem.imageUrl, 'images')}
                        alt="Current image"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document (Optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('pdf', e)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {formData.pdf && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">New file selected: {formData.pdf.name}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('pdf')}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  )}
                  {editingItem?.filename && !formData.pdf && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Current: {editingItem.originalName || editingItem.filename}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(prev => ({ ...prev, filename: null, originalName: null }))
                          toast.success('PDF removed')
                        }}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="e.g., training, aquaculture, technology"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Published Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished !== false}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Published (visible on public website)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExtensionManagement