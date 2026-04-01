import React, { useState, useEffect } from 'react'
import { Download, FileText, Calendar, Eye, Search, Filter } from 'lucide-react'
import { farmersAPI } from '../services/api'
import { getImageUrl } from '../services/files'
import Card from '../components/common/Card'
import toast from 'react-hot-toast'

const FarmersCorner = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  })

  // Advisory Form State
  const [advisoryForm, setAdvisoryForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General',
    query: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'advisory', label: 'Advisory Services' },
    { value: 'training', label: 'Training Materials' },
    { value: 'techniques', label: 'Aquaculture Techniques' },
    { value: 'research', label: 'Research Papers' },
    { value: 'government-schemes', label: 'Government Schemes' },
    { value: 'other', label: 'Other Resources' }
  ]

  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await farmersAPI.getResources(filters)
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

  const handleDownload = (resource) => {
    // Open download link in new tab
    window.open(getImageUrl('farmers', resource.filename), '_blank')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchResources()
  }

  const handleAdvisorySubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const response = await farmersAPI.sendAdvisoryQuery(advisoryForm)
      if (response.data.success || response.status === 200) {
        toast.success('Your advisory query has been sent successfully!')
        setAdvisoryForm({
          name: '',
          email: '',
          phone: '',
          category: 'General',
          query: ''
        })
      }
    } catch (error) {
      console.error('Error submitting advisory query:', error)
      const errorMsg = error.response?.data?.message || 'Failed to send query. Please try again.'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-left">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-green-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/4 w-44 h-44 bg-blue-300 rounded-full blur-4xl"></div>
        </div>
        
        {/* Agriculture/farming themed floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Agricultural shapes - seeds, leaves, tools */}
          <div className="absolute top-20 right-20 w-8 h-12 bg-green-300/15 rounded-full animate-float transform rotate-12" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-24 left-24 w-12 h-8 bg-emerald-300/20 rounded animate-float transform -rotate-12" style={{animationDelay: '2s'}}></div>
          
          {/* Farming elements */}
          <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-10 h-6 bg-green-300/25 rounded-lg animate-bounce transform rotate-45" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-4 h-8 bg-blue-300/20 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Farmers Corner
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Access comprehensive resources, guides, and materials to enhance your aquaculture knowledge and farming practices
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-200/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-green-200" />
                </div>
                <h3 className="font-semibold mb-2">Technical Guides</h3>
                <p className="text-sm text-green-100">Download documents and manuals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-200/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-8 h-8 text-blue-200" />
                </div>
                <h3 className="font-semibold mb-2">Free Resources</h3>
                <p className="text-sm text-blue-100">All materials are free to download</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-3 bg-emerald-200/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-emerald-200" />
                </div>
                <h3 className="font-semibold mb-2">Easy Access</h3>
                <p className="text-sm text-green-100">View online or download for offline use</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="section-padding bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-20 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-blue-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-emerald-300 rounded-full blur-2xl"></div>
        </div>

        {/* Resource-themed floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-8 h-8 bg-green-400/20 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 left-32 w-6 h-10 bg-blue-400/25 rounded-lg animate-float transform rotate-12" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-10 h-6 bg-emerald-400/20 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        </div>

        <div className="container-max relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Filter by Category:</span>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value})}
                  className="px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-300/20 to-blue-300/20 rounded-full transform translate-x-10 -translate-y-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-300/15 to-gray-300/15 rounded-full transform -translate-x-8 translate-y-8"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Resources Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filters.category || filters.search 
                    ? 'Try adjusting your filters or search terms.' 
                    : 'Resources will be available here soon.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {resources.map((resource) => (
                  <div key={resource._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-green-100/50 group hover:scale-105 relative overflow-hidden">
                    {/* Card corner decorations */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/15 to-blue-500/15 rounded-full transform -translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-emerald-400/10 to-green-500/10 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
                    
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-600 via-transparent to-blue-600"></div>
                    
                    <div className="space-y-4 relative z-10">
                      {/* Resource Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-green-600 transition-colors duration-300">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-orange-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                            <FileText className="w-7 h-7 text-red-600" />
                          </div>
                        </div>
                      </div>

                      {/* Resource Details */}
                      <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span className="bg-gradient-to-r from-green-100 to-blue-200 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium border border-green-300/50">
                            {categories.find(cat => cat.value === resource.category)?.label || resource.category}
                          </span>
                          <span className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                            <Download className="w-3 h-3" />
                            {resource.downloadCount} downloads
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-green-50/50 p-3 rounded-lg border border-gray-200/50">
                          <span className="font-medium text-gray-700">{formatFileSize(resource.fileSize)}</span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(resource.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-3">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 group/btn"
                        >
                          <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Download
                        </button>
                        <a
                          href={getImageUrl('farmers', resource.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="View in new tab"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            </>
          )}
        </div>
      </section>      {/* Advisory Support Form */}
      <section id="advisory-form" className="section-padding bg-white relative">
        <div className="container-max">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl border border-green-100 flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Expert Advisory</h2>
              <p className="text-gray-600 mb-8">
                Have a specific question about fish farming, pond management, or aquaculture techniques? 
                Submit your query here and our scientists from College of Fishery will get back to you with expert advice.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-green-700">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span>Verified Scientific Advice</span>
                </div>
                <div className="flex items-center gap-4 text-blue-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span>Response within 48-72 hours</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 bg-white rounded-2xl p-6 md:p-8 shadow-inner border border-gray-100">
              <form onSubmit={handleAdvisorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={advisoryForm.name}
                    onChange={(e) => setAdvisoryForm({...advisoryForm, name: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={advisoryForm.email}
                    onChange={(e) => setAdvisoryForm({...advisoryForm, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={advisoryForm.phone}
                    onChange={(e) => setAdvisoryForm({...advisoryForm, phone: e.target.value})}
                    placeholder="Mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Category</label>
                  <select
                    value={advisoryForm.category}
                    onChange={(e) => setAdvisoryForm({...advisoryForm, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="General">General Query</option>
                    <option value="Pond Management">Pond Management</option>
                    <option value="Seed Selection">Seed Selection</option>
                    <option value="Fish Diseases">Fish Health/Diseases</option>
                    <option value="Biofloc">Biofloc Technology</option>
                    <option value="Feed Management">Feed Management</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Detailed Query *</label>
                  <textarea
                    required
                    rows="4"
                    value={advisoryForm.query}
                    onChange={(e) => setAdvisoryForm({...advisoryForm, query: e.target.value})}
                    placeholder="Describe your question or problem in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {submitting ? 'Sending Request...' : 'Submit Advisory Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-40 h-40 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-green-300 rounded-full blur-2xl"></div>
        </div>
        
        {/* Support-themed floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-8 h-8 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-24 left-24 w-6 h-10 bg-green-300/20 rounded-lg animate-float transform rotate-12" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-10 h-6 bg-blue-300/25 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container-max text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Still Need Help?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            You can also visit our campus or reach out to our administration directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Contact Our Experts
            </a>
            <a
              href="/extension"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              View Extension Programs
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FarmersCorner
