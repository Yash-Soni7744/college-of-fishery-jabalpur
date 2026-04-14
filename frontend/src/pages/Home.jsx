import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Bell, FileText, ExternalLink, Calendar, Users, Award, BookOpen, Share2, AlertTriangle, X } from 'lucide-react'
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
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false)

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

      {/* Important Alerts Ribbon */}
      {importantNotices.length > 0 && (
        <div
          className="w-full bg-[#1e40af] text-white flex items-center cursor-pointer hover:bg-blue-800 transition-colors border-b-4 border-blue-500 overflow-hidden relative shadow-md"
          onClick={() => setIsNoticesModalOpen(true)}
          style={{ height: '48px' }}
        >
          {/* Static Title Box */}
          <div className="bg-[#1e3a8a] h-full flex items-center pl-4 pr-6 shrink-0 relative z-20 font-bold whitespace-nowrap shadow-[4px_0_10px_rgba(0,0,0,0.3)] min-w-[max-content]">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            <span className="hidden sm:inline">Important alerts</span>
            <span className="sm:hidden">Alerts</span>
            {/* arrow effect on right */}
            <div className="absolute top-0 -right-4 w-0 h-0 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent border-l-[16px] border-l-[#1e3a8a]"></div>
          </div>

          {/* Notices List (Static) */}
          <div className="flex-1 h-full overflow-hidden relative lg:ml-6 ml-4 flex items-center">
            <div className="w-full h-full flex items-center font-medium text-sm sm:text-base whitespace-nowrap mask-image-right overflow-hidden">
              {importantNotices.map((notice, idx) => {
                const isNew = notice.createdAt && (new Date() - new Date(notice.createdAt)) < (30 * 24 * 60 * 60 * 1000);
                return (
                  <span key={notice.id || idx} className="inline-flex items-center mr-10 hover:underline">
                    <span className="mr-2 text-white/60">•</span>
                    <span className="truncate max-w-[250px] sm:max-w-[400px]">{notice.title}</span>
                    {isNew && (
                      <span className="ml-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full relative shadow-sm flex-shrink-0">
                        New
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

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
          <div className="absolute bottom-16 right-1/3 w-5 h-5 bg-indigo-200 rotate-12 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-6 bg-pink-200 opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
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

              {/* The Important Notices Card was moved to the floating ribbon above. */}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Slider */}
      <div className="relative">
        {/* Additional floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-8 right-1/4 w-3 h-3 bg-green-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        <LogoSlider />
      </div>

      {/* Notices Modal Popup */}
      {isNoticesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-bounce-in relative">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2d4b7a] bg-[#1e3a8a] text-white shrink-0">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                <h2 className="text-xl font-medium" style={{ color: "white" }}>Important Alerts</h2>
              </div>
              <button
                onClick={() => setIsNoticesModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Notice List */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 sm:p-4 space-y-2 custom-scrollbar">
              {importantNotices.length > 0 ? (
                importantNotices.map((notice) => {
                  const isNew = notice.createdAt && (new Date() - new Date(notice.createdAt)) < (30 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={notice.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex sm:items-center sm:justify-between items-start flex-col sm:flex-row gap-4">

                        <div className="flex-1 pr-4">
                          <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm md:text-base cursor-pointer hover:text-blue-700 transition" onClick={() => {
                              const rawUrl = notice.link?.startsWith('http') ? notice.link : notice.link?.startsWith('/') ? notice.link : uploadAPI.getImageUrl(notice.link, 'documents');
                              if (notice.isPdf) {
                                if (rawUrl.startsWith('http')) {
                                  const serverHost = import.meta.env.VITE_SERVER_HOST || '/api';
                                  const downloadName = `${(notice.title || 'Notice').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                                  window.location.href = `${serverHost}/proxy/image?url=${encodeURIComponent(rawUrl)}&download=1&filename=${downloadName}`;
                                } else {
                                  window.location.href = rawUrl;
                                }
                              } else {
                                window.location.href = notice.link || '#';
                              }
                            }}>
                              {notice.title || notice.message}
                            </h4>
                            {isNew && (
                              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm inline-block">
                                NEW
                              </span>
                            )}
                          </div>

                          {notice.message && notice.message !== notice.title && (
                            <p className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
                              {notice.message}
                            </p>
                          )}

                          {notice.createdAt && (
                            <p className="text-xs font-semibold text-gray-500">
                              {new Date(notice.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 w-full sm:w-auto">
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
                                  window.location.href = rawUrl;
                                }
                              }}
                              className="w-full sm:w-auto justify-center inline-flex items-center text-sm font-semibold text-white bg-[#1e3a8a] px-4 py-2 rounded-md hover:bg-blue-900 transition-all shadow-sm"
                            >
                              {notice.linkText || 'Download PDF'}
                              <ExternalLink className="ml-1.5 h-4 w-4" />
                            </button>
                          ) : (
                            <Link
                              to={notice.link || '#'}
                              className="w-full sm:w-auto justify-center inline-flex items-center text-sm font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-100 transition-all shadow-sm"
                              onClick={() => setIsNoticesModalOpen(false)}
                            >
                              {notice.linkText || 'Learn More'}
                              <ExternalLink className="ml-1.5 h-4 w-4" />
                            </Link>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500 font-medium">
                  No active notices at this time.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-end shrink-0">
              <button
                onClick={() => setIsNoticesModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm focus:outline-none"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Home








