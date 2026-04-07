import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FlaskConical, Users, Award, BookOpen, Globe, Building, Fish, Microscope, Calendar, User, ExternalLink, DollarSign, FileText, Target, GraduationCap, Beaker, MapPin } from 'lucide-react'
import Card from '../components/common/Card'
import { getDocumentUrl, downloadFile } from '../services/files'
import { researchAPI } from '../services/api'

const Research = () => {
  const location = useLocation()
  const hash = location.hash.substring(1)
  const [researches, setResearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Fetch research data
  useEffect(() => {
    const fetchResearches = async () => {
      try {
        setLoading(true)
        const response = await researchAPI.getAll()
        setResearches(response.data.data.research || [])
        setError(null)
      } catch (error) {
        console.error('Error fetching researches:', error)
        setError('Failed to load research data')
      } finally {
        setLoading(false)
      }
    }

    fetchResearches()
  }, [])

  // Filter data by section
  const getDataBySection = (section) => {
    return researches.filter(r => r.section === section).sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  // Calculate statistics
  const getStats = () => {
    return {
      ongoingProjects: researches.filter(r => r.section === 'ongoing-projects').length,
      publications: researches.filter(r => r.section === 'publications').length,
      studentResearch: researches.filter(r => r.section === 'student-research').length,
      collaborations: researches.filter(r => r.section === 'collaborations').length,
      facilities: researches.filter(r => r.section === 'facilities').length,
      totalBudget: researches.reduce((sum, r) => sum + (r.budget || 0), 0)
    }
  }

  const stats = getStats()

  // Scroll to section when hash changes
  React.useEffect(() => {
    if (hash) {
      setTimeout(() => scrollToSection(hash), 100)
    }
  }, [hash])

  return (
    <div className="min-h-screen text-left">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-green-300 rounded-full blur-2xl"></div>
          <div className="absolute top-10 right-1/3 w-36 h-36 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/4 w-44 h-44 bg-blue-300 rounded-full blur-4xl"></div>
        </div>
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Simple fish-like shapes */}
          <div className="absolute top-20 right-20 w-16 h-8 bg-white/10 rounded-full animate-float transform rotate-12" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-24 left-24 w-14 h-7 bg-cyan-300/15 rounded-full animate-float transform -rotate-12" style={{animationDelay: '2s'}}></div>
          
          {/* Simple bubbles */}
          <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Research & Innovation
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Advancing Fishery Science Through Cutting-Edge Research & Technology
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{stats.ongoingProjects}</div>
                <div className="text-blue-200 text-sm">Ongoing/Completed Projects</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{stats.publications}</div>
                <div className="text-blue-200 text-sm">Publications</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">₹{(stats.totalBudget / 100000).toFixed(1)}L</div>
                <div className="text-blue-200 text-sm">Total Funding</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{stats.facilities}</div>
                <div className="text-blue-200 text-sm">Research Facilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Sections */}
      <section className="section-padding bg-gradient-to-br from-white via-blue-50 to-green-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 right-16 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-28 h-28 bg-green-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-cyan-400 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Large fishery-themed floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large swimming fish shapes */}
          <div className="absolute top-32 left-20 w-28 h-14 bg-blue-200/20 rounded-full animate-float transform rotate-12 blur-sm" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-96 right-24 w-32 h-16 bg-green-200/25 rounded-full animate-float transform -rotate-6 blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-[600px] left-16 w-24 h-12 bg-cyan-200/20 rounded-full animate-float transform rotate-45 blur-sm" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-[800px] right-32 w-36 h-18 bg-purple-200/15 rounded-full animate-float transform -rotate-12 blur-sm" style={{animationDelay: '3s'}}></div>
          
          {/* Large bubble circles */}
          <div className="absolute top-48 right-48 w-20 h-20 bg-blue-300/15 rounded-full animate-bounce blur-md" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-[400px] left-32 w-24 h-24 bg-green-300/12 rounded-full animate-bounce blur-md" style={{animationDelay: '1.8s'}}></div>
          <div className="absolute top-[700px] right-20 w-28 h-28 bg-cyan-300/18 rounded-full animate-bounce blur-lg" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute top-[900px] left-48 w-16 h-16 bg-purple-300/15 rounded-full animate-bounce blur-md" style={{animationDelay: '3.2s'}}></div>
          
          {/* Water ripple effects */}
          <div className="absolute top-64 left-1/3 w-40 h-8 bg-blue-200/10 rounded-full animate-pulse blur-xl transform rotate-3" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-[500px] right-1/3 w-48 h-10 bg-green-200/8 rounded-full animate-pulse blur-2xl transform -rotate-2" style={{animationDelay: '2.8s'}}></div>
          <div className="absolute top-[750px] left-1/4 w-36 h-6 bg-cyan-200/12 rounded-full animate-pulse blur-xl transform rotate-6" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading research data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-16">
              {/* 1. Ongoing/Completed Projects */}
              <div id="ongoing-projects">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Ongoing/Completed Projects</h2>
                  <p className="text-gray-600 mb-4">ICAR, NFDB, PMMSY, DBT and other funding agencies</p>
                  <div className="w-16 h-1 bg-blue-400 rounded mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getDataBySection('ongoing-projects').map((project, index) => (
                    <Card key={project._id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden group">
                      {/* Floating decorative elements */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className={`absolute top-2 left-2 w-2 h-2 rounded-full opacity-40 animate-pulse ${
                        index % 3 === 0 ? 'bg-blue-400' : index % 3 === 1 ? 'bg-green-400' : 'bg-cyan-400'
                      }`} style={{animationDelay: `${index * 0.5}s`}}></div>
                      
                      {/* Fish-like floating element */}
                      <div className={`absolute bottom-3 right-3 w-6 h-3 rounded-full opacity-20 animate-float ${
                        index % 3 === 0 ? 'bg-blue-300' : index % 3 === 1 ? 'bg-green-300' : 'bg-cyan-300'
                      } transform rotate-12`} style={{animationDelay: `${index * 0.3}s`}}></div>
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FlaskConical className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {project.status || 'ongoing'}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{project.title}</h3>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{project.description}</p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200/50">
                            <div className="flex items-center text-sm text-gray-700">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold">PI:</span>
                              <span className="ml-1 font-medium">{project.principalInvestigator}</span>
                            </div>
                          </div>
                          
                          {project.fundingAgency && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200/50">
                              <div className="flex items-center text-sm">
                                <Award className="w-4 h-4 mr-2 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  {project.fundingAgency}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {project.budget && (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200/50">
                              <div className="flex items-center text-sm">
                                <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                                <span className="text-orange-700 font-medium">
                                  ₹{(project.budget / 100000).toFixed(1)} Lakhs
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {project.duration && (project.duration.startDate || project.duration.endDate) && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200/50">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                <span className="text-purple-700 font-medium">
                                  {project.duration.startDate && new Date(project.duration.startDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })} - 
                                  {project.duration.endDate ? 
                                    new Date(project.duration.endDate).toLocaleDateString('en-GB', { 
                                      day: '2-digit', 
                                      month: 'short', 
                                      year: 'numeric' 
                                    }) : 'Ongoing'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {project.objectives && project.objectives.length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                            <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                              <Target className="w-3 h-3 mr-1" />
                              Key Objectives
                            </div>
                            {project.objectives.map((obj, index) => (
                              <div key={index} className="text-xs text-gray-600 mb-1">• {obj}</div>
                            ))}
                          </div>
                        )}
                        
                        {/* PDF Display */}
                        {project.filename && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => downloadFile(getDocumentUrl(project.filename), project.title || 'Document')}
                                type="button"
                                className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors border-none cursor-pointer"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Document
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {project.documents && project.documents.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {project.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(doc.url, doc.name || 'Details')}
                                  type="button"
                                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors border-none cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Details
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {getDataBySection('ongoing-projects').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No Ongoing/Completed Projects available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Publications and Journals */}
              <div id="publications">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Publications and Journals</h2>
                  <p className="text-gray-600 mb-4">Research publications and academic contributions</p>
                  <div className="w-16 h-1 bg-green-400 rounded mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getDataBySection('publications').map((publication) => (
                    <Card key={publication._id} className="hover:shadow-xl transition-all duration-300">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Publication
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{publication.title}</h3>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{publication.description}</p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200/50">
                            <div className="flex items-center text-sm text-gray-700">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold">Author:</span>
                              <span className="ml-1 font-medium">{publication.principalInvestigator}</span>
                            </div>
                          </div>
                          
                          {publication.journal && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200/50">
                              <div className="flex items-center text-sm">
                                <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  {publication.journal}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {publication.publicationDetails?.year && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200/50">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                <span className="text-purple-700 font-medium">
                                  {publication.publicationDetails.year}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {publication.doi && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                            <span className="font-medium">DOI:</span> {publication.doi}
                          </div>
                        )}
                        
                        {/* PDF Display */}
                        {publication.filename && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={getDocumentUrl(publication.filename)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View PDF
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {publication.documents && publication.documents.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {publication.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(doc.url, doc.name || 'Publication')}
                                  type="button"
                                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors border-none cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Publication
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {getDataBySection('publications').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No publications available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Student Research */}
              <div id="student-research">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Research</h2>
                  <p className="text-gray-600 mb-4">M.F.Sc. and B.F.Sc. student research projects</p>
                  <div className="w-16 h-1 bg-orange-400 rounded mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getDataBySection('student-research').map((research, index) => (
                    <Card key={research._id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 relative overflow-hidden group">
                      {/* Floating decorative elements */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-yellow-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                      
                      {/* Swimming fish elements */}
                      <div className={`absolute top-4 left-4 w-4 h-2 rounded-full opacity-30 animate-float ${
                        index % 3 === 0 ? 'bg-orange-400' : index % 3 === 1 ? 'bg-yellow-400' : 'bg-red-400'
                      } transform rotate-45`} style={{animationDelay: `${index * 0.7}s`}}></div>
                      
                      {/* Water bubbles */}
                      <div className={`absolute bottom-4 right-6 w-3 h-3 rounded-full opacity-25 animate-bounce ${
                        index % 2 === 0 ? 'bg-orange-300' : 'bg-yellow-300'
                      }`} style={{animationDelay: `${index * 0.5}s`}}></div>
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            Student Research
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{research.title}</h3>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{research.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium">Student:</span>
                            <span className="ml-1">{research.studentName || research.principalInvestigator}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="w-4 h-4 mr-2" />
                            <span className="font-medium">Supervisor:</span>
                            <span className="ml-1">{research.supervisor || research.principalInvestigator}</span>
                          </div>
                          
                          {research.degree && (
                            <div className="flex items-center text-xs">
                              <BookOpen className="w-3 h-3 mr-2 text-orange-500" />
                              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                {research.degree}
                              </span>
                            </div>
                          )}
                          
                          {research.completionYear && (
                            <div className="flex items-center text-xs">
                              <Calendar className="w-3 h-3 mr-2 text-purple-500" />
                              <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                {research.completionYear}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* PDF Display */}
                        {research.filename && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => downloadFile(getDocumentUrl(research.filename), research.title || 'Document')}
                              type="button"
                              className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors border-none cursor-pointer"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View Document
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </button>
                            </div>
                          </div>
                        )}
                        
                        {research.documents && research.documents.length > 0 && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                              {research.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(doc.url, doc.name || 'Thesis')}
                                  type="button"
                                  className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors border-none cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Thesis
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {getDataBySection('student-research').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No student research projects available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Research Collaborations */}
              <div id="collaborations">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Research Collaborations</h2>
                  <p className="text-gray-600 mb-4">Strategic partnerships and collaborative initiatives</p>
                  <div className="w-16 h-1 bg-purple-400 rounded mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getDataBySection('collaborations').map((collaboration, index) => (
                    <Card key={collaboration._id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50 relative overflow-hidden group">
                      {/* Floating decorative elements */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                      
                      {/* Swimming collaboration fish */}
                      <div className={`absolute top-5 left-5 w-7 h-4 rounded-full opacity-25 animate-float ${
                        index % 2 === 0 ? 'bg-purple-400' : 'bg-pink-400'
                      } transform -rotate-12`} style={{animationDelay: `${index * 0.4}s`}}></div>
                      
                      {/* Partnership bubbles */}
                      <div className={`absolute bottom-6 right-4 w-4 h-4 rounded-full opacity-30 animate-bounce ${
                        index % 3 === 0 ? 'bg-purple-300' : index % 3 === 1 ? 'bg-pink-300' : 'bg-indigo-300'
                      }`} style={{animationDelay: `${index * 0.6}s`}}></div>
                      
                      <div className={`absolute bottom-3 right-7 w-2 h-2 rounded-full opacity-25 animate-pulse ${
                        index % 2 === 0 ? 'bg-purple-200' : 'bg-pink-200'
                      }`} style={{animationDelay: `${index * 0.9}s`}}></div>
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Collaboration
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{collaboration.title}</h3>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{collaboration.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="w-4 h-4 mr-2" />
                            <span className="font-medium">Partner:</span>
                            <span className="ml-1">{collaboration.partnerInstitution || collaboration.principalInvestigator}</span>
                          </div>
                          
                          {collaboration.collaborationType && (
                            <div className="flex items-center text-xs">
                              <Globe className="w-3 h-3 mr-2 text-purple-500" />
                              <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                {collaboration.collaborationType}
                              </span>
                            </div>
                          )}
                          
                          {collaboration.duration && (collaboration.duration.startDate || collaboration.duration.endDate) && (
                            <div className="flex items-center text-xs">
                              <Calendar className="w-3 h-3 mr-2 text-blue-500" />
                              <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {collaboration.duration.startDate && new Date(collaboration.duration.startDate).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })} - 
                                {collaboration.duration.endDate ? 
                                  new Date(collaboration.duration.endDate).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  }) : 'Ongoing'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {collaboration.objectives && collaboration.objectives.length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                            <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                              <Target className="w-3 h-3 mr-1" />
                              Objectives
                            </div>
                            {collaboration.objectives.map((obj, index) => (
                              <div key={index} className="text-xs text-gray-600 mb-1">• {obj}</div>
                            ))}
                          </div>
                        )}
                        
                        {/* PDF Display */}
                        {collaboration.filename && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => downloadFile(getDocumentUrl(collaboration.filename), collaboration.title || 'Document')}
                                type="button"
                                className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors border-none cursor-pointer"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Document
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {collaboration.documents && collaboration.documents.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {collaboration.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(doc.url, doc.name || 'Agreement')}
                                  type="button"
                                  className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors border-none cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Agreement
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {getDataBySection('collaborations').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No collaborations available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Research Facilities */}
              <div id="facilities">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Research Facilities</h2>
                  <p className="text-gray-600 mb-4">State-of-the-art research infrastructure and equipment</p>
                  <div className="w-16 h-1 bg-indigo-400 rounded mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getDataBySection('facilities').map((facility, index) => (
                    <Card key={facility._id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-indigo-50 relative overflow-hidden group">
                      {/* Floating decorative elements */}
                      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-purple-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                      
                      {/* Fish tank bubbles */}
                      <div className={`absolute top-3 right-5 w-2 h-2 rounded-full opacity-40 animate-bounce ${
                        index % 3 === 0 ? 'bg-indigo-400' : index % 3 === 1 ? 'bg-purple-400' : 'bg-blue-400'
                      }`} style={{animationDelay: `${index * 0.3}s`}}></div>
                      
                      <div className={`absolute top-6 right-3 w-1 h-1 rounded-full opacity-30 animate-pulse ${
                        index % 2 === 0 ? 'bg-indigo-300' : 'bg-purple-300'
                      }`} style={{animationDelay: `${index * 0.8}s`}}></div>
                      
                      {/* Laboratory equipment styled element */}
                      <div className={`absolute bottom-4 left-4 w-6 h-3 rounded opacity-25 animate-float ${
                        index % 2 === 0 ? 'bg-indigo-300' : 'bg-purple-300'
                      } transform rotate-6`} style={{animationDelay: `${index * 0.6}s`}}></div>
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Building className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            Facility
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{facility.title}</h3>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{facility.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium">In-charge:</span>
                            <span className="ml-1">{facility.facilityIncharge || facility.principalInvestigator}</span>
                          </div>
                          
                          {facility.location && (
                            <div className="flex items-center text-xs">
                              <MapPin className="w-3 h-3 mr-2 text-indigo-500" />
                              <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                {facility.location}
                              </span>
                            </div>
                          )}
                          
                          {facility.capacity && (
                            <div className="flex items-center text-xs">
                              <Users className="w-3 h-3 mr-2 text-green-500" />
                              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                Capacity: {facility.capacity}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {facility.equipment && facility.equipment.length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                            <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                              <FlaskConical className="w-3 h-3 mr-1" />
                              Key Equipment
                            </div>
                            {facility.equipment.slice(0, 3).map((eq, index) => (
                              <div key={index} className="text-xs text-gray-600 mb-1">• {eq}</div>
                            ))}
                            {facility.equipment.length > 3 && (
                              <div className="text-indigo-600 font-medium">+{facility.equipment.length - 3} more</div>
                            )}
                          </div>
                        )}
                        
                        {/* PDF Display */}
                        {facility.filename && (
                          <div className="pt-3 border-t border-gray-100 mt-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => downloadFile(getDocumentUrl(facility.filename), facility.title || 'Document')}
                                type="button"
                                className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors border-none cursor-pointer"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Document
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {facility.documents && facility.documents.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {facility.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadFile(doc.url, doc.name || 'Agreement')}
                                  type="button"
                                  className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors border-none cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Specifications
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {getDataBySection('facilities').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No research facilities available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Research