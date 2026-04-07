import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Award, Building, Globe, BookOpen, Target, Eye, User, Users2, Settings } from 'lucide-react'
import Card from '../components/common/Card'
import { contentAPI, uploadAPI } from '../services/api'

const About = () => {
  const location = useLocation()
  const hash = location.hash.substring(1)
  const [welcomeData, setWelcomeData] = useState({
    deanName: '',
    deanTitle: '',
    deanPhoto: '',
    welcomeMessage: ''
  })
  
  const [aboutContent, setAboutContent] = useState({
    history: ''
  })

  const [mandateContent, setMandateContent] = useState({
    core: [],
    objectives: [],
    thrust: []
  })

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

  // Scroll to section when hash changes
  React.useEffect(() => {
    if (hash) {
      setTimeout(() => scrollToSection(hash), 100)
    }
  }, [hash])

  // Fetch dean's welcome message and about content
  useEffect(() => {
    fetchWelcomeData()
    fetchAboutContent()
  }, [])

  const fetchWelcomeData = async () => {
    try {
      const response = await contentAPI.getByKey('dean-welcome-message')
      const data = response.data
      
      if (data.success && data.data.content) {
        const content = data.data.content
        let welcomeInfo = {}
        
        // Parse the content based on type
        if (content.type === 'json') {
          try {
            welcomeInfo = JSON.parse(content.content)
          } catch (e) {
            console.warn('Failed to parse JSON content, using metadata')
            welcomeInfo = content.metadata || {}
          }
        } else {
          // Fallback to metadata
          welcomeInfo = content.metadata || {}
        }
        
        // Update welcome data with fetched information
        setWelcomeData({
          deanName: welcomeInfo.deanName || '',
          deanTitle: welcomeInfo.deanTitle || '',
          deanPhoto: welcomeInfo.deanPhoto || '',
          welcomeMessage: welcomeInfo.welcomeMessage || ''
        })
      }
    } catch (error) {
      console.error('Error fetching welcome data:', error)
      // Continue with default content if API fails
    }
  }

  const fetchAboutContent = async () => {
    try {
      // Fetch all about sections including mandate
      const [historyRes, mandateCoreRes, mandateObjectivesRes, mandateThrustRes] = await Promise.allSettled([
        contentAPI.getByKey('about-history'),
        contentAPI.getByKey('about-mandate-core'),
        contentAPI.getByKey('about-mandate-objectives'),
        contentAPI.getByKey('about-mandate-thrust')
      ])

      const newContent = { ...aboutContent }
      const newMandateContent = { ...mandateContent }


      // Process history
      if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
        newContent.history = historyRes.value.data.data.content.content || newContent.history
      }

      // Process mandate core
      if (mandateCoreRes.status === 'fulfilled' && mandateCoreRes.value.data.success) {
        const content = mandateCoreRes.value.data.data.content.content
        if (content) {
          try {
            newMandateContent.core = JSON.parse(content)
          } catch (e) {
            newMandateContent.core = content.split('\n').filter(item => item.trim())
          }
        }
      }

      // Process mandate objectives
      if (mandateObjectivesRes.status === 'fulfilled' && mandateObjectivesRes.value.data.success) {
        const content = mandateObjectivesRes.value.data.data.content.content
        if (content) {
          try {
            newMandateContent.objectives = JSON.parse(content)
          } catch (e) {
            newMandateContent.objectives = content.split('\n').filter(item => item.trim())
          }
        }
      }

      // Process mandate thrust
      if (mandateThrustRes.status === 'fulfilled' && mandateThrustRes.value.data.success) {
        const content = mandateThrustRes.value.data.data.content.content
        if (content) {
          try {
            newMandateContent.thrust = JSON.parse(content)
          } catch (e) {
            newMandateContent.thrust = content.split('\n').filter(item => item.trim())
          }
        }
      }

      setAboutContent(newContent)
      setMandateContent(newMandateContent)
    } catch (error) {
      console.error('Error fetching about content:', error)
      // Continue with default content if API fails
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-300 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-6 h-6 bg-white/20 rotate-45 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-yellow-300/30 rounded-full animate-bounce"></div>
          <div className="absolute top-40 left-1/4 w-3 h-8 bg-green-300/25 animate-pulse"></div>
          <div className="absolute bottom-16 right-1/3 w-5 h-5 bg-white/15 rotate-12 animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Our College
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Excellence in Fishery Education & Research since 2012
            </p>
          </div>
        </div>
      </section>

      {/* Dean's Message */}
      <section id="dean-message" className="section-padding bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Enhanced background decorative elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 right-10 w-36 h-36 bg-blue-400 rounded-full blur-4xl"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-teal-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-indigo-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Enhanced floating academic elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Academic/leadership themed elements */}
          <div className="absolute top-20 left-1/4 w-6 h-6 bg-blue-200/25 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-16 right-1/4 w-8 h-6 bg-green-200/30 rounded-lg animate-pulse transform rotate-12" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-8 bg-teal-200/20 rounded animate-float" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/3 left-1/4 w-10 h-5 bg-indigo-200/25 rounded-full animate-bounce transform -rotate-12" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute top-40 right-40 w-5 h-5 bg-blue-300/20 rounded animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              {/* Floating decorative elements around image */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-300 rounded-full opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-green-300 rounded-full opacity-50 animate-bounce"></div>
              <div className="absolute top-1/2 -left-4 w-2 h-8 bg-yellow-300 opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <img 
                src={welcomeData.deanPhoto.startsWith('http') ? welcomeData.deanPhoto : uploadAPI.getImageUrl(welcomeData.deanPhoto, 'dean')} 
                alt={welcomeData.deanName} 
                className="w-full max-w-sm h-80 object-contain rounded-lg shadow-xl mx-auto border-4 border-gray-200 bg-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                onError={(e) => {
                  if (!e.target.dataset.fallbackUsed) {
                    e.target.dataset.fallbackUsed = 'true'
                    e.target.src = uploadAPI.getImageUrl('COF NEW.png', 'images')
                  }
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Message from the Dean</h2>
              <p className="text-gray-700 mb-4 text-left">
                {welcomeData.welcomeMessage}
              </p>
              <div className="border-t pt-4 mt-6">
                <p className="font-semibold text-gray-900">{welcomeData.deanName}</p>
                <p className="text-gray-600">{welcomeData.deanTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* History */}
      <section id="history" className="section-padding bg-gradient-to-br from-gray-50 via-white to-yellow-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-36 h-36 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 bg-orange-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-1/3 w-4 h-4 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-24 right-1/3 w-3 h-6 bg-orange-200 opacity-25 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">History of College</h2>
            <div className="w-20 h-1 bg-blue-400 rounded mx-auto mb-6"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-white to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group hover:scale-105">
              {/* Enhanced decorative elements */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-200 to-transparent opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-200 to-transparent opacity-25 group-hover:opacity-35 transition-opacity duration-300"></div>
              
              {/* Floating history elements */}
              <div className="absolute top-6 right-6 w-4 h-6 bg-yellow-300/25 rounded animate-float transform rotate-12" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-6 left-6 w-6 h-4 bg-orange-300/30 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-400/20 rounded animate-bounce" style={{animationDelay: '1.5s'}}></div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200/50 relative z-10">
                <div className="prose prose-lg max-w-none text-gray-700 text-left leading-relaxed" dangerouslySetInnerHTML={{ __html: aboutContent.history }} />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mandate */}
      <section id="mandate" className="section-padding bg-gradient-to-br from-white via-green-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-16 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-28 h-28 bg-blue-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-purple-400 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-5 h-5 bg-green-200 rotate-45 opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-200 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-6 bg-purple-200 opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mandate</h2>
            <div className="w-20 h-1 bg-blue-400 rounded mx-auto mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Core Mandate */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group hover:scale-105">
              {/* Enhanced decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-200 to-transparent opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              
              {/* Floating mandate elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-blue-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-4 right-4 w-5 h-3 bg-blue-400/20 rounded-full animate-float transform rotate-45" style={{animationDelay: '2s'}}></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative z-10 group-hover:text-blue-600 transition-colors duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Core Mandate
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-lg border border-blue-200/50 relative z-10">
                <ul className="space-y-3 text-gray-700 text-left">
                  {mandateContent.core.map((item, index) => (
                    <li key={index} className="flex items-start hover:bg-blue-100/50 p-2 rounded transition-colors duration-200">
                      <span className="text-blue-500 mr-2 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Objectives & Thrust Areas */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group hover:scale-105">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 right-0 w-18 h-18 bg-gradient-to-bl from-green-200 to-transparent opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-emerald-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                {/* Floating objective elements */}
                <div className="absolute top-3 left-3 w-4 h-4 bg-green-300/25 rounded animate-bounce" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute bottom-3 right-3 w-3 h-5 bg-emerald-300/30 rounded animate-float transform -rotate-12" style={{animationDelay: '2.5s'}}></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative z-10 group-hover:text-green-600 transition-colors duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  Objectives
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200/50 relative z-10">
                  <ul className="space-y-2 text-gray-700 text-left">
                    {mandateContent.objectives.map((item, index) => (
                      <li key={index} className="flex items-start hover:bg-green-100/50 p-2 rounded transition-colors duration-200">
                        <span className="text-green-500 mr-2 font-bold">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-white to-purple-50 border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group hover:scale-105">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-200 to-transparent opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                {/* Floating thrust elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-purple-300/30 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-4 left-4 w-6 h-3 bg-purple-400/20 rounded-full animate-float transform rotate-12" style={{animationDelay: '1s'}}></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative z-10 group-hover:text-purple-600 transition-colors duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  Thrust Areas
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200/50 relative z-10">
                  <ul className="space-y-2 text-gray-700 text-left">
                    {mandateContent.thrust.map((item, index) => (
                      <li key={index} className="flex items-start hover:bg-purple-100/50 p-2 rounded transition-colors duration-200">
                        <span className="text-purple-500 mr-2 font-bold">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About






