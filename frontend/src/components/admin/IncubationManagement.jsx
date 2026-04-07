import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileText,
  Eye,
  EyeOff,
  Upload,
  User,
  Building,
  MapPin,
  Mail,
  Phone,
  Award
} from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { Form, FormGroup, Input, Textarea, SubmitButton } from '../common/Form';
import { incubationAPI, uploadAPI } from '../../services/api';
import { downloadFile } from '../../services/files';
import toast from 'react-hot-toast';

const IncubationManagement = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [incubationData, setIncubationData] = useState({
    'activity': [],
    'governing-body': [],
    'management-committee': []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  const tabs = [
    { 
      id: 'activities', 
      name: 'Activities', 
      icon: Activity, 
      category: 'activity',
      description: 'Manage incubation center activities and programs'
    },
    { 
      id: 'governing-body', 
      name: 'Governing Body', 
      icon: Shield, 
      category: 'governing-body',
      description: 'Manage governing body member details'
    },
    { 
      id: 'management-committee', 
      name: 'Management Committee', 
      icon: Users, 
      category: 'management-committee',
      description: 'Manage management committee member details'
    }
  ];

  // Fetch incubation data
  useEffect(() => {
    fetchIncubationData();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showModal) {
        resetForm();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const fetchIncubationData = async () => {
    try {
      setLoading(true);
      const response = await incubationAPI.getAll();

      if (response.data.success) {
        setIncubationData(response.data.data.incubation);
      } else {
        console.error('Failed to fetch incubation data');
        toast.error('Failed to fetch incubation data');
      }
    } catch (error) {
      console.error('Error fetching incubation data:', error);
      toast.error('Error fetching incubation data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
    setShowModal(false);
    setUploadedFiles({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data object
      const dataToSend = { ...formData };
      
      // Add current category
      const currentCategory = tabs.find(tab => tab.id === activeTab)?.category;
      if (currentCategory) {
        dataToSend.category = currentCategory;
      }

      // Handle arrays
      if (dataToSend.expertise) {
        dataToSend.expertise = Array.isArray(dataToSend.expertise) 
          ? dataToSend.expertise 
          : dataToSend.expertise.split(',').map(item => item.trim());
      }
      if (dataToSend.tags) {
        dataToSend.tags = Array.isArray(dataToSend.tags) 
          ? dataToSend.tags 
          : dataToSend.tags.split(',').map(item => item.trim());
      }

      let response;
      if (editingItem) {
        response = await incubationAPI.update(editingItem._id, dataToSend);
      } else {
        response = await incubationAPI.create(dataToSend);
      }

      if (response.data.success) {
        await fetchIncubationData();
        resetForm();
        toast.success(`Incubation item ${editingItem ? 'updated' : 'created'} successfully`);
      } else {
        console.error('Error saving incubation item:', response.data.message);
        toast.error('Error saving incubation item: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error saving incubation item:', error);
      toast.error(error.response?.data?.message || 'Error saving incubation item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      // File fields
      image: item.image || '',
      document: item.document || '',
      // Activity fields
      icon: item.icon || '',
      color: item.color || '',
      subtitle: item.subtitle || '',
      // Person fields
      name: item.name || '',
      position: item.position || '',
      designation: item.designation || '',
      organization: item.organization || '',
      location: item.location || '',
      email: item.email || '',
      phone: item.phone || '',
      bio: item.bio || '',
      expertise: item.expertise ? item.expertise.join(', ') : '',
      tags: item.tags ? item.tags.join(', ') : '',
      order: item.order || 0,
      isPublished: item.isPublished !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await incubationAPI.delete(id);

      if (response.data.success) {
        await fetchIncubationData();
        toast.success('Incubation item deleted successfully');
      } else {
        toast.error('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Error deleting item');
    }
  };

  const handleFileUpload = async (file, fileType) => {
    try {
      console.log(`Starting ${fileType} upload:`, file.name);
      
      // Use uploadAPI with incubation category
      const response = await uploadAPI.single(file, 'incubation');
      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        // Extract just the filename from the response
        const filename = response.data.data.filename;
        console.log(`${fileType} uploaded filename:`, filename);
        
        // Update form data with the filename
        setFormData(prev => ({
          ...prev,
          [fileType]: filename
        }));
        
        toast.success(`${fileType === 'image' ? 'Image' : 'Document'} uploaded successfully`);
      } else {
        console.error('Upload failed:', response.data);
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast.error(`Failed to upload ${fileType === 'image' ? 'image' : 'document'}`);
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, fileType);
    }
  };

  const handleRemoveFile = (fileType) => {
    setFormData(prev => ({
      ...prev,
      [fileType]: ''
    }));
    toast.success(`${fileType === 'image' ? 'Image' : 'Document'} removed`);
  };

  const renderForm = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const isPersonCategory = currentTab?.category === 'governing-body' || currentTab?.category === 'management-committee';

    return (
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            resetForm();
          }
        }}
      >
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingItem ? 'Edit' : 'Add'} {currentTab?.name}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isPersonCategory ? 'Title/Role' : 'Title'} *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Person-specific fields */}
            {isPersonCategory && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Award className="inline h-4 w-4 mr-1" />
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Building className="inline h-4 w-4 mr-1" />
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.organization || ''}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expertise (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.expertise || ''}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Aquaculture, Research, Management"
                  />
                </div>
              </>
            )}

            {/* Activity-specific fields */}
            {currentTab?.category === 'activity' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Users, Target, Award"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color || ''}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. blue, green, red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. important, featured, new"
              />
            </div>

            {/* File Uploads */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Document (PDF/DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'document')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished !== false}
                onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                className="rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">Published</label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    );
  };

  const renderFormContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const isPersonCategory = currentTab?.category === 'governing-body' || currentTab?.category === 'management-committee';

    return (
      <Form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormGroup label={isPersonCategory ? 'Title/Role' : 'Title'} required>
            <Input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </FormGroup>

          <FormGroup label="Order">
            <Input
              type="number"
              value={formData.order || 0}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
            />
          </FormGroup>
        </div>

        {isPersonCategory && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <FormGroup label="Full Name" required>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup label="Position">
                <Input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="e.g., Chairperson, Member"
                />
              </FormGroup>

              <FormGroup label="Organization">
                <Input
                  type="text"
                  value={formData.organization || ''}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                />
              </FormGroup>

              <FormGroup label="Email">
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </FormGroup>
            </div>

            <FormGroup label="Expertise (comma-separated)">
              <Input
                type="text"
                value={formData.expertise || ''}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                placeholder="e.g. Aquaculture, Fisheries Management"
              />
            </FormGroup>
          </>
        )}

        {currentTab?.category === 'activity' && (
          <FormGroup label="Subtitle">
            <Input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            />
          </FormGroup>
        )}

        <FormGroup label="Description" required>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            required
          />
        </FormGroup>

        <FormGroup label="Tags (comma-separated)">
          <Input
            type="text"
            value={formData.tags || ''}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="e.g. important, featured, new"
          />
        </FormGroup>

        {/* File Upload Section */}
        {isPersonCategory ? (
          // Only image upload for governing body and management committee
          <FormGroup label="Profile Image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.image && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-600">
                    ✓ Current image: {formData.image}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('image')}
                    className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Remove</span>
                  </button>
                </div>
                <img 
                  src={uploadAPI.getImageUrl(formData.image, 'incubation')} 
                  alt="Profile" 
                  className="w-16 h-16 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </FormGroup>
        ) : (
          // Only document upload for activities
          <FormGroup label="Document (PDF/Word)">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'document')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.document && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-green-600">
                  ✓ Current document: {formData.document}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('document')}
                  className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Remove</span>
                </button>
              </div>
            )}
          </FormGroup>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished !== false}
            onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
            className="rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">Published</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <SubmitButton>
            {editingItem ? 'Update' : 'Create'}
          </SubmitButton>
        </div>
      </Form>
    );
  };

  const renderItemCard = (item) => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const isPersonCategory = currentTab?.category === 'governing-body' || currentTab?.category === 'management-committee';

    return (
      <Card key={item._id} className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="text-lg font-medium text-gray-900">{item.title || item.name}</h4>
              {item.isPublished ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Published
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Draft
                </span>
              )}
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.description}</p>
            
            {/* Section-specific display */}
            {isPersonCategory && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {item.position && (
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="text-sm font-medium">{item.position}</p>
                  </div>
                )}
                {item.organization && (
                  <div>
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="text-sm font-medium">{item.organization}</p>
                  </div>
                )}
                {item.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{item.email}</p>
                  </div>
                )}
              </div>
            )}

            {currentTab?.category === 'activity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {item.subtitle && (
                  <div>
                    <p className="text-xs text-gray-500">Subtitle</p>
                    <p className="text-sm font-medium">{item.subtitle}</p>
                  </div>
                )}
                {item.tags && (
                  <div>
                    <p className="text-xs text-gray-500">Tags</p>
                    <p className="text-sm font-medium">{item.tags}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Expertise display */}
            {item.expertise && item.expertise.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {item.expertise.slice(0, 3).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {item.expertise.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{item.expertise.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Order and date info */}
            <div className="text-xs text-gray-500 mt-2">
              Order: {item.order} | Created: {new Date(item.createdAt).toLocaleDateString()}
            </div>
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentCategory = tabs.find(tab => tab.id === activeTab)?.category;
  const currentItems = incubationData[currentCategory] || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incubation Management</h1>
        <p className="text-gray-600">
          Manage incubation center activities, governing body, and management committee details.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetForm();
                }}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white">
        {/* Add New Button and Form */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          {!showModal && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </button>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`${editingItem ? 'Edit' : 'Add'} ${tabs.find(tab => tab.id === activeTab)?.name}`}
          size="lg"
        >
          {renderFormContent()}
        </Modal>

        {/* Items List */}
        {currentItems.length > 0 ? (
          <div className="grid gap-6">
            {currentItems.map(renderItemCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} items yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncubationManagement;