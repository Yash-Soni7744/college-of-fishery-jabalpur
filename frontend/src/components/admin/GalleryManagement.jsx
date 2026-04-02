import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  Tag,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadAPI, galleryAPI } from '../../services/api'

const GalleryManagement = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedImages, setSelectedImages] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'campus',
    tags: '',
    order: 0,
    image: null
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'events', label: 'Events' },
    { value: 'campus', label: 'Campus Life' },
    { value: 'academics', label: 'Academics' },
    { value: 'research', label: 'Research' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'activities', label: 'Activities' },
    { value: 'facilities', label: 'Facilities' }
  ]

  // Helper function to get proper image URL
  const getImageUrl = (image) => {
    // If imageUrl starts with http or includes fishery_college, use it via central resolver
    if (image.imageUrl) {
      if (image.imageUrl.startsWith('http')) return image.imageUrl;
      return uploadAPI.getImageUrl(image.imageUrl, 'gallery');
    }
    
    // Fallback
    return '';
  }

  useEffect(() => {
    fetchImages()
  }, [selectedCategory, selectedStatus])

  const fetchImages = async () => {
    try {
      setLoading(true)
      
      const response = await galleryAPI.getAllAdmin({
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      })
      
      const data = response.data
      console.log('Gallery fetch response:', data)
      
      if (data.success) {
        setImages(data.data)
      } else {
        toast.error(data.error || 'Failed to fetch images')
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!uploadForm.image || !uploadForm.title || !uploadForm.category) {
      toast.error('Please fill in all required fields and select an image')
      return
    }

    try {
      setLoading(true)
      console.log('Starting gallery upload:', {
        title: uploadForm.title,
        category: uploadForm.category,
        imageSize: uploadForm.image.size,
        imageType: uploadForm.image.type
      })
      
      const formData = new FormData()
      formData.append('image', uploadForm.image)
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)
      formData.append('tags', uploadForm.tags)
      formData.append('order', uploadForm.order.toString())

      const response = await galleryAPI.create(formData)
      const data = response.data
      console.log('Upload response:', data)

      if (data.success) {
        toast.success('Image uploaded successfully')
        setShowUploadModal(false)
        setUploadForm({
          title: '',
          description: '',
          category: 'campus',
          tags: '',
          order: 0,
          image: null
        })
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    
    if (!editingImage.title || !editingImage.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title', editingImage.title)
      formData.append('description', editingImage.description || '')
      formData.append('category', editingImage.category)
      formData.append('tags', editingImage.tags?.join(', ') || '')
      formData.append('order', editingImage.order?.toString() || '0')
      formData.append('isActive', editingImage.isActive?.toString() || 'true')
      
      if (editingImage.newImage) {
        formData.append('image', editingImage.newImage)
      }

      const response = await galleryAPI.update(editingImage._id, formData)
      const data = response.data

      if (data.success) {
        toast.success('Image updated successfully')
        setShowEditModal(false)
        setEditingImage(null)
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to update image')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Failed to update image')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    try {
      console.log('Deleting image ID:', imageId)
      
      const response = await galleryAPI.delete(imageId)
      const data = response.data
      console.log('Delete response:', data)

      if (data.success) {
        toast.success('Image deleted successfully')
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select images to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) {
      return
    }

    try {
      const response = await galleryAPI.bulkDelete(selectedImages)
      const data = response.data

      if (data.success) {
        toast.success('Images deleted successfully')
        setSelectedImages([])
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to delete images')
      }
    } catch (error) {
      console.error('Error deleting images:', error)
      toast.error('Failed to delete images')
    }
  }

  const toggleImageStatus = async (imageId) => {
    try {
      const response = await galleryAPI.toggleStatus(imageId)
      const data = response.data

      if (data.success) {
        toast.success(data.message)
        fetchImages()
      } else {
        toast.error(data.error || 'Failed to toggle status')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to toggle status')
    }
  }

  const filteredImages = images.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage your photo gallery images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-blue-800">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedImages([])}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-4">Upload your first image to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload Image
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredImages.map(image => (
            <div key={image._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image._id)}
                  onChange={() => handleImageSelect(image._id)}
                  className="absolute top-2 left-2 z-10"
                />
                <img
                  src={getImageUrl(image)}
                  alt={image.title}
                  className="w-full h-40 object-cover cursor-pointer"
                  onClick={() => {
                    setPreviewImage(image)
                    setShowPreviewModal(true)
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${image.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {image.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                  {image.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">{image.category}</span>
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setPreviewImage(image)
                        setShowPreviewModal(true)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingImage(image)
                        setShowEditModal(true)
                      }}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleImageStatus(image._id)}
                    className={`text-xs px-2 py-1 rounded ${
                      image.isActive 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={image.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {image.isActive ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedImages(filteredImages.map(img => img._id))
                      } else {
                        setSelectedImages([])
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredImages.map(image => (
                <tr key={image._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image._id)}
                      onChange={() => handleImageSelect(image._id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={getImageUrl(image)}
                      alt={image.title}
                      className="w-12 h-12 object-cover rounded cursor-pointer"
                      onClick={() => {
                        setPreviewImage(image)
                        setShowPreviewModal(true)
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {image.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {image.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      image.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {image.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setPreviewImage(image)
                          setShowPreviewModal(true)
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingImage(image)
                          setShowEditModal(true)
                        }}
                        className="text-gray-400 hover:text-green-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(image._id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleImageStatus(image._id)}
                        className={`text-xs px-2 py-1 rounded ${
                          image.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {image.isActive ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Upload New Image</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadForm({
                    title: '',
                    description: '',
                    category: 'campus',
                    tags: '',
                    order: 0,
                    image: null
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, image: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {uploadForm.image && (
                  <div className="mt-2 relative">
                    <img
                      src={URL.createObjectURL(uploadForm.image)}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadForm({ ...uploadForm, image: null })
                        const fileInput = document.querySelector('input[type="file"][accept="image/*"]')
                        if (fileInput) fileInput.value = ''
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.slice(1).map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="campus, students, academic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={uploadForm.order}
                  onChange={(e) => setUploadForm({ ...uploadForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Image</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingImage(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image
                </label>
                <img
                  src={getImageUrl(editingImage)}
                  alt={editingImage.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingImage({ ...editingImage, newImage: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingImage.category}
                  onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.slice(1).map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingImage.tags?.join(', ') || ''}
                  onChange={(e) => setEditingImage({ 
                    ...editingImage, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  placeholder="campus, students, academic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingImage.order || 0}
                  onChange={(e) => setEditingImage({ ...editingImage, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingImage.isActive}
                  onChange={(e) => setEditingImage({ ...editingImage, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => {
                setShowPreviewModal(false)
                setPreviewImage(null)
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <img 
              src={getImageUrl(previewImage)}
              alt={previewImage.title}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
              <h3 className="text-xl font-semibold mb-2">{previewImage.title}</h3>
              {previewImage.description && (
                <p className="text-gray-200 mb-2">{previewImage.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center space-x-4">
                  <span className="bg-gray-600 px-2 py-1 rounded">{previewImage.category}</span>
                  {previewImage.tags && previewImage.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{previewImage.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(previewImage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryManagement





