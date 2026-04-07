import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Tag, ArrowLeft, Download, FileText, Share2 } from 'lucide-react'
import { newsAPI, uploadAPI } from '../services/api'
import { LoadingCard } from '../components/common/LoadingSpinner'
import { downloadFile } from '../services/files'
import toast from 'react-hot-toast'

const NewsAndEventsDetail = () => {
  const { id } = useParams() // This now accepts both slug and ID
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchItemDetail()
  }, [id])

  const fetchItemDetail = async () => {
    try {
      setLoading(true)
      const res = await newsAPI.getById(id) // Backend now supports both slug and ID
      if (res.data?.success) {
        const newsEvent = res.data.data.newsEvent
        setItem(newsEvent)
        
        // Update URL to use slug if currently using ID
        if (newsEvent.slug && id !== newsEvent.slug && id.match(/^[0-9a-fA-F]{24}$/)) {
          navigate(`/news-and-events/${newsEvent.slug}`, { replace: true })
        }
        
        // Update page title for SEO
        document.title = `${newsEvent.title} - College of Forestry`
      } else {
        setError('Item not found')
      }
    } catch (error) {
      console.error('Error fetching item detail:', error)
      setError('Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'news':
        return 'News'
      case 'announcement':
        return 'Announcement'
      case 'seminar':
        return 'Seminar'
      case 'workshop':
        return 'Workshop'
      case 'visit':
        return 'Field Visit'
      case 'event':
        return 'Event'
      default:
        return type
    }
  }

  const getTypeBadgeColor = (type) => {
    const isEvent = ['event', 'seminar', 'workshop', 'visit'].includes(type)
    return isEvent 
      ? 'bg-purple-600 text-white' 
      : 'bg-blue-600 text-white'
  }

  const isEventType = (type) => {
    return ['event', 'seminar', 'workshop', 'visit'].includes(type)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.excerpt,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word') || type?.includes('doc')) return '📝'
    return '📎'
  }

  const getFileSize = (url) => {
    // This would need backend support to get actual file size
    // For now, return placeholder
    return 'PDF Document'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-max">
          <LoadingCard />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-left">
        <div className="container-max text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested item could not be found.'}</p>
          <Link
            to="/news-and-events"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News & Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 text-left relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-red-400/15 to-pink-500/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-orange-500/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-orange-400/15 to-red-500/15 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>

      {/* Main Content */}
      <div className="container-max py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-orange-100/50 relative group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full transform -translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-red-400/15 to-pink-500/15 rounded-full transform translate-x-20 translate-y-20 group-hover:scale-110 transition-transform duration-300"></div>
            
            <div className="relative z-10">
              {/* Hero Image */}
              {item.images && item.images.length > 0 && (
                <div className="relative h-96 bg-gray-200 overflow-hidden">
                  <img
                    src={uploadAPI.getImageUrl(item.images[0].url, 'news')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-sm ${getTypeBadgeColor(item.type)} border border-white/20`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              {/* Article Header */}
              <div className="p-8 md:p-12">
                {/* Title Section */}
                <div className="mb-6">
                  {!item.images?.length && (
                    <div className="mb-4">
                      <span className={`inline-block px-6 py-3 rounded-2xl text-sm font-bold shadow-lg ${getTypeBadgeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent leading-tight">
                    {item.title}
                  </h1>
                </div>

                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-orange-200/50">
                  <div className="flex items-center text-gray-600 text-sm bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-200/50">
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    {formatDate(item.createdAt)}
                  </div>
                  {item.category && (
                    <span className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl text-sm font-medium capitalize border border-red-200/50">
                      {item.category}
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-xl text-sm font-bold border border-yellow-200/50">
                      ⭐ Featured
                    </span>
                  )}
                  <button
                    onClick={handleShare}
                    className="ml-auto text-gray-500 hover:text-orange-600 transition-colors bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200/50 hover:shadow-lg"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Event Details Card */}
                {isEventType(item.type) && (item.eventDate || item.venue || item.organizer) && (
                  <div className="mb-8 p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl border border-purple-200/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-full transform -translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-400/15 to-purple-500/15 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-200 rounded-lg flex items-center justify-center mr-3 shadow-md">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        Event Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {item.eventDate && (
                          <div className="flex items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-sm">
                            <Calendar className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-purple-600 uppercase font-semibold mb-1">Date</p>
                              <p className="text-gray-900 font-medium">{formatDate(item.eventDate)}</p>
                            </div>
                          </div>
                        )}
                        {item.venue && (
                          <div className="flex items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 shadow-sm">
                            <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Venue</p>
                              <p className="text-gray-900 font-medium">{item.venue}</p>
                            </div>
                          </div>
                        )}
                        {item.organizer && (
                          <div className="flex items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-200/50 shadow-sm">
                            <FileText className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-indigo-600 uppercase font-semibold mb-1">Organized By</p>
                              <p className="text-gray-900 font-medium">{item.organizer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Excerpt */}
                {item.excerpt && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200/50 shadow-sm">
                    <p className="text-xl text-gray-700 leading-relaxed font-medium">
                      {item.excerpt}
                    </p>
                  </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg max-w-none mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/50 shadow-sm">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-line"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {item.content}
                  </div>
                </div>

                {/* Attachments Section - Enhanced */}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full transform -translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-indigo-400/15 to-purple-500/15 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center mr-3 shadow-md">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Download Resources ({item.attachments.length})
                        </h3>
                      </div>
                      <div className="grid gap-4">
                        {item.attachments.map((attachment, index) => (
                          <button
                            key={index}
                            onClick={() => downloadFile(uploadAPI.getImageUrl(attachment.url, 'documents'), attachment.name)}
                            type="button"
                            className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-400/50 group cursor-pointer w-full text-left"
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center text-2xl group-hover:from-blue-200 group-hover:to-indigo-300 transition-all shadow-md">
                                {getFileIcon(attachment.type)}
                              </div>
                              <div className="ml-4 flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                  {attachment.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {getFileSize(attachment.url)}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl group-hover:from-blue-600 group-hover:to-indigo-700 transition-all shadow-md">
                                <Download className="w-5 h-5" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Gallery */}
                {item.images && item.images.length > 1 && (
                  <div className="mb-8 p-8 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 rounded-2xl border border-green-200/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full transform -translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-teal-400/15 to-blue-500/15 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-teal-200 rounded-lg flex items-center justify-center mr-3 shadow-md">
                          📸
                        </div>
                        Gallery
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {item.images.slice(1).map((image, index) => (
                          <div key={index} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-200/50">
                            <img
                              src={uploadAPI.getImageUrl(image.url, 'news')}
                              alt={image.caption || `Gallery image ${index + 1}`}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-sm text-white font-medium">
                                  {image.caption}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-purple-600" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all border border-purple-200/50 group"
                        >
                          <Tag className="w-3.5 h-3.5 mr-2 text-purple-500 group-hover:text-purple-600" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="pt-8 border-t border-orange-200/50">
                  <button
                    onClick={() => navigate('/news-and-events')}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    View All News & Events
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default NewsAndEventsDetail
