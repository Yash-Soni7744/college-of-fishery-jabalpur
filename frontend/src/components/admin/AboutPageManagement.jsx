import React, { useState, useEffect } from 'react'
import { Save, Plus, Trash2, AlertCircle, Info, Target, Award, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentAPI } from '../../services/api'

const AboutPageManagement = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aboutData, setAboutData] = useState({
    history: '',
    mandateCore: [''],
    mandateObjectives: [''],
    mandateThrust: ['']
  })

  useEffect(() => {
    fetchAboutData()
  }, [])

  const fetchAboutData = async () => {
    try {
      setLoading(true)
      
      // Fetch all about sections
      const [historyRes, mandateCoreRes, mandateObjectivesRes, mandateThrustRes] = await Promise.allSettled([
        contentAPI.getByKey('about-history'),
        contentAPI.getByKey('about-mandate-core'),
        contentAPI.getByKey('about-mandate-objectives'),
        contentAPI.getByKey('about-mandate-thrust')
      ])

      const newData = { ...aboutData }


      // Process history
      if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
        newData.history = historyRes.value.data.data.content.content || ''
      }

      // Process mandate core
      if (mandateCoreRes.status === 'fulfilled' && mandateCoreRes.value.data.success) {
        const content = mandateCoreRes.value.data.data.content.content
        if (content) {
          try {
            newData.mandateCore = JSON.parse(content)
          } catch (e) {
            newData.mandateCore = content.split('\n').filter(item => item.trim())
          }
        }
      }

      // Process mandate objectives
      if (mandateObjectivesRes.status === 'fulfilled' && mandateObjectivesRes.value.data.success) {
        const content = mandateObjectivesRes.value.data.data.content.content
        if (content) {
          try {
            newData.mandateObjectives = JSON.parse(content)
          } catch (e) {
            newData.mandateObjectives = content.split('\n').filter(item => item.trim())
          }
        }
      }

      // Process mandate thrust
      if (mandateThrustRes.status === 'fulfilled' && mandateThrustRes.value.data.success) {
        const content = mandateThrustRes.value.data.data.content.content
        if (content) {
          try {
            newData.mandateThrust = JSON.parse(content)
          } catch (e) {
            newData.mandateThrust = content.split('\n').filter(item => item.trim())
          }
        }
      }

      setAboutData(newData)
    } catch (error) {
      console.error('Error fetching about data:', error)
      toast.error('Failed to load about page data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMandateChange = (section, index, value) => {
    setAboutData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }))
  }

  const addMandateItem = (section) => {
    setAboutData(prev => ({
      ...prev,
      [section]: [...prev[section], '']
    }))
  }

  const removeMandateItem = (section, index) => {
    setAboutData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const saveSection = async (section, content, title) => {
    try {
      setSaving(true)
      
      let contentData = {
        key: `about-${section}`,
        title: title,
        type: 'text',
        section: 'about',
        subsection: section,
        isPublished: true
      }

      if (section.startsWith('mandate-')) {
        // For mandate sections, save as JSON array - ensure content is filtered and stringified
        const filteredContent = Array.isArray(content) ? content.filter(item => item && item.trim()) : []
        contentData.content = JSON.stringify(filteredContent)
        contentData.type = 'json'
        contentData.order = section === 'mandate-core' ? 4 : section === 'mandate-objectives' ? 5 : 6
      } else {
        contentData.content = typeof content === 'string' ? content : String(content || '')
        contentData.order = section === 'history' ? 3 : 7 // Adjust order logic or leave as is
      }

      await contentAPI.createOrUpdate(contentData)
      toast.success(`${title} saved successfully`)
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
      toast.error(`Failed to save ${title}`)
    } finally {
      setSaving(false)
    }
  }

  const saveAllSections = async () => {
    try {
      setSaving(true)
      
      const sections = [
        { key: 'history', title: 'College History', content: aboutData.history || '', type: 'text' },
        { key: 'mandate-core', title: 'Core Mandate', content: JSON.stringify((aboutData.mandateCore || []).filter(item => item && item.trim())), type: 'json' },
        { key: 'mandate-objectives', title: 'Mandate Objectives', content: JSON.stringify((aboutData.mandateObjectives || []).filter(item => item && item.trim())), type: 'json' },
        { key: 'mandate-thrust', title: 'Mandate Thrust Areas', content: JSON.stringify((aboutData.mandateThrust || []).filter(item => item && item.trim())), type: 'json' }
      ]

      await Promise.all(sections.map((section, index) => 
        contentAPI.createOrUpdate({
          key: `about-${section.key}`,
          title: section.title,
          content: section.content,
          type: section.type,
          section: 'about',
          subsection: section.key,
          isPublished: true,
          order: index + 1
        })
      ))

      toast.success('All sections saved successfully')
    } catch (error) {
      console.error('Error saving all sections:', error)
      toast.error('Failed to save some sections')
    } finally {
      setSaving(false)
    }
  }

  const renderMandateSection = (section, title, icon, color) => {
    const IconComponent = icon
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <IconComponent className={`w-5 h-5 ${color} mr-2`} />
            {title}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => addMandateItem(section)}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button
              onClick={() => saveSection(section, aboutData[section].filter(item => item.trim()), title)}
              disabled={saving}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {aboutData[section].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`${color.replace('text-', 'text-')} text-lg font-bold`}>•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleMandateChange(section, index, e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} item...`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {aboutData[section].length > 1 && (
                <button
                  onClick={() => removeMandateItem(section, index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">About Page Management</h1>
            <p className="text-gray-600">Manage About page content sections</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Content Management</p>
              <p>Manage the main content sections of the About page. Changes will be reflected immediately on the public website.</p>
            </div>
          </div>
        </div>
      </div>


      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">College History <span className="text-red-500">*</span></h2>
          <button
            onClick={() => saveSection('history', aboutData.history, 'College History')}
            disabled={saving}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
        <textarea
          value={aboutData.history}
          onChange={(e) => handleInputChange('history', e.target.value)}
          placeholder="Enter college history..."
          className="w-full h-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
      </div>

      {/* Mandate Sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Mandate Sections</h2>
        
        {/* Core Mandate */}
        {renderMandateSection('mandateCore', 'Core Mandate', Target, 'text-blue-500')}
        
        {/* Objectives */}
        {renderMandateSection('mandateObjectives', 'Objectives', Award, 'text-green-500')}
        
        {/* Thrust Areas */}
        {renderMandateSection('mandateThrust', 'Thrust Areas', BookOpen, 'text-purple-500')}
      </div>

      {/* Save All Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Save All Changes</h3>
            <p className="text-sm text-gray-600">Save all section changes at once</p>
          </div>
          <button
            onClick={saveAllSections}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save All Sections'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AboutPageManagement
