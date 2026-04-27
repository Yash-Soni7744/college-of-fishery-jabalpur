import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { slideshowAPI, uploadAPI } from '../../services/api'

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  // Fallback slides in case API fails or no slides exist
  const fallbackSlides = [
    {
      id: 1,
      image: '/slider.jpg'
    },
    {
      id: 2,
      image: '/slider-2.jpg'
    },
    {
      id: 3,
      image: '/slider-3.jpg'
    },
    {
      id: 4,
      image: '/slider-4.jpg'
    }
  ]

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await slideshowAPI.getAll()
      
      if (response.data.success && response.data.data.slides.length > 0) {
        const formattedSlides = response.data.data.slides.map(slide => ({
          id: slide._id,
          image: slide.image.startsWith('http') 
            ? slide.image 
            : uploadAPI.getImageUrl(slide.image, 'slideshow'),
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          cta: slide.cta,
          link: slide.link
        }))
        setSlides(formattedSlides)
      } else {
        // Use fallback slides if no slides in database
        setSlides(fallbackSlides)
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
      // Use fallback slides on error
      setSlides(fallbackSlides)
    } finally {
      setLoading(false)
    }
  }

  // Auto-advance slides
  useEffect(() => {
    if (slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      )
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex)
  }

  const goToPrevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)
  }

  const goToNextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full aspect-[21/9] min-h-[300px] overflow-hidden bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading slideshow...</div>
      </div>
    )
  }

  // Show message if no slides available
  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-[21/9] min-h-[300px] overflow-hidden flex items-center justify-center bg-[#1e40af]">
        <div className="text-white text-center z-10 px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">College of Fishery, Jabalpur</h1>
          <p className="text-lg md:text-2xl font-medium">Excellence in Fishery Education & Research</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[400px] max-h-[800px] overflow-hidden bg-gray-900 group">
      {/* Container height is now strictly fixed relative to the viewport. Images adjust themselves inside. */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Image scales up or down to fully fit entirely inside the fixed container without cropping */}
          <img 
            src={slide.image} 
            alt={slide.title || `Slide ${index + 1}`}
            className="w-full h-full object-contain"
            sizes="100vw"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
        <div 
          className="h-full bg-blue-400 transition-all duration-300 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%` 
          }}
        />
      </div>
    </div>
  )
}

export default HeroSlideshow







