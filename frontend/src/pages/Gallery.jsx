import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Calendar, Eye } from 'lucide-react'
import Section, { SectionHeader } from '../components/common/Section'
import Card from '../components/common/Card'
import { uploadAPI, galleryAPI } from '../services/api'

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Helper function to get proper image URL
  const getImageUrl = (image) => {
    // If imageUrl starts with http, use it directly (external images)
    if (image.imageUrl && image.imageUrl.startsWith('http')) {
      return image.imageUrl;
    }
    
    // Use uploadAPI to get the full URL
    const url = uploadAPI.getImageUrl(image.imageUrl, 'gallery');
    return url;
  }

  const categories = [
    { id: 'all', name: 'All Images' },
    { id: 'events', name: 'Events' },
    { id: 'campus', name: 'Campus Life' },
    { id: 'academics', name: 'Academics' },
    { id: 'research', name: 'Research' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'activities', name: 'Activities' },
    { id: 'facilities', name: 'Facilities' }
  ]

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      const response = await galleryAPI.getAll()
      const data = response.data
      
      if (data.success) {
        setImages(data.data || [])
      } else {
        setError(data.error || 'Failed to load images')
      }
    } catch (err) {
      console.error('Error fetching gallery images:', err)
      setError('Failed to load images')
    } finally {
      setLoading(false)
    }
  }
  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(image => image.category === activeFilter)

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    setCurrentImageIndex(0)
  }

  const navigateImage = (direction) => {
    let newIndex
    
    if (direction === 'next') {
      newIndex = currentImageIndex === filteredImages.length - 1 ? 0 : currentImageIndex + 1
    } else {
      newIndex = currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1
    }
    
    setSelectedImage(filteredImages[newIndex])
    setCurrentImageIndex(newIndex)
  }

  const handleKeyPress = (e) => {
    if (selectedImage) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigateImage('prev')
      if (e.key === 'ArrowRight') navigateImage('next')
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedImage, currentImageIndex])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading gallery</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchGalleryImages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-pink-400/15 to-indigo-500/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-purple-400/15 to-pink-500/15 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>

      {/* Header Section */}
      <Section background="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 relative overflow-hidden">
        {/* Header floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="text-center text-white relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Gallery</h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Explore our campus, facilities, and academic environment through these images
          </p>
        </div>
      </Section>

      {/* Filter Tabs */}
      <Section background="bg-white/90 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-6 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 ${
                activeFilter === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Eye className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No images found</h3>
            <p className="text-gray-600 text-lg">
              {activeFilter === 'all' 
                ? 'No images have been uploaded yet.' 
                : `No images found in the "${categories.find(c => c.id === activeFilter)?.name}" category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredImages.map((image, index) => (
              <div
                key={image._id} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-purple-100/50 hover:scale-105 relative"
                onClick={() => openLightbox(image, index)}
              >
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full transform -translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-pink-400/15 to-purple-500/15 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
                
                <div className="relative z-10">
                  <div className="relative overflow-hidden aspect-video">
                    <img 
                      src={getImageUrl(image)}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        if (!e.target.dataset.fallbackUsed) {
                          e.target.dataset.fallbackUsed = 'true'
                          console.error('Image failed to load:', e.target.src);
                          console.log('Trying fallback URL...');
                          // Fallback to direct imageUrl from database
                          e.target.src = image.imageUrl;
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        <ZoomIn className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">{image.title}</h3>
                    {image.description && (
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{image.description}</p>
                    )}
                    {image.date && (
                      <div className="flex items-center text-xs text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-xl border border-purple-200/50">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(image.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-3 bg-black/60 backdrop-blur-sm text-white rounded-2xl hover:bg-black/80 transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/60 backdrop-blur-sm text-white rounded-2xl hover:bg-black/80 transition-all shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/60 backdrop-blur-sm text-white rounded-2xl hover:bg-black/80 transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center">
              <img 
                src={getImageUrl(selectedImage)}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-6 rounded-b-2xl">
              <h3 className="text-2xl font-bold mb-3">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-gray-200 mb-3 text-lg leading-relaxed">{selectedImage.description}</p>
              )}
              {selectedImage.date && (
                <div className="flex items-center text-sm text-gray-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl w-fit">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedImage.date).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg">
              {currentImageIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information Section */}
      <Section background="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Section floating elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-purple-400/15 to-pink-500/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="text-center relative z-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent mb-6">
            Visit Our Campus
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            We welcome prospective students and their families to visit our campus and experience 
            our facilities firsthand. Schedule a visit to see why College of Fishery, Jabalpur 
            is the right choice for your education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              Schedule a Visit
            </a>
            <a
              href="/infrastructure"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Learn About Facilities
            </a>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default Gallery







