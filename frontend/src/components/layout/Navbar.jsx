import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

const Navbar = () => {
  const { siteName } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'About Us',
      href: '/about',
      dropdown: [
           { name: 'Message from the Dean', href: '/about', section: 'dean-message' },
          { name: 'History', href: '/about', section: 'history' },
        { name: 'Mandate', href: '/about', section: 'mandate' }
         ]
    },
    {
      name: 'Academics',
      href: '/academics', 
      dropdown: [
        { name: 'Programs Offered', href: '/academics', section: 'programs' },
        { name: 'Academic Calendar', href: '/academics', section: 'calendar' },
        { name: 'Departments', href: '/academics', section: 'departments' },
        { name: 'Faculty Directory', href: '/faculty', section: 'faculty' },
        { name: 'Academic Regulations', href: '/academics', section: 'regulations' }
      ]
    },
    {
      name: 'Research',
      href: '/research',
      dropdown: [
        { name: 'Ongoing/Completed Projects', href: '/research', section: 'ongoing-projects' },
        { name: 'Publications and Journals', href: '/research', section: 'publications' },
        { name: 'Student Research', href: '/research', section: 'student-research' },
        { name: 'Research Collaborations', href: '/research', section: 'collaborations' },
        { name: 'Research Facilities', href: '/research', section: 'facilities' }
      ]
    },
    {
      name: 'Extension & Outreach',
      href: '/extension',
      dropdown: [
        { name: 'Farmer Training Programs', href: '/extension', section: 'farmer-training' },
        { name: 'FFPO and SHG Support', href: '/extension', section: 'ffpo-shg' },
        { name: 'Aquaculture Demonstrations', href: '/extension', section: 'demonstrations' },
        { name: 'Success Stories', href: '/extension', section: 'success-stories' }
      ]
    },
    {
      name: 'Infrastructure',
      href: '/infrastructure',
      dropdown: [
        { name: 'Classrooms and Labs', href: '/infrastructure', section: 'classrooms' },
        { name: 'Hatcheries and Demo Units', href: '/infrastructure', section: 'hatcheries' },
        { name: 'Library and e-Resources', href: '/infrastructure', section: 'library' },
        { name: 'Hostels and Campus Facilities', href: '/infrastructure', section: 'hostels' },
        { name: 'Fish Processing & Feed Units', href: '/infrastructure', section: 'processing' }
      ]
    },
    { name: 'Incubation Centre', href: '/incubation' },
    { name: 'Placement Cell', href: '/placement' },
    {
      name: 'Students Corner',
      href: '/student-corner',
      dropdown: [
        { name: 'Admission Guidelines', href: '/student-corner', section: 'admission-guidelines' },
        { name: 'Scholarships & Fellowships', href: '/student-corner', section: 'scholarships' },
        { name: 'Student Council / Clubs', href: '/student-corner', section: 'student-council' }
      ]
    },
    { name: 'Collaborations', href: '/collaborations' },
    { name: 'Farmers Corner', href: '/farmers-corner' },
    {
      name: 'Alumni Association',
      href: '/alumni',
      dropdown: [
        { name: 'Alumni Testimonials', href: '/alumni', section: 'testimonials' },
        { name: 'Alumni Events', href: '/alumni', section: 'events' },
        { name: 'Alumni Office', href: '/alumni', section: 'office' },
      ]
    },
    {
      name: 'News & Events',
      href: '/news-and-events',
      dropdown: [
        { name: 'All News & Events', href: '/news-and-events' },
        { name: 'News Articles', href: '/news-and-events?type=news' },
        { name: 'Announcements', href: '/news-and-events?type=announcement' },
        { name: 'Seminars', href: '/news-and-events?type=seminar' },
        { name: 'Workshops', href: '/news-and-events?type=workshop' },
        { name: 'Events', href: '/news-and-events?type=event' },
        { name: 'Field Visits', href: '/news-and-events?type=visit' },
        { name: 'Photo Gallery', href: '/gallery' }
      ]
    },
    { name: 'Contact Us', href: '/contact' }
  ]

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === href
    }
    // Special handling for academics route
    if (href === '/academics') {
      return location.pathname === '/academics'
    }
    // Special handling for news-and-events route
    if (href === '/news-and-events') {
      return location.pathname === '/news-and-events' || location.pathname.startsWith('/news-and-events/')
    }
    return location.pathname.startsWith(href)
  }

  const scrollToSection = (sectionId) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const handleNavClick = (item) => {
    try {
      if (item.section) {
        if (location.pathname === item.href) {
          scrollToSection(item.section)
        } else {
          navigate(item.href)
          // First scroll to top, then scroll to section
          window.scrollTo({ top: 0, behavior: 'instant' })
          scrollToSection(item.section)
        }
      } else {
        navigate(item.href)
        // Always scroll to top when navigating to a new page
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 50)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback navigation
      navigate(item.href)
    }
    setActiveDropdown(null)
    setIsOpen(false)
  }

  // Handle hash changes for direct URL access
  useEffect(() => {
    const hash = location.hash.substring(1)
    if (hash) {
      scrollToSection(hash)
    }
  }, [location.hash])

  // Scroll to top when route changes (except for hash changes)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  // Improved hover handling with cancelable close timer
  const closeTimerRef = useRef(null)
  const dropdownRef = useRef(null)

  const openDropdown = (index) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveDropdown(index)
  }

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const handleMouseEnter = (index) => {
    openDropdown(index)
  }

  const handleMouseLeave = () => {
    scheduleClose()
  }

  const keepDropdownOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  if (!isClient) {
    return <div className="h-20 bg-white"></div> // Placeholder during SSR
  }

  return (
    <>
      {/* Top Banner - matches reference image, now responsive for mobile */}
      <div className="w-full border-b-4 border-blue-600" style={{
        background: 'linear-gradient(90deg, #e3f0fa 0%, #cbe2f6 100%)',
        minHeight: '80px',
        padding: 0
      }}>
        <div className="max-w-full mx-auto px-0">
          <div className="flex items-center justify-between w-full">
            {/* Left Logo */}
            <div className="flex-shrink-0 flex items-center h-full pl-1 sm:pl-2 md:pl-6">
              <img
                src="/cof_logo.png"
                alt="COF Logo Left"
                className="h-12 xs:h-16 sm:h-20 md:h-28 lg:h-36 xl:h-40 w-auto object-contain"
                style={{ minWidth: '48px' }}
              />
            </div>
            {/* Centered Text */}
            <div className="flex flex-col items-center flex-1 px-1 sm:px-2 md:px-6 py-1 sm:py-2 md:py-6">
              <span className="text-[#2580c2] text-xs xs:text-lg sm:text-lg md:text-xl lg:text-3xl xl:text-4xl font-bold tracking-wide leading-tight text-center whitespace-nowrap" style={{fontFamily: 'serif'}}>COLLEGE OF FISHERY SCIENCE, JABALPUR</span>
              <span className="text-[#2580c2] text-xs xs:text-base sm:text-lg md:text-2xl lg:text-4xl font-bold leading-tight text-center" style={{fontFamily: 'serif'}}>मत्स्य विज्ञान महाविद्यालय, जबलपुर</span>
              <span className="text-[#1a3570] text-[10px] xs:text-xs sm:text-base md:text-lg lg:text-2xl font-bold mt-1 sm:mt-2 text-center" style={{fontFamily: 'serif', letterSpacing: '0.5px'}}>NANAJI DESHMUKH VETERINARY SCIENCE UNIVERSITY, JABALPUR</span>
            </div>
            {/* Right Logo */}
            <div className="flex-shrink-0 flex items-center h-full pr-1 sm:pr-2 md:pr-6">
              <img
                src="/university.png"
                alt="COF Logo Right"
                className="h-12 xs:h-16 sm:h-20 md:h-28 lg:h-36 xl:h-40 w-auto object-contain"
                style={{ minWidth: '48px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu - sticks to top */}
            <nav className="bg-blue-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-900 hover:bg-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1 h-full">
              {navigation.map((item, index) => (
              <div
                key={item.name}
                className="relative group h-full flex items-center"
                onMouseEnter={() => item.dropdown ? handleMouseEnter(index) : null}
                onMouseLeave={() => item.dropdown ? handleMouseLeave() : null}
              >
                {item.dropdown ? (
                  <div className="relative h-full flex items-center">
                    <button
                      className={`h-full px-4 text-sm font-medium transition-all duration-200 flex items-center ${
                        isActive(item.href)
                          ? 'text-blue-900 bg-white bg-opacity-90'
                          : 'text-white hover:text-gray-900 hover:bg-white hover:bg-opacity-40'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === index}
                      onFocus={() => openDropdown(index)}
                      onClick={() => {
                        // Navigate to the main page and close dropdown
                        handleNavClick(item)
                        setActiveDropdown(null)
                      }}
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div
                      className={`absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 transform transition-all duration-200 z-50 ${
                        activeDropdown === index
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                      }`}
                      onMouseEnter={keepDropdownOpen}
                      onMouseLeave={scheduleClose}
                      style={{ minWidth: '250px' }}
                    >
                      <div className="py-2">
                        {item.dropdown && item.dropdown.map((dropdownItem, dropIndex) => (
                          <button
                            key={dropdownItem.name}
                            onClick={() => handleNavClick(dropdownItem)}
                            className={`block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 font-medium border-l-4 border-transparent hover:border-blue-400 ${
                              dropIndex === 0 ? 'rounded-t-lg' : ''
                            } ${dropIndex === item.dropdown.length - 1 ? 'rounded-b-lg' : ''}`}
                          >
                            {dropdownItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`h-full px-4 text-sm font-medium transition-all duration-200 flex items-center ${
                      isActive(item.href)
                        ? 'text-blue-900 bg-white bg-opacity-90'
                        : 'text-white hover:text-gray-900 hover:bg-white hover:bg-opacity-40'
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white border-opacity-20">
            {navigation.map((item, index) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => {
                        // Navigate to main page if clicked without toggling dropdown
                        handleNavClick(item)
                        setActiveDropdown(null)
                      }}
                      onDoubleClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-base font-medium rounded-md transition-all duration-200 group ${
                        activeDropdown === index 
                          ? 'bg-white bg-opacity-95 text-blue-900' 
                          : 'text-white hover:text-blue-900 hover:bg-white hover:bg-opacity-90'
                      }`}
                    >
                      <span onClick={(e) => {
                        e.stopPropagation()
                        handleNavClick(item)
                      }}>{item.name}</span>
                      <ChevronDown
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdown(activeDropdown === index ? null : index)
                        }}
                        className={`h-5 w-5 transition-transform duration-200 font-bold ${
                          activeDropdown === index ? 'rotate-180 text-blue-900' : 'text-white group-hover:text-blue-900'
                        }`}
                      />
                    </button>
                    
                    {activeDropdown === index && (
                      <div className="mt-2 ml-4 space-y-1 bg-white bg-opacity-95 rounded-lg p-3 border-l-4 border-blue-300">
                        {item.dropdown && item.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.name}
                            onClick={() => handleNavClick(dropdownItem)}
                            className="block w-full text-left px-3 py-2 text-sm text-blue-900 hover:text-white hover:bg-blue-800 rounded-md transition-all duration-200 font-medium"
                          >
                            {dropdownItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-900 bg-white bg-opacity-90'
                        : 'text-white hover:text-blue-900 hover:bg-white hover:bg-opacity-90'
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar






