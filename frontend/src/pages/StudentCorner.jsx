import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Award, Users, Star, Briefcase, FileText, Calendar, Mail, Phone, MapPin, ChevronRight, Download, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card'
import { getDocumentUrl, downloadFile } from '../services/files'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { studentCornerAPI } from '../services/api'

const StudentCorner = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [admissionGuidelines, setAdmissionGuidelines] = useState([])
  const [scholarshipsFellowships, setScholarshipsFellowships] = useState([])
  const [studentCouncilClubs, setStudentCouncilClubs] = useState([])

  useEffect(() => {
    fetchStudentCornerData()
  }, [])

  const fetchStudentCornerData = async () => {
    try {
      setLoading(true)
      const response = await studentCornerAPI.getAll()
      
      if (response.data.success) {
        const data = response.data.data
        setAdmissionGuidelines(data.admissionGuidelines || [])
        setScholarshipsFellowships(data.scholarships || [])
        setStudentCouncilClubs(data.clubs || [])
      }
    } catch (error) {
      console.error('Error fetching student corner data:', error)
      setError('Failed to load student corner data')
    } finally {
      setLoading(false)
    }
  }

  const EmptySection = ({ title, description, icon: Icon }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No {title} Available</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {description} Please check back later for updates.
      </p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchStudentCornerData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen text-left">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-green-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/4 w-44 h-44 bg-blue-300 rounded-full blur-4xl"></div>
        </div>
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Student/academic themed shapes */}
          <div className="absolute top-20 right-20 w-10 h-8 bg-white/10 rounded-full animate-float transform rotate-12" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-24 left-24 w-8 h-10 bg-cyan-300/15 rounded animate-float transform -rotate-12" style={{animationDelay: '2s'}}></div>
          
          {/* Student activity bubbles */}
          <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Students Corner</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your comprehensive guide to admissions, scholarships, student life, alumni experiences, 
              and career opportunities at College of Fishery Science, Jabalpur.
            </p>
          </div>
        </div>
      </section>


      {/* Admission Guidelines */}
      <section id="admission-guidelines" className="section-padding bg-gradient-to-br from-gray-50 via-blue-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 right-16 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-28 h-28 bg-indigo-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-purple-400 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating admission elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-8 h-6 bg-blue-200/15 rounded-full animate-float transform rotate-6" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 right-24 w-6 h-8 bg-indigo-200/20 rounded animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-10 h-4 bg-purple-200/15 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Guidelines</h2>
            <div className="w-20 h-1 bg-blue-400 rounded mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete information about admission process, eligibility criteria, required documents, 
              and important dates for B.F.Sc and M.F.Sc programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {admissionGuidelines.length > 0 ? (
              admissionGuidelines.map((guideline, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden group">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-blue-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full opacity-40 animate-pulse ${
                    index % 2 === 0 ? 'bg-blue-400' : 'bg-indigo-400'
                  }`} style={{animationDelay: `${index * 0.5}s`}}></div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    {guideline.category && guideline.category.includes('Eligibility') ? 
                      <GraduationCap className="w-6 h-6 text-blue-500" /> :
                      guideline.category && guideline.category.includes('Process') ?
                      <FileText className="w-6 h-6 text-blue-500" /> :
                      guideline.category && guideline.category.includes('Documents') ?
                      <FileText className="w-6 h-6 text-blue-500" /> :
                      <Calendar className="w-6 h-6 text-blue-500" />
                    }
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{guideline.category}</h3>
                  <p className="text-gray-700 mb-4">{guideline.description}</p>
                  
                  <div>
                    <ul className="space-y-2">
                      {guideline.guidelines && guideline.guidelines.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Multiple PDF Downloads */}
                  {guideline.documents && guideline.documents.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Available Documents:</p>
                      <div className="space-y-2">
                        {guideline.documents.map((doc, docIndex) => (
                          <button
                            key={docIndex}
                            onClick={() => downloadFile(getDocumentUrl(doc.filename), doc.originalName)}
                            type="button"
                            className="inline-flex items-center w-full px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100 transition-colors group border-none cursor-pointer"
                          >
                            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">{doc.originalName}</span>
                            <span className="text-xs text-blue-500 mr-2">
                              ({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)
                            </span>
                            <Download className="w-4 h-4 flex-shrink-0 group-hover:animate-bounce" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : guideline.filename ? (
                    // Legacy single PDF support
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => downloadFile(getDocumentUrl(guideline.filename), guideline.category || 'Document')}
                        type="button"
                        className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors border-none cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </button>
                    </div>
                  ) : null}
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptySection 
                  title="Admission Guidelines" 
                  description="Admission guidelines and requirements will be published here." 
                  icon={GraduationCap} 
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scholarships & Fellowships */}
      <section id="scholarships" className="section-padding bg-gradient-to-br from-white via-yellow-50 to-orange-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-16 w-28 h-28 bg-yellow-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-amber-400 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating scholarship elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 right-20 w-8 h-6 bg-yellow-200/15 rounded-full animate-float transform rotate-12" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 left-24 w-6 h-6 bg-orange-200/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-7 h-4 bg-amber-200/15 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Scholarships & Fellowships</h2>
            <div className="w-20 h-1 bg-blue-400 rounded mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Financial assistance programs to support deserving students through scholarships, 
              fellowships, and incentive schemes for academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scholarshipsFellowships.length > 0 ? (
              scholarshipsFellowships.map((scholarship, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-yellow-50 relative overflow-hidden group">
                  {/* Decorative corner */}
                  <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-yellow-200 to-transparent opacity-25 group-hover:opacity-35 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-orange-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full opacity-40 animate-bounce ${
                    index % 2 === 0 ? 'bg-yellow-400' : 'bg-orange-400'
                  }`} style={{animationDelay: `${index * 0.7}s`}}></div>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{scholarship.name}</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                        {scholarship.amount && (
                          <div>
                            <span className="font-medium">Amount:</span> {scholarship.amount}
                          </div>
                        )}
                        {scholarship.duration && (
                          <div>
                            <span className="font-medium">Duration:</span> {scholarship.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {scholarship.description && (
                    <p className="text-gray-700 mb-4">{scholarship.description}</p>
                  )}
                  
                  {scholarship.eligibility && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Eligibility</h4>
                      <p className="text-sm text-gray-700">{scholarship.eligibility}</p>
                    </div>
                  )}
                  
                  {scholarship.benefits && scholarship.benefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {scholarship.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-700">
                            <ChevronRight className="w-4 h-4 text-yellow-600 mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Multiple PDF Downloads */}
                  {scholarship.documents && scholarship.documents.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Available Documents:</p>
                      <div className="space-y-2">
                        {scholarship.documents.map((doc, docIndex) => (
                          <button
                            key={docIndex}
                            onClick={() => downloadFile(getDocumentUrl(doc.filename), doc.originalName)}
                            type="button"
                            className="inline-flex items-center w-full px-3 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-md hover:bg-yellow-100 transition-colors group border-none cursor-pointer"
                          >
                            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">{doc.originalName}</span>
                            <span className="text-xs text-yellow-500 mr-2">
                              ({(doc.fileSize / 1024 / 1024).toFixed(1)} MB)
                            </span>
                            <Download className="w-4 h-4 flex-shrink-0 group-hover:animate-bounce" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : scholarship.filename ? (
                    // Legacy single PDF support
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => downloadFile(getDocumentUrl(scholarship.filename), scholarship.name || 'Document')}
                        type="button"
                        className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-md hover:bg-yellow-200 transition-colors border-none cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </button>
                    </div>
                  ) : null}
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptySection 
                  title="Scholarships" 
                  description="Scholarship and fellowship information will be available here." 
                  icon={Award} 
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Student Council / Clubs */}
      <section id="student-council" className="section-padding bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 right-16 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-28 h-28 bg-blue-400 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-teal-400 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating club elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-8 h-6 bg-green-200/15 rounded-full animate-float transform rotate-6" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 right-24 w-6 h-8 bg-blue-200/20 rounded animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-7 h-4 bg-teal-200/15 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="container-max relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Council / Clubs</h2>
            <div className="w-20 h-1 bg-blue-400 rounded mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Active student organizations fostering leadership, technical skills, cultural activities, 
              and overall personality development through various clubs and societies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentCouncilClubs.length > 0 ? (
              studentCouncilClubs.map((club, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 relative overflow-hidden group">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-green-200 to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-blue-200 to-transparent opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
                  <div className={`absolute top-2 left-2 w-2 h-2 rounded-full opacity-40 animate-pulse ${
                    index % 3 === 0 ? 'bg-green-400' : index % 3 === 1 ? 'bg-blue-400' : 'bg-teal-400'
                  }`} style={{animationDelay: `${index * 0.6}s`}}></div>
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-secondary-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{club.name}</h3>
                  {club.role && (
                    <p className="text-sm text-secondary-600 mb-3 font-medium">{club.role}</p>
                  )}
                  {club.description && (
                    <p className="text-gray-700 mb-4">{club.description}</p>
                  )}
                  
                  {club.activities && club.activities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Activities</h4>
                      <ul className="space-y-2">
                        {club.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <div className="w-2 h-2 bg-secondary-500 rounded-full mr-3 mt-2"></div>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {club.positions && club.positions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Positions</h4>
                      <div className="flex flex-wrap gap-2">
                        {club.positions.map((position, idx) => (
                          <span key={idx} className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded">
                            {position}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {club.filename && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => downloadFile(getDocumentUrl(club.filename), club.name || 'Document')}
                        type="button"
                        className="inline-flex items-center px-3 py-2 bg-secondary-100 text-secondary-700 text-sm rounded-md hover:bg-secondary-200 transition-colors border-none cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </button>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptySection 
                  title="Student Clubs" 
                  description="Student council and club information will be displayed here." 
                  icon={Users} 
                />
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-28 h-28 bg-cyan-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-300 rounded-full blur-4xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-8 h-8 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-16 left-16 w-6 h-6 bg-cyan-300/15 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-max text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Student Community?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore admission opportunities, connect with current students, and start your journey 
            towards a successful career in fishery science and aquaculture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="btn-accent"
            >
              Contact Admission Office
            </Link>
            
            <Link
              to="/academics"
              className="btn-outline border-white text-white hover:bg-white hover:text-blue-500"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StudentCorner







