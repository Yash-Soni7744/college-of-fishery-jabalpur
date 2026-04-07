import React, { useState, useEffect } from 'react'
import { Save, Eye, RefreshCw, Calendar, Building, FileText, Users, GraduationCap, Plus, Edit, Trash2, X, Fish, Settings, Leaf, Shield } from 'lucide-react'
import Card from '../common/Card'
import Modal, { ConfirmModal } from '../common/Modal'
import { Form, FormGroup, Input, Textarea, Select, SubmitButton } from '../common/Form'
import toast from 'react-hot-toast'
import { academicsAPI } from '../../services/api'

const AcademicsPageManagement = () => {
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'fish': return Fish
      case 'gear': return Settings
      case 'leaf': return Leaf
      case 'shield': return Shield
      case 'building':
      default: return Building
    }
  }

  const [academicsData, setAcademicsData] = useState({
    departments: [
      {
        name: 'Aquaculture',
        description: 'Fish culture, breeding, and production techniques',
        icon: 'fish'
      },
      {
        name: 'Fishery Resource Management',
        description: 'Sustainable fishery and resource conservation',
        icon: 'shield'
      },
      {
        name: 'Fish Processing Technology',
        description: 'Food technology and value addition in fishery',
        icon: 'gear'
      },
      {
        name: 'Aquatic Environment Management',
        description: 'Environmental aspects of aquatic ecosystems',
        icon: 'leaf'
      }
    ],
    calendar: {
      events: [
        { event: 'Admission Opens', date: 'June 2025' },
        { event: 'Classes Begin', date: 'July 2025' },
        { event: 'Examinations', date: 'December 2025' }
      ]
    },
    regulations: [
      {
        title: 'Attendance',
        description: 'Minimum 75% attendance required'
      },
      {
        title: 'Examinations',
        description: 'Mid-term & final examination system'
      },
      {
        title: 'Grading',
        description: 'Credit-based grading system'
      }
    ],
    faculty: {
      title: 'Expert Faculty Members',
      description: 'Highly qualified and experienced faculty members specializing in various fields of fishery science.'
    }
  })

  const [activeTab, setActiveTab] = useState('departments')
  const [loading, setLoading] = useState(true)

  // Department modal states
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: '',
    icon: 'building'
  })
  const [submittingDepartment, setSubmittingDepartment] = useState(false)

  // Regulation modal states
  const [showRegulationModal, setShowRegulationModal] = useState(false)
  const [editingRegulation, setEditingRegulation] = useState(null)
  const [regulationFormData, setRegulationFormData] = useState({
    title: '',
    description: ''
  })
  const [submittingRegulation, setSubmittingRegulation] = useState(false)

  // Calendar modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [editingCalendarEvent, setEditingCalendarEvent] = useState(null)
  const [calendarFormData, setCalendarFormData] = useState({
    event: '',
    date: ''
  })
  const [submittingCalendar, setSubmittingCalendar] = useState(false)

  // Faculty modal states
  const [showFacultyModal, setShowFacultyModal] = useState(false)
  const [facultyFormData, setFacultyFormData] = useState({
    title: '',
    description: ''
  })
  const [submittingFaculty, setSubmittingFaculty] = useState(false)

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ type: '', index: null, item: null })

  const tabs = [
    { id: 'departments', name: 'Departments', icon: Building },
    { id: 'calendar', name: 'Academic Calendar', icon: Calendar },
    { id: 'regulations', name: 'Regulations', icon: FileText },
    { id: 'additional', name: 'Faculty Section', icon: Users }
  ]

  useEffect(() => {
    fetchAcademicsData()
  }, [])

  const fetchAcademicsData = async () => {
    try {
      setLoading(true)
      const response = await academicsAPI.getPage()
      if (response.data.success) {
        setAcademicsData(response.data.data)
      } else {
        toast.error('Failed to load academics page data')
      }
    } catch (error) {
      console.error('Error fetching academics data:', error)
      toast.error('Failed to load academics page data')
    } finally {
      setLoading(false)
    }
  }

  const addDepartment = () => {
    setEditingDepartment(null)
    setDepartmentFormData({
      name: '',
      description: '',
      icon: 'building'
    })
    setShowDepartmentModal(true)
  }

  const editDepartment = (index) => {
    const dept = academicsData.departments[index]
    setEditingDepartment(index)
    setDepartmentFormData({
      name: dept.name,
      description: dept.description,
      icon: dept.icon
    })
    setShowDepartmentModal(true)
  }

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault()
    setSubmittingDepartment(true)

    try {
      if (editingDepartment !== null) {
        // Update existing department
        const updatedData = {
          ...academicsData,
          departments: academicsData.departments.map((dept, index) =>
            index === editingDepartment ? departmentFormData : dept
          )
        }
        setAcademicsData(updatedData)
        await academicsAPI.updatePage(updatedData)
        toast.success('Department updated successfully')
      } else {
        // Add new department
        const updatedData = {
          ...academicsData,
          departments: [...academicsData.departments, departmentFormData]
        }
        setAcademicsData(updatedData)
        await academicsAPI.updatePage(updatedData)
        toast.success('Department added successfully')
      }

      setShowDepartmentModal(false)
      setEditingDepartment(null)
      setDepartmentFormData({ name: '', description: '', icon: 'building' })
    } catch (error) {
      toast.error('Failed to save department')
    } finally {
      setSubmittingDepartment(false)
    }
  }

  const confirmDeleteDepartment = (index) => {
    const dept = academicsData.departments[index]
    setDeleteTarget({ type: 'department', index, item: dept })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      let updatedData = { ...academicsData }

      if (deleteTarget.type === 'department') {
        updatedData.departments = academicsData.departments.filter((_, i) => i !== deleteTarget.index)
        toast.success('Department deleted successfully')
      } else if (deleteTarget.type === 'calendar') {
        updatedData.calendar = {
          ...academicsData.calendar,
          events: academicsData.calendar.events.filter((_, i) => i !== deleteTarget.index)
        }
        toast.success('Calendar event deleted successfully')
      } else if (deleteTarget.type === 'regulation') {
        updatedData.regulations = academicsData.regulations.filter((_, i) => i !== deleteTarget.index)
        toast.success('Regulation deleted successfully')
      }

      setAcademicsData(updatedData)
      await academicsAPI.updatePage(updatedData)
    } catch (error) {
      toast.error('Failed to delete item')
    }

    setShowDeleteModal(false)
    setDeleteTarget({ type: '', index: null, item: null })
  }

  const removeDepartment = (index) => {
    confirmDeleteDepartment(index)
  }

  const handleDepartmentFormChange = (e) => {
    const { name, value } = e.target
    setDepartmentFormData(prev => ({ ...prev, [name]: value }))
  }

  // Regulation handlers
  const addRegulation = () => {
    setEditingRegulation(null)
    setRegulationFormData({
      title: '',
      description: ''
    })
    setShowRegulationModal(true)
  }

  const editRegulation = (index) => {
    const regulation = academicsData.regulations[index]
    setEditingRegulation(index)
    setRegulationFormData({
      title: regulation.title,
      description: regulation.description
    })
    setShowRegulationModal(true)
  }

  const handleRegulationSubmit = async (e) => {
    e.preventDefault()
    setSubmittingRegulation(true)

    try {
      if (editingRegulation !== null) {
        // Update existing regulation
        setAcademicsData(prev => ({
          ...prev,
          regulations: prev.regulations.map((reg, index) =>
            index === editingRegulation ? regulationFormData : reg
          )
        }))
        await academicsAPI.updatePage({
          ...academicsData,
          regulations: academicsData.regulations.map((reg, index) =>
            index === editingRegulation ? regulationFormData : reg
          )
        })
        toast.success('Regulation updated successfully')
      } else {
        // Add new regulation
        const updatedData = {
          ...academicsData,
          regulations: [...academicsData.regulations, regulationFormData]
        }
        setAcademicsData(updatedData)
        await academicsAPI.updatePage(updatedData)
        toast.success('Regulation added successfully')
      }

      setShowRegulationModal(false)
      setEditingRegulation(null)
      setRegulationFormData({ title: '', description: '' })
    } catch (error) {
      toast.error('Failed to save regulation')
    } finally {
      setSubmittingRegulation(false)
    }
  }

  const handleRegulationFormChange = (e) => {
    const { name, value } = e.target
    setRegulationFormData(prev => ({ ...prev, [name]: value }))
  }

  // Calendar handlers
  const addCalendarEvent = () => {
    setEditingCalendarEvent(null)
    setCalendarFormData({
      event: '',
      date: ''
    })
    setShowCalendarModal(true)
  }

  const editCalendarEvent = (index) => {
    const event = academicsData.calendar.events[index]
    setEditingCalendarEvent(index)
    setCalendarFormData({
      event: event.event,
      date: event.date
    })
    setShowCalendarModal(true)
  }

  const handleCalendarSubmit = async (e) => {
    e.preventDefault()
    setSubmittingCalendar(true)

    try {
      if (editingCalendarEvent !== null) {
        // Update existing event
        const updatedEvents = academicsData.calendar.events.map((evt, index) =>
          index === editingCalendarEvent ? calendarFormData : evt
        )
        const updatedData = {
          ...academicsData,
          calendar: { ...academicsData.calendar, events: updatedEvents }
        }
        setAcademicsData(updatedData)
        await academicsAPI.updatePage(updatedData)
        toast.success('Calendar event updated successfully')
      } else {
        // Add new event
        const updatedData = {
          ...academicsData,
          calendar: {
            ...academicsData.calendar,
            events: [...academicsData.calendar.events, calendarFormData]
          }
        }
        setAcademicsData(updatedData)
        await academicsAPI.updatePage(updatedData)
        toast.success('Calendar event added successfully')
      }

      setShowCalendarModal(false)
      setEditingCalendarEvent(null)
      setCalendarFormData({ event: '', date: '' })
    } catch (error) {
      toast.error('Failed to save calendar event')
    } finally {
      setSubmittingCalendar(false)
    }
  }

  const handleCalendarFormChange = (e) => {
    const { name, value } = e.target
    setCalendarFormData(prev => ({ ...prev, [name]: value }))
  }

  // Faculty handlers
  const editFaculty = () => {
    setFacultyFormData({
      title: academicsData.faculty.title,
      description: academicsData.faculty.description
    })
    setShowFacultyModal(true)
  }

  const handleFacultySubmit = async (e) => {
    e.preventDefault()
    setSubmittingFaculty(true)

    try {
      const updatedData = {
        ...academicsData,
        faculty: facultyFormData
      }
      setAcademicsData(updatedData)
      await academicsAPI.updatePage(updatedData)
      toast.success('Faculty section updated successfully')
      setShowFacultyModal(false)
    } catch (error) {
      toast.error('Failed to save faculty section')
    } finally {
      setSubmittingFaculty(false)
    }
  }

  const handleFacultyFormChange = (e) => {
    const { name, value } = e.target
    setFacultyFormData(prev => ({ ...prev, [name]: value }))
  }

  const removeCalendarEvent = (index) => {
    const event = academicsData.calendar.events[index]
    setDeleteTarget({ type: 'calendar', index, item: event })
    setShowDeleteModal(true)
  }

  const removeRegulation = (index) => {
    const regulation = academicsData.regulations[index]
    setDeleteTarget({ type: 'regulation', index, item: regulation })
    setShowDeleteModal(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'departments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                <p className="text-sm text-gray-600">Manage academic departments and their information</p>
              </div>
              <button
                onClick={addDepartment}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </button>
            </div>

            {academicsData.departments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No departments added yet</p>
                <button
                  onClick={addDepartment}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Department
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {academicsData.departments.map((dept, index) => {
                  const IconComponent = getIconComponent(dept.icon)
                  return (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{dept.name || 'Untitled Department'}</h4>
                            <p className="text-xs text-gray-500 capitalize">Icon: {dept.icon}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editDepartment(index)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteDepartment(index)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {dept.description || 'No description provided'}
                      </p>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Academic Calendar Events</h3>
                <p className="text-sm text-gray-600">Manage important academic dates and events</p>
              </div>
              <button
                onClick={addCalendarEvent}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </button>
            </div>

            {academicsData.calendar.events.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No calendar events added yet</p>
                <button
                  onClick={addCalendarEvent}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {academicsData.calendar.events.map((event, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{event.event || 'Untitled Event'}</h4>
                          <p className="text-xs text-gray-500">{event.date || 'No date set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editCalendarEvent(index)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeCalendarEvent(index)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 'regulations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Academic Regulations</h3>
                <p className="text-sm text-gray-600">Manage academic rules and regulations</p>
              </div>
              <button
                onClick={addRegulation}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Regulation
              </button>
            </div>

            {academicsData.regulations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No regulations added yet</p>
                <button
                  onClick={addRegulation}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Regulation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {academicsData.regulations.map((regulation, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{regulation.title || 'Untitled Regulation'}</h4>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editRegulation(index)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Regulation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeRegulation(index)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete Regulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {regulation.description || 'No description provided'}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 'additional':
        return (
          <div className="space-y-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Faculty Section</h3>
                    <p className="text-sm text-gray-600">Manage faculty section content</p>
                  </div>
                </div>
                <button
                  onClick={editFaculty}
                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Edit Faculty Section"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Title</h4>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {academicsData.faculty.title || 'No title set'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {academicsData.faculty.description || 'No description set'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )

      default:
        return <div>Select a tab to edit content</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading academics content...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading academics content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academics Page Management</h1>
          <p className="text-gray-600">Manage the content and sections of the academics page. Changes are saved automatically.</p>
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
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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

      {/* Department Modal */}
      <Modal
        isOpen={showDepartmentModal}
        onClose={() => {
          setShowDepartmentModal(false)
          setEditingDepartment(null)
          setDepartmentFormData({ name: '', description: '', icon: 'building' })
        }}
        title={editingDepartment !== null ? 'Edit Department' : 'Add New Department'}
        size="md"
      >
        <Form onSubmit={handleDepartmentSubmit}>
          <div className="space-y-4">
            <FormGroup label="Department Name" required>
              <Input
                name="name"
                value={departmentFormData.name}
                onChange={handleDepartmentFormChange}
                placeholder="Enter department name"
                required
              />
            </FormGroup>

            <FormGroup label="Icon">
              <Select
                name="icon"
                value={departmentFormData.icon}
                onChange={handleDepartmentFormChange}
                options={[
                  { value: 'building', label: 'Building' },
                  { value: 'fish', label: 'Fish' },
                  { value: 'gear', label: 'Gear' },
                  { value: 'leaf', label: 'Leaf' },
                  { value: 'shield', label: 'Shield' }
                ]}
              />
            </FormGroup>

            <FormGroup label="Description" required>
              <Textarea
                name="description"
                value={departmentFormData.description}
                onChange={handleDepartmentFormChange}
                placeholder="Enter department description"
                rows={3}
                required
              />
            </FormGroup>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowDepartmentModal(false)
                setEditingDepartment(null)
                setDepartmentFormData({ name: '', description: '', icon: 'building' })
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton isLoading={submittingDepartment}>
              {editingDepartment !== null ? 'Update Department' : 'Add Department'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Regulation Modal */}
      <Modal
        isOpen={showRegulationModal}
        onClose={() => {
          setShowRegulationModal(false)
          setEditingRegulation(null)
          setRegulationFormData({ title: '', description: '' })
        }}
        title={editingRegulation !== null ? 'Edit Regulation' : 'Add New Regulation'}
        size="md"
      >
        <Form onSubmit={handleRegulationSubmit}>
          <div className="space-y-4">
            <FormGroup label="Title" required>
              <Input
                name="title"
                value={regulationFormData.title}
                onChange={handleRegulationFormChange}
                placeholder="Enter regulation title"
                required
              />
            </FormGroup>

            <FormGroup label="Description" required>
              <Textarea
                name="description"
                value={regulationFormData.description}
                onChange={handleRegulationFormChange}
                placeholder="Enter regulation description"
                rows={3}
                required
              />
            </FormGroup>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowRegulationModal(false)
                setEditingRegulation(null)
                setRegulationFormData({ title: '', description: '' })
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton isLoading={submittingRegulation}>
              {editingRegulation !== null ? 'Update Regulation' : 'Add Regulation'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => {
          setShowCalendarModal(false)
          setEditingCalendarEvent(null)
          setCalendarFormData({ event: '', date: '' })
        }}
        title={editingCalendarEvent !== null ? 'Edit Calendar Event' : 'Add New Calendar Event'}
        size="md"
      >
        <Form onSubmit={handleCalendarSubmit}>
          <div className="space-y-4">
            <FormGroup label="Event Name" required>
              <Input
                name="event"
                value={calendarFormData.event}
                onChange={handleCalendarFormChange}
                placeholder="Enter event name"
                required
              />
            </FormGroup>

            <FormGroup label="Date" required>
              <Input
                name="date"
                value={calendarFormData.date}
                onChange={handleCalendarFormChange}
                placeholder="e.g., June 2025"
                required
              />
            </FormGroup>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowCalendarModal(false)
                setEditingCalendarEvent(null)
                setCalendarFormData({ event: '', date: '' })
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton isLoading={submittingCalendar}>
              {editingCalendarEvent !== null ? 'Update Event' : 'Add Event'}
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Faculty Modal */}
      <Modal
        isOpen={showFacultyModal}
        onClose={() => {
          setShowFacultyModal(false)
          setFacultyFormData({ title: '', description: '' })
        }}
        title="Edit Faculty Section"
        size="md"
      >
        <Form onSubmit={handleFacultySubmit}>
          <div className="space-y-4">
            <FormGroup label="Title" required>
              <Input
                name="title"
                value={facultyFormData.title}
                onChange={handleFacultyFormChange}
                placeholder="Enter faculty section title"
                required
              />
            </FormGroup>

            <FormGroup label="Description" required>
              <Textarea
                name="description"
                value={facultyFormData.description}
                onChange={handleFacultyFormChange}
                placeholder="Enter faculty section description"
                rows={4}
                required
              />
            </FormGroup>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowFacultyModal(false)
                setFacultyFormData({ title: '', description: '' })
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <SubmitButton isLoading={submittingFaculty}>
              Update Faculty Section
            </SubmitButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget.type === 'department' ? 'Department' : deleteTarget.type === 'calendar' ? 'Calendar Event' : deleteTarget.type === 'regulation' ? 'Regulation' : 'Item'}`}
        message={
          deleteTarget.type === 'department'
            ? `Are you sure you want to delete "${deleteTarget.item?.name}"? This action cannot be undone.`
            : deleteTarget.type === 'calendar'
              ? `Are you sure you want to delete the event "${deleteTarget.item?.event}"? This action cannot be undone.`
              : deleteTarget.type === 'regulation'
                ? `Are you sure you want to delete the regulation "${deleteTarget.item?.title}"? This action cannot be undone.`
                : 'Are you sure you want to delete this item? This action cannot be undone.'
        }
        type="danger"
      />
    </div>
  )
}

export default AcademicsPageManagement