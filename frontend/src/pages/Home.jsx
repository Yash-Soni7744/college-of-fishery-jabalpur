import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Bell, FileText, ExternalLink, Calendar, Users, Award, BookOpen, Share2 } from 'lucide-react'
import Card from '../components/common/Card'
import HeroSlideshow from '../components/common/HeroSlideshow'
import LogoSlider from '../components/common/LogoSlider'
import SocialEmbed from '../components/common/SocialEmbed'
import { newsAPI, contentAPI, uploadAPI } from '../services/api'
import filesService from '../services/files'

const Home = () => {
  const [latestNews, setLatestNews] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [deanMessage, setDeanMessage] = useState('')
  const [importantNotices, setImportantNotices] = useState([])
  const [socialMediaLinks, setSocialMediaLinks] = useState([])
  const [welcomeData, setWelcomeData] = useState({
    deanName: '',
    deanTitle: '',
    deanPhoto: '',
    welcomeMessage: ''
  })
  const [loading, setLoading] = useState(true)

  // Helper function to truncate text
  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text
    const truncated = text.substring(0, maxLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    return lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) + '...' : truncated + '...'
  }

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      
      // Fetch essential data only with proper error handling
      const promises = [
        newsAPI.getAll({ featured: true }).catch(err => ({ error: true, message: err.message })),
        newsAPI.getAll({ type: 'event,seminar,workshop' }).catch(err => ({ error: true, message: err.message })),
        contentAPI.getByKey('dean-welcome-message').catch(err => ({ error: true, message: err.message })),
        contentAPI.getByKey('important-notices').catch(err => ({ error: true, message: err.message })),
        contentAPI.getByKey('social-media-links').catch(err => ({ error: true, message: err.message }))
      ]

      const [newsResponse, eventsResponse, welcomeResponse, noticesResponse, socialResponse] = await Promise.all(promises)

      // Process news data with safety checks
      if (newsResponse && !newsResponse.error && newsResponse.data?.success) {
        setLatestNews(Array.isArray(newsResponse.data.data?.newsEvents) ? newsResponse.data.data.newsEvents : [])
      }

      // Process events data with safety checks
      if (eventsResponse && !eventsResponse.error && eventsResponse.data?.success) {
        setUpcomingEvents(Array.isArray(eventsResponse.data.data?.newsEvents) ? eventsResponse.data.data.newsEvents : [])
      }

      // Process dean's welcome message with safety checks
      if (welcomeResponse && !welcomeResponse.error && welcomeResponse.data?.success) {
        const data = welcomeResponse.data
        if (data.data.content) {
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
      }

      // Process important notices with safety checks
      if (noticesResponse && !noticesResponse.error && noticesResponse.data?.success) {
        try {
          const contentData = noticesResponse.data.data.content
          const noticesData = JSON.parse(contentData.content || contentData)
          const activeNotices = Array.isArray(noticesData) 
            ? noticesData.filter(notice => notice.isActive) 
            : []
          setImportantNotices(activeNotices)
        } catch (e) {
          console.warn('Failed to parse notices content')
          setImportantNotices([])
        }
      } else {
        // No notices available
        setImportantNotices([])
      }

      // Process social media links with safety checks
      if (socialResponse && !socialResponse.error && socialResponse.data?.success) {
        try {
          const contentData = socialResponse.data.data.content
          const socialData = JSON.parse(contentData.content || contentData)
          const activeLinks = Array.isArray(socialData) 
            ? socialData.filter(link => link.isActive) 
            : []
          setSocialMediaLinks(activeLinks)
        } catch (e) {
          console.warn('Failed to parse social media links')
          setSocialMediaLinks([])
        }
      } else {
        // No social links available
        setSocialMediaLinks([])
      }

    } catch (error) {
      console.error('Error fetching home data:', error)
      // Continue with default content if APIs fail
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    {
      title: 'Admission Guidelines',
      href: '/student-corner',
      icon: BookOpen,
      description: 'Information about admission process and requirements'
    },
    {
      title: 'Academic Programs',
      href: '/academics',
      icon: Award,
      description: 'Explore our undergraduate and postgraduate programs'
    },
    {
      title: 'Research Activities',
      href: '/research',
      icon: FileText,
      description: 'Ongoing research projects and publications'
    },
    {
      title: 'Campus Facilities',
      href: '/infrastructure',
      icon: Users,
      description: 'Modern labs, hatcheries, and campus amenities'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Dean's Welcome Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-6 h-6 bg-blue-200 rotate-45 opacity-20 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-green-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute top-40 left-1/4 w-3 h-8 bg-yellow-200 opacity-25 animate-pulse"></div>
          <div className="absolute bottom-16 right-1/3 w-5 h-5 bg-indigo-200 rotate-12 opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-6 bg-pink-200 opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Dean's Welcome Message */}
            <div className="lg:col-span-2">
              <Card className="mb-8 bg-gradient-to-r from-white to-blue-50 border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded mr-3"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome from the Dean</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 relative">
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-300 rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-300 rounded-full opacity-50 animate-bounce"></div>
                    <img
                      src={welcomeData.deanPhoto.startsWith('http') ? welcomeData.deanPhoto : uploadAPI.getImageUrl(welcomeData.deanPhoto, 'dean')}
                      alt={welcomeData.deanName}
                      className="w-full h-48 md:h-56 lg:h-64 object-cover rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      onError={(e) => {
                        if (!e.target.dataset.fallbackUsed) {
                          e.target.dataset.fallbackUsed = 'true'
                          e.target.src = uploadAPI.getImageUrl('COF NEW.png', 'images')
                        }
                      }}
                    />
                  </div>
                  
                  <div className="text-left md:col-span-2">
                    <blockquote className="text-gray-700 text-lg leading-relaxed italic mb-4">
                      "{truncateText(welcomeData.welcomeMessage, 180)}"
                    </blockquote>
                    
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900">{welcomeData.deanName}</p>
                      <p className="text-gray-600">{welcomeData.deanTitle}</p>
                    </div>
                    
                    <Link
                      to="/about"
                      className="inline-flex items-center mt-4 text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Read Full Message
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Latest Updates */}
              <Card className="bg-gradient-to-r from-white to-green-50 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-200 to-transparent opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-200 to-transparent opacity-20"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Latest Updates & Announcements</h3>
                  </div>
                  <Link
                    to="/news-and-events"
                    className="text-green-700 hover:text-green-800 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestNews.length > 0 ? (
                      latestNews.map((news, index) => (
                        <div key={index} className="border-l-4 text-left border-green-500 pl-4 py-3 bg-gradient-to-r from-green-50 to-transparent hover:from-green-100 hover:to-green-50 transition-all duration-300 rounded-r-lg relative group">
                          <div className="absolute left-0 top-1/2 w-1 h-6 bg-green-400 rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <h4 className="font-medium text-gray-900 mb-1 group-hover:text-green-700 transition-colors duration-300">
                            <Link to={`/news-and-events/${news.slug || news._id}`} className="hover:text-green-700">
                              {news.title}
                            </Link>
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">{news.excerpt}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(news.createdAt || news.eventDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No news updates available at this time.</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Social Media Section */}
              {socialMediaLinks.length > 0 && (
                <Card className="mt-8 bg-gradient-to-r from-white to-indigo-50 border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                  {/* Decorative corner element */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-200 to-transparent opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-200 to-transparent opacity-20"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Follow Us on Social Media</h3>
                    </div>
                  </div>
                  
                  <div className="social-media-masonry">
                    {socialMediaLinks.map((link, index) => (
                      <div key={link.id || index} className="social-media-item">
                        <div className="social-media-embed-container">
                          <SocialEmbed
                            platform={link.platform}
                            url={link.url}
                            width="100%"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:h-full flex flex-col space-y-6">
              {/* Quick Links */}
              <Card className="bg-gradient-to-br from-white to-blue-50 border-t-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group hover:scale-[1.02]">
                {/* ... existing Quick Links content ... */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                
                <div className="flex items-center mb-4 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                </div>
                <div className="space-y-3">
                  {quickLinks.map((link, index) => {
                    const IconComponent = link.icon
                    return (
                      <Link
                        key={index}
                        to={link.href}
                        className="flex items-start p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 relative overflow-hidden"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-shadow duration-300 relative z-10">
                          <IconComponent className="w-5 h-5 text-green-600 group-hover:scale-110 group-hover:text-green-700 transition-all duration-300" />
                        </div>
                        <div className="flex-1 text-left relative z-10">
                          <h4 className="font-semibold text-gray-900 group-hover:text-green-700 mb-2 transition-colors duration-300">
                            {link.title}
                          </h4>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-2 rounded-lg border border-gray-200/50 group-hover:from-blue-50 group-hover:to-green-50 transition-all duration-300">
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed transition-colors duration-300">{link.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300 mt-2 relative z-10" />
                      </Link>
                    )
                  })}
                </div>
              </Card>
              
              {/* Important Notices and Alerts - Stretches to fill height */}
              {importantNotices.length > 0 && (
                <Card className="flex-1 bg-white border-t-4 border-orange-500 shadow-lg relative overflow-hidden flex flex-col min-h-[500px]">
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100 to-transparent opacity-60 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-50 to-transparent opacity-40 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-4 px-2 relative z-10 p-4 pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <Bell className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Important Notices & Alerts</h3>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 space-y-4 custom-scrollbar notice-slider-container">
                    {importantNotices.map((notice) => {
                      const isNew = notice.createdAt && (new Date() - new Date(notice.createdAt)) < (30 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div 
                          key={notice.id} 
                          className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 rounded-xl p-5 hover:border-orange-200 hover:shadow-md transition-all duration-300 relative group text-left"
                        >
                          {isNew && (
                            <span className="absolute -top-2 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce z-20">
                              NEW
                            </span>
                          )}
                          
                          <div className="flex items-start gap-3 mb-3 text-left">
                            <div className="mt-1 flex-shrink-0">
                              {notice.isPdf ? (
                                <FileText className="w-5 h-5 text-orange-600" />
                              ) : (
                                <Bell className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors text-left">
                              {notice.title}
                            </h4>
                          </div>
                          
                          <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-line border-l-2 border-orange-200 pl-3 text-left">
                            {notice.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {notice.createdAt && new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            
                            {notice.isPdf ? (
                              <button
                                onClick={() => {
                                  const rawUrl = notice.link?.startsWith('http') 
                                    ? notice.link 
                                    : notice.link?.startsWith('/') 
                                      ? notice.link 
                                      : uploadAPI.getImageUrl(notice.link, 'documents');
                                  
                                  if (rawUrl.startsWith('http')) {
                                    const serverHost = import.meta.env.VITE_SERVER_HOST || '/api';
                                    const downloadName = `${(notice.title || 'Notice').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                                    window.location.href = `${serverHost}/proxy/image?url=${encodeURIComponent(rawUrl)}&download=1&filename=${downloadName}`;
                                  } else {
                                    // Internal or same-origin link
                                    window.location.href = rawUrl;
                                  }
                                }}
                                className="inline-flex items-center text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-all shadow-sm"
                              >
                                {notice.linkText || 'Download PDF'}
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <Link
                                to={notice.link || '#'}
                                className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all shadow-sm"
                              >
                                {notice.linkText || 'Learn More'}
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Decorative indicator at bottom */}
                  <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 opacity-20"></div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Slider */}
      <div className="relative">
        {/* Additional floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-20 animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-8 right-1/4 w-3 h-3 bg-green-300 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>
        
        <LogoSlider />
      </div>

    </div>
  )
}

export default Home








