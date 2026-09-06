import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Newspaper, 
  Calendar,
  Building,
  Briefcase,
  FileText,
  Eye,
  EyeOff,
  LogOut,
  Menu,
  X,
  User,
  Image,
  Tractor,
  Globe,
  Info,
  Home,
  GraduationCap,
  Target,
  Network,
  UserCheck,
  Phone,
  Settings,
  History
} from 'lucide-react'
import toast from 'react-hot-toast'
import { programsAPI, facultyAPI, newsAPI, userManagementAPI } from '../../services/api'

import ProgramsManagement from './ProgramsManagement'
import FacultyManagement from './FacultyManagement'
import WelcomeMessageManagement from './WelcomeMessageManagement'
import GalleryManagement from './GalleryManagement'
import SlideshowManagement from './SlideshowManagement'
import ResearchManagement from './ResearchManagement'
import FarmersResourceManagement from './FarmersResourceManagement'
import PartnersManagement from './PartnersManagement'
import AboutPageManagement from './AboutPageManagement'
import StudentCornerManagement from './StudentCornerManagement'
import CollaborationsManagement from './CollaborationsManagement'
import AlumniManagement from './AlumniManagement'

import HomePageManagement from './HomePageManagement'
import AcademicManagement from './AcademicManagement'
import ContentManagement from './ContentManagement'
import ExtensionManagement from './ExtensionManagement'
import InfrastructureStatic from './InfrastructureStatic'
import IncubationManagement from './IncubationManagement'
import ContactManagement from './ContactManagement'
import VersionControlManagement from './VersionControlManagement'

// Admin Page Components
const DashboardHome = () => {
  const [stats, setStats] = useState({
    programs: 0,
    faculty: 0,
    news: 0,
    events: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const [programsRes, facultyRes, newsRes] = await Promise.allSettled([
        programsAPI.getAll(),
        facultyAPI.getAll(),
        newsAPI.getAll()
      ])

      const newStats = { ...stats }
      
      if (programsRes.status === 'fulfilled' && programsRes.value.data.success) {
        newStats.programs = programsRes.value.data.data.programs?.length || 0
      }
      
      if (facultyRes.status === 'fulfilled' && facultyRes.value.data.success) {
        newStats.faculty = facultyRes.value.data.data.faculty?.length || 0
      }
      
      if (newsRes.status === 'fulfilled' && newsRes.value.data.success) {
        const allItems = newsRes.value.data.data.newsEvents || []
        newStats.news = allItems.filter(item => item.type === 'news').length || 0
        newStats.events = allItems.filter(item => 
          ['event', 'seminar', 'workshop'].includes(item.type)
        ).length || 0
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your college.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.programs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faculty Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.faculty}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Newspaper className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">News Articles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.news}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for remaining sections
// Placeholder for future InfrastructureManagement component (currently unused)
const UserManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }

    setSaving(true)
    try {
      const response = await userManagementAPI.changePassword({
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        alert('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage your admin account and security settings.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Change Admin Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{saving ? 'Changing Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const { admin, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Home Page', href: '/admin/homepage', icon: Home },
    { name: 'About Page', href: '/admin/about', icon: Info },
    { name: 'Academic', href: '/admin/academic', icon: GraduationCap },
    { name: 'Student Corner', href: '/admin/student-corner', icon: Users },
    { name: 'Extension', href: '/admin/extension', icon: Target },
    { name: 'Infrastructure', href: '/admin/infrastructure', icon: Building },
    { name: 'Incubation', href: '/admin/incubation', icon: Briefcase },
    { name: 'Collaborations', href: '/admin/collaborations', icon: Network },
    { name: 'Alumni', href: '/admin/alumni', icon: UserCheck },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Farmer Corner', href: '/admin/resources', icon: Tractor },
    { name: 'Contact', href: '/admin/contact', icon: Phone },
    { name: 'Version History & Backup', href: '/admin/versions', icon: History },
    { name: 'User Management', href: '/admin/settings', icon: Settings }
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Mobile Sidebar Content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FC</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">Fishery College</h1>
                  <p className="text-sm text-gray-500">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-8 px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`${
                      active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Mobile User Profile */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{admin?.username || 'Admin'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center mt-1 transition-colors"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-lg border-r border-gray-200">
            {/* Logo/Header */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">FC</span>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-semibold text-gray-900">Fishery College</h1>
                    <p className="text-sm text-gray-500">Admin Panel</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="mt-8 flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, item.exact)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        active
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
                    >
                      <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            {/* User Profile */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{admin?.username || 'Admin'}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-600 flex items-center mt-1 transition-colors"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/homepage" element={<HomePageManagement />} />
                <Route path="/about" element={<AboutPageManagement />} />
                <Route path="/academic" element={<AcademicManagement />} />
                <Route path="/student-corner" element={<StudentCornerManagement />} />
                <Route path="/extension" element={<ExtensionManagement />} />
                <Route path="/infrastructure" element={<InfrastructureStatic />} />
                <Route path="/incubation" element={<IncubationManagement />} />
                <Route path="/collaborations" element={<CollaborationsManagement />} />
                <Route path="/alumni" element={<AlumniManagement />} />
                <Route path="/content" element={<ContentManagement />} />
                <Route path="/resources" element={<FarmersResourceManagement />} />
                <Route path="/contact" element={<ContactManagement />} />
                <Route path="/versions" element={<VersionControlManagement />} />
                <Route path="/settings" element={<UserManagement />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard





