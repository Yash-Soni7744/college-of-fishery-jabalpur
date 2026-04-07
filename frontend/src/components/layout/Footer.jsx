import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, ExternalLink, Globe, Instagram } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { contactAPI } from '../../services/api'

const Footer = () => {
  const {
    siteName,
    contactEmail,
    contactPhone,
    address,
    footerText,
    location: locationSettings
  } = useSettings()

  const [contactData, setContactData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await contactAPI.getPublic()
        if (response.data.success) {
          setContactData(response.data.data)
        } else {
          console.error('Failed to load contact information')
        }
      } catch (error) {
        console.error('Error fetching contact data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactData()
  }, [])

  // Helper function to format address from contact data
  const getFormattedAddress = () => {
    if (contactData?.contactInfo?.address) {
      const addr = contactData.contactInfo.address
      // Filter out empty/undefined values and join with commas
      const addressParts = [
        addr.institution,
        addr.university,
        addr.street,
        addr.city,
        addr.state && addr.pincode ? `${addr.state} ${addr.pincode}` : addr.state || addr.pincode,
        addr.country
      ].filter(part => part && part.trim() !== '')

      return addressParts.join(', ')
    }
    return address
  }

  // Helper function to get phone from contact data
  const getPhone = () => {
    if (contactData?.contactInfo?.phone) {
      return contactData.contactInfo.phone.main || contactData.contactInfo.phone.office || contactPhone
    }
    return contactPhone
  }

  // Helper function to get email from contact data
  const getEmail = () => {
    if (contactData?.contactInfo?.email) {
      return contactData.contactInfo.email.main || contactData.contactInfo.email.info || contactEmail
    }
    return contactEmail
  }

  const currentYear = new Date().getFullYear()

  // Generate Google Maps embed URL from contact data or location settings
  const getMapEmbedUrl = () => {
    // Use contact data if available, otherwise fall back to settings
    let latitude, longitude, zoom

    if (contactData?.mapConfig) {
      latitude = contactData.mapConfig.latitude
      longitude = contactData.mapConfig.longitude
      zoom = contactData.mapConfig.zoom
    } else {
      // Fallback to settings
      latitude = locationSettings?.latitude || 23.1815
      longitude = locationSettings?.longitude || 79.9864
      zoom = locationSettings?.zoom || 15
    }

    // Use a simpler Google Maps embed format
    return `https://maps.google.com/maps?width=100%25&height=300&hl=en&q=${latitude},${longitude}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
  }

  // Generate Google Maps URL for "Open in Google Maps" button
  const getMapUrl = () => {
    // Use contact data if available, otherwise fall back to settings
    let latitude, longitude

    if (contactData?.mapConfig) {
      latitude = contactData.mapConfig.latitude
      longitude = contactData.mapConfig.longitude
    } else {
      latitude = locationSettings?.latitude || 23.1815
      longitude = locationSettings?.longitude || 79.9864
    }

    return `https://maps.google.com/?q=${latitude},${longitude}`
  }

  const quickLinks = [
    { name: 'About CoF', href: '/about' },
    { name: 'Academic Programmes', href: '/academics' },
    { name: 'Departments', href: '/academics#departments' },
    { name: 'Faculty', href: '/faculty' },
    { name: 'Research Projects', href: '/research' },
    { name: 'Contact Us', href: '/contact' }
  ]

  const academicLinks = [
    { name: 'Admission Guidelines', href: '/student-corner' },
    { name: 'Scholarships & Fellowships', href: '/student-corner#scholarships' },
    { name: 'Academic Regulations', href: '/academics#regulations' },
    { name: 'Academic Calendar', href: '/academics#calendar' },
    { name: 'Course Curriculum', href: '/academics#curriculum' },
    { name: 'Internship & Placement', href: '/student-corner#placement' }
  ]

  const researchLinks = [
    { name: 'Ongoing/Completed Projects', href: '/research' },
    { name: 'Publications and Journals', href: '/research#publications' },
    { name: 'Student Research', href: '/research#student-research' },
    { name: 'Research Collaborations', href: '/research#collaborations' },
    { name: 'Research Facilities', href: '/research#facilities' },
    { name: 'Extension Activities', href: '/extension' }
  ]

  const relatedLinks = [
    { name: 'ICAR', href: 'https://icar.org.in', external: true },
    { name: 'ICAR-NBFGR', href: 'https://nbfgr.res.in', external: true },
    { name: 'ICAR-CIFRI', href: 'https://cifri.icar.gov.in', external: true },
    { name: 'ICAR-CIFE', href: 'https://cife.edu.in', external: true },
    { name: 'ICAR-CIBA', href: 'https://ciba.icar.gov.in', external: true },
    { name: 'ICAR-CMFRI', href: 'https://cmfri.org.in', external: true },
    { name: 'ICAR-DCFR', href: 'https://dcfr.res.in', external: true }
  ]

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{siteName}</h3>
            <p className="text-gray-300 mb-4">
              Leading institution in fishery education and research
            </p>
            <div className="text-center">
              <div className="text-sm text-gray-300 mb-2">Visitors Count</div>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="bg-gray-700 rounded px-3 py-2 text-center">
                <div className="font-bold text-blue-400 text-xl">2</div>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2 text-center">
                <div className="font-bold text-blue-400 text-xl">1</div>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2 text-center">
                <div className="font-bold text-blue-400 text-xl">5</div>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2 text-center">
                <div className="font-bold text-blue-400 text-xl">9</div>
              </div>
              <div className="bg-gray-700 rounded px-3 py-2 text-center">
                <div className="font-bold text-blue-400 text-xl">0</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-left">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <p className="text-gray-300 text-left">
              {getFormattedAddress()}<br />
              Phone: {getPhone()}<br />
              Email: {getEmail()}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {contactData?.socialMedia?.facebook && (
                <a
                  href={contactData.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contactData?.socialMedia?.twitter && (
                <a
                  href={contactData.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-sky-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              <a
                href={contactData?.socialMedia?.linkedin || "https://www.linkedin.com/company/cofs-jabalpur/"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={contactData?.socialMedia?.instagram || "https://www.instagram.com/cofsc_jabalpur/"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={contactData?.socialMedia?.youtube || "https://www.youtube.com/@COFSJABALPUR"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Google Map Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Find Us
              </h4>
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={getMapEmbedUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${siteName} Location`}
                ></iframe>
              </div>
              <div className="mt-3 text-center">
                <a
                  href={getMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} {siteName}. All rights reserved.</p>
          {footerText && footerText !== `${siteName} - Excellence in Fishery Education & Research` && (
            <p className="mt-2 text-sm">{footerText}</p>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer






