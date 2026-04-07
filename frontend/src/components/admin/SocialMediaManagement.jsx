import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Link as LinkIcon, Twitter, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react'
import Card from '../common/Card'
import { contentAPI } from '../../services/api'
import toast from 'react-hot-toast'

const SocialMediaManagement = () => {
  const [socialLinks, setSocialLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({
    platform: 'linkedin',
    url: '',
    isActive: true,
    order: 0
  })

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' },
    { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'sky' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'indigo' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' }
  ]

  useEffect(() => {
    fetchSocialLinks()
  }, [])

  const fetchSocialLinks = async () => {
    try {
      setLoading(true)
      const response = await contentAPI.getByKey('social-media-links')
      
      if (response.data.success && response.data.data.content) {
        const content = response.data.data.content
        let linksData = []
        
        if (content.type === 'json') {
          try {
            linksData = JSON.parse(content.content)
          } catch (e) {
            console.warn('Failed to parse JSON content')
          }
        }
        
        setSocialLinks(Array.isArray(linksData) ? linksData : [])
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching social links:', error)
        toast.error('Failed to fetch social media links')
      }
      setSocialLinks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.url || !formData.url.trim()) {
      toast.error('Please enter a valid post URL')
      return
    }
    
    try {
      let updatedLinks
      
      if (editingLink !== null) {
        // Update existing link
        updatedLinks = socialLinks.map((link, index) =>
          index === editingLink ? { ...formData, id: link.id || Date.now() } : link
        )
      } else {
        // Add new link
        updatedLinks = [
          ...socialLinks,
          { ...formData, id: Date.now() }
        ]
      }

      // Sort by order
      updatedLinks.sort((a, b) => (a.order || 0) - (b.order || 0))

      const response = await contentAPI.createOrUpdate({
        key: 'social-media-links',
        title: 'Homepage Social Media Links',
        section: 'homepage',
        type: 'json',
        content: JSON.stringify(updatedLinks),
        metadata: {
          totalLinks: updatedLinks.length,
          lastUpdated: new Date().toISOString()
        }
      })

      if (response.data.success) {
        setSocialLinks(updatedLinks)
        resetForm()
        toast.success(editingLink !== null ? 'Social link updated!' : 'Social link added!')
      }
    } catch (error) {
      console.error('Error saving social link:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save social link'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (link, index) => {
    setFormData({
      platform: link.platform || 'linkedin',
      url: link.url || '',
      isActive: link.isActive !== false,
      order: link.order || 0
    })
    setEditingLink(index)
    setShowForm(true)
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this social media link?')) return

    try {
      const updatedLinks = socialLinks.filter((_, i) => i !== index)

      const response = await contentAPI.createOrUpdate({
        key: 'social-media-links',
        title: 'Homepage Social Media Links',
        section: 'homepage',
        type: 'json',
        content: JSON.stringify(updatedLinks),
        metadata: {
          totalLinks: updatedLinks.length,
          lastUpdated: new Date().toISOString()
        }
      })

      if (response.data.success) {
        setSocialLinks(updatedLinks)
        toast.success('Social link deleted!')
      }
    } catch (error) {
      console.error('Error deleting social link:', error)
      toast.error('Failed to delete social link')
    }
  }

  const toggleActive = async (index) => {
    try {
      const updatedLinks = socialLinks.map((link, i) =>
        i === index ? { ...link, isActive: !link.isActive } : link
      )

      const response = await contentAPI.createOrUpdate({
        key: 'social-media-links',
        title: 'Homepage Social Media Links',
        section: 'homepage',
        type: 'json',
        content: JSON.stringify(updatedLinks),
        metadata: {
          totalLinks: updatedLinks.length,
          lastUpdated: new Date().toISOString()
        }
      })

      if (response.data.success) {
        setSocialLinks(updatedLinks)
        toast.success('Status updated!')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      platform: 'linkedin',
      url: '',
      isActive: true,
      order: 0
    })
    setEditingLink(null)
    setShowForm(false)
  }

  const getPlatformInfo = (platformValue) => {
    return platforms.find(p => p.value === platformValue) || platforms[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Links</h2>
            <p className="text-gray-600">Manage social media posts to display on homepage</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6 bg-gray-50 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLink !== null ? 'Edit' : 'Add'} Social Media Link
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {platforms.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.platform === 'linkedin' 
                      ? 'https://www.linkedin.com/embed/feed/... ( get it from the embed src )'
                      : formData.platform === 'twitter'
                        ? 'https://twitter.com/.../status/...'
                        : formData.platform === 'instagram'
                          ? 'https://www.instagram.com/p/...'
                          : formData.platform === 'youtube'
                            ? 'https://www.youtube.com/watch?v=...'
                            : 'https://www.facebook.com/.../posts/...'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the full URL of the {platforms.find(p => p.value === formData.platform)?.label || 'Social Media'} post
                </p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                    Note: For Facebook and Instagram, make sure the post is set to "Public". If the post is private or from a personal profile with restricted settings, it will not display on the website and show an "Unavailable" error.
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Show on homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingLink !== null ? 'Update' : 'Add'} Link
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Links List */}
        <div className="space-y-4">
          {socialLinks.length > 0 ? (
            socialLinks.map((link, index) => {
              const platformInfo = getPlatformInfo(link.platform)
              const IconComponent = platformInfo.icon
              
              return (
                <Card key={link.id || index} className={`p-4 ${!link.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 bg-${platformInfo.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 text-${platformInfo.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {platformInfo.label}
                          </h4>
                          {link.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3 flex-shrink-0" />
                          {link.url}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">Order: {link.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleActive(index)}
                        className={`p-2 rounded-lg ${
                          link.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={link.isActive ? 'Hide' : 'Show'}
                      >
                        {link.isActive ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        onClick={() => handleEdit(link, index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12">
              <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No social media links added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Link
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SocialMediaManagement
