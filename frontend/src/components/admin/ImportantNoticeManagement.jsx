import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Bell, FileText, Upload, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { contentAPI, uploadAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import Card from '../common/Card'
import toast from 'react-hot-toast'

const ImportantNoticeManagement = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: 'Important Notice',
    message: '',
    link: '/student-corner',
    linkText: 'Learn More',
    isActive: true,
    isPdf: false,
    pdfUrl: ''
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await contentAPI.getByKey('important-notices')
      if (response.data.success && response.data.data.content) {
        let contentStr = response.data.data.content.content
        // Handle cases where content might be the object itself or a string
        const noticesData = typeof contentStr === 'string' ? JSON.parse(contentStr) : contentStr
        setNotices(Array.isArray(noticesData) ? noticesData : [])
      }
    } catch (error) {
      console.error('Error fetching notices:', error)
      // If 404 or any error, initialize with default notice
      setNotices([{
        id: 1,
        title: 'Important Notice',
        message: 'Admission process for B.F.Sc (Bachelor of Fishery Science) program 2025-26 is now open.',
        link: '/student-corner',
        linkText: 'Learn More',
        isActive: true,
        isPdf: false,
        pdfUrl: '',
        createdAt: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    try {
      setUploading(true)
      const response = await uploadAPI.single(file, 'documents')
      if (response.data.success) {
        const fileUrl = response.data.data.url || response.data.data.filename
        setFormData(prev => ({
          ...prev,
          pdfUrl: fileUrl,
          link: fileUrl, // Auto-set link as well
          isPdf: true
        }))
        toast.success('PDF uploaded successfully')
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      toast.error('Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let updatedNotices = [...notices]
      
      if (editingNotice) {
        // Update existing notice
        const index = updatedNotices.findIndex(notice => notice.id === editingNotice.id)
        if (index !== -1) {
          updatedNotices[index] = {
            ...editingNotice,
            ...formData,
            updatedAt: new Date().toISOString()
          }
        }
      } else {
        // Add new notice
        const newNotice = {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        }
        updatedNotices.unshift(newNotice)
      }

      // Save to backend
      await contentAPI.updateByKey('important-notices', {
        content: JSON.stringify(updatedNotices),
        section: 'homepage',
        subsection: 'notices',
        title: 'Important Notices',
        type: 'json',
        isPublished: true
      })

      setNotices(updatedNotices)
      resetForm()
      toast.success(editingNotice ? 'Notice updated successfully' : 'Notice created successfully')
    } catch (error) {
      console.error('Error saving notice:', error)
      toast.error('Failed to save notice')
    }
  }

  const handleEdit = (notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title || '',
      message: notice.message || '',
      link: notice.link || '',
      linkText: notice.linkText || '',
      isActive: notice.isActive !== undefined ? notice.isActive : true,
      isPdf: notice.isPdf || false,
      pdfUrl: notice.pdfUrl || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return
    }

    try {
      const updatedNotices = notices.filter(notice => notice.id !== id)
      
      await contentAPI.updateByKey('important-notices', {
        content: JSON.stringify(updatedNotices),
        section: 'homepage',
        subsection: 'notices',
        title: 'Important Notices',
        type: 'json',
        isPublished: true
      })

      setNotices(updatedNotices)
      toast.success('Notice deleted successfully')
    } catch (error) {
      console.error('Error deleting notice:', error)
      toast.error('Failed to delete notice')
    }
  }

  const toggleActive = async (id) => {
    try {
      const updatedNotices = notices.map(notice => 
        notice.id === id ? { ...notice, isActive: !notice.isActive } : notice
      )
      
      await contentAPI.updateByKey('important-notices', {
        content: JSON.stringify(updatedNotices),
        section: 'homepage',
        subsection: 'notices',
        title: 'Important Notices',
        type: 'json',
        isPublished: true
      })

      setNotices(updatedNotices)
      toast.success('Notice status updated')
    } catch (error) {
      console.error('Error updating notice status:', error)
      toast.error('Failed to update notice status')
    }
  }

  const resetForm = () => {
    setFormData({
      title: 'Important Notice',
      message: '',
      link: '/student-corner',
      linkText: 'Learn More',
      isActive: true,
      isPdf: false,
      pdfUrl: ''
    })
    setEditingNotice(null)
    setShowForm(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Important Notice Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Notice
        </button>
      </div>

      {showForm && (
        <Card className="bg-white border-blue-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {editingNotice ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notice Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  maxLength={100}
                  placeholder="e.g., Admission Open 2025-26"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notice Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="Enter the detailed notice message here..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notice Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isPdf: false})}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      !formData.isPdf 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Web Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isPdf: true})}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      formData.isPdf 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    PDF Document
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {formData.isPdf ? 'PDF URL / Attachment' : 'Redirect URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder={formData.isPdf ? "PDF path or URL" : "/student-corner, /programs, or external URL"}
                  />
                  {formData.isPdf && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="bg-gray-100 p-2.5 rounded-lg border border-gray-300 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[44px]"
                        title="Upload PDF"
                      >
                        {uploading ? <LoadingSpinner size="sm" /> : <Upload className="w-5 h-5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Button/Link Text
                </label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  maxLength={50}
                  placeholder="e.g., Learn More, Download PDF"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Active (visible on website)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {editingNotice ? 'Update Notice' : 'Create Notice'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {notices.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-gray-200">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-500">No notices found</h4>
            <p className="text-gray-400">Create your first important notice to display it on the homepage.</p>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card
              key={notice.id}
              className={`transition-all duration-300 hover:border-blue-200 ${!notice.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${notice.isPdf ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {notice.isPdf ? <FileText className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <h3 className="font-bold text-gray-900">{notice.title}</h3>
                    {!notice.isActive && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-line text-sm line-clamp-3">{notice.message}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-3 h-3" />
                      <span className="max-w-[150px] truncate">{notice.link}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">Label:</span>
                      <span>"{notice.linkText}"</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">Created:</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    {notice.isPdf && (
                      <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                        <FileText className="w-3 h-3" />
                        <span>PDF Format</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => toggleActive(notice.id)}
                    className={`p-2.5 rounded-lg transition-all ${
                      notice.isActive 
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                        : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={notice.isActive ? 'Deactivate notice' : 'Activate notice'}
                  >
                    {notice.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => handleEdit(notice)}
                    className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                    title="Edit notice"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete notice"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {notices.length > 0 && (
        <div className="text-sm text-gray-500 bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-blue-100 p-1 rounded-full text-blue-600 flex-shrink-0 mt-0.5">
            <Bell className="w-3 h-3" />
          </div>
          <p>
            <strong>Management Tip:</strong> Only active notices will be displayed on the homepage. Notices with the "PDF Document" type will open in a new tab when clicked by users.
          </p>
        </div>
      )}
    </div>
  )
}

export default ImportantNoticeManagement