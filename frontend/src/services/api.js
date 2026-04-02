import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_HOST || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
})

// Create a separate axios instance for file uploads without Content-Type header
const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_SERVER_HOST || '/api',
  timeout: 30000, // Longer timeout for file uploads
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Add timestamp to prevent caching
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    }
  }
  return config
})

// Request interceptor for upload API to add auth token
uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/admin/login')) {
      localStorage.removeItem('token')
      // Check if we're in admin area before redirecting
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const programsAPI = {
  getAll: (params) => api.get('/programs', { params }),
  getById: (id) => api.get(`/programs/${id}`),
  getBySlug: (slug) => api.get(`/programs/slug/${slug}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
}

export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  getMetadata: () => api.get('/faculty/metadata'),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
}

export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => {
    console.log('newsAPI.create called with:', data)
    return api.post('/news', data)
  },
  update: (id, data) => {
    console.log('newsAPI.update called with:', { id, data })
    return api.put(`/news/${id}`, data)
  },
  delete: (id) => api.delete(`/news/${id}`),
  uploadImage: (file) => {
    console.log('newsAPI.uploadImage called with file:', file.name, file.size, 'bytes')
    const formData = new FormData()
    formData.append('file', file)
    return uploadApi.post('/news/upload', formData, {
      headers: {
        'X-Upload-Category': 'news',
      },
    })
  },
  uploadAttachment: (file) => {
    console.log('newsAPI.uploadAttachment called with file:', file.name, file.size, 'bytes')
    const formData = new FormData()
    formData.append('file', file)
    return uploadApi.post('/news/upload-attachment', formData)
  },
}

export const researchAPI = {
  getAll: (params) => api.get('/research', { params }),
  getById: (id) => api.get(`/research/${id}`),
  create: (data) => {
    // If data is FormData (for file uploads), use uploadApi
    if (data instanceof FormData) {
      return uploadApi.post('/research', data);
    }
    // Otherwise use regular api
    return api.post('/research', data);
  },
  update: (id, data) => {
    // If data is FormData (for file uploads), use uploadApi
    if (data instanceof FormData) {
      return uploadApi.put(`/research/${id}`, data);
    }
    // Otherwise use regular api
    return api.put(`/research/${id}`, data);
  },
  delete: (id) => api.delete(`/research/${id}`),
}

export const infrastructureAPI = {
  getAll: (params) => api.get('/infrastructure', { params }),
  getById: (id) => api.get(`/infrastructure/${id}`),
  create: (data) => api.post('/infrastructure', data),
  update: (id, data) => api.put(`/infrastructure/${id}`, data),
  delete: (id) => api.delete(`/infrastructure/${id}`),
}

export const collaborationsAPI = {
  getAll: (params) => api.get('/collaborations', { params }),
  getById: (id) => api.get(`/collaborations/${id}`),
  create: (data) => api.post('/collaborations', data),
  update: (id, data) => api.put(`/collaborations/${id}`, data),
  delete: (id) => api.delete(`/collaborations/${id}`),
}

export const alumniAPI = {
  getAll: (params) => api.get('/alumni', { params }),
  getById: (id) => api.get(`/alumni/${id}`),
  create: (data) => api.post('/alumni', data),
  update: (id, data) => api.put(`/alumni/${id}`, data),
  delete: (id) => api.delete(`/alumni/${id}`),
  registerForEvent: (data) => api.post('/alumni/register-event', data),
}

export const contentAPI = {
  getBySection: (section, params) => api.get(`/content/${section}`, { params }),
  getByKey: (key) => api.get(`/content/key/${key}`),
  getAll: (params) => api.get('/content/admin/all', { params }),
  create: (data) => api.post('/content', data),
  createOrUpdate: (data) => api.post('/content', data), // Backend handles create or update based on key
  updateByKey: (key, data) => api.post('/content', { key, ...data }), // Create or update by key
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
}

export const uploadAPI = {
  single: (file, category = 'images') => {
    console.log('uploadAPI.single called with:', { file, category })
    console.log('File object details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      constructor: file?.constructor?.name,
      lastModified: file?.lastModified
    })
    
    if (!file) {
      console.error('No file provided to uploadAPI.single')
      return Promise.reject(new Error('No file provided'))
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    
    console.log('FormData created, entries:', Array.from(formData.entries()))
    console.log('FormData file entry:', formData.get('file'))
    console.log('FormData category entry:', formData.get('category'))
    
    return uploadApi.post('/upload/single', formData, {
      headers: {
        'X-Upload-Category': category,
      },
    })
  },
  multiple: (files, category = 'images') => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('category', category)
    return uploadApi.post('/upload/multiple', formData, {
      headers: {
        'X-Upload-Category': category,
      },
    })
  },
  delete: (filename) => api.delete(`/upload/${filename}`),
  getImageUrl: (filename, type = 'images') => {
    if (!filename) return ''

    // Handle external URLs
    if (filename.startsWith('http')) {
      // If it's a Cloudinary URL, return it directly
      if (filename.includes('cloudinary.com')) {
        // Ensure https
        return filename.replace('http://res.cloudinary.com', 'https://res.cloudinary.com')
      }
      
      // For other remote URLs (like the old ndvsu.org), proxy through backend
      const serverHost = import.meta.env.VITE_SERVER_HOST || '/api'
      const baseURL = serverHost.startsWith('http') ? serverHost : `${window.location.origin}${serverHost.startsWith('/') ? '' : '/'}${serverHost}`
      return `${baseURL}/proxy/image?url=${encodeURIComponent(filename)}`
    }

    // Detect Cloudinary-style paths that might have arrived without the protocol
    if (filename.includes('fishery_college/')) {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dffu99v88'
      return `https://res.cloudinary.com/${cloudName}/image/upload/${filename}`
    }

    // Get the base URL from environment variable
    // Default to /api for relative URLs in production to avoid mixed content errors
    const serverHost = import.meta.env.VITE_SERVER_HOST || '/api'
    
    // If we're on a production domain but the bundle has 'localhost:5000' hardcoded (build-time artifact),
    // use a relative path instead to prevent "Connection Refused".
    const isProdDomain = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    const isHardcodedLocalhost = serverHost.includes('localhost') || serverHost.includes('127.0.0.1')
    
    let baseURL = ''
    if (isProdDomain && isHardcodedLocalhost) {
      baseURL = '' // Use current domain's relative path
    } else {
      baseURL = serverHost.replace('/api', '').replace(/\/+$/, '')
      // Make sure it doesn't accidentally become just 'http:' or 'https:'
      if (baseURL === 'http:' || baseURL === 'https:') baseURL = ''
    }
    
    // Handle files that already have the full path
    if (filename.startsWith('/uploads/')) {
      return `${baseURL}${filename}`
    }
    
    // Handle relative filenames
    return `${baseURL}/uploads/${type}/${filename}`
  },
}

export const slideshowAPI = {
  getAll: () => api.get('/slideshow'),
  getAllAdmin: () => api.get('/slideshow/admin'),
  getById: (id) => api.get(`/slideshow/${id}`),
  create: (formData) => uploadApi.post('/slideshow', formData, {
    headers: {
      'X-Upload-Category': 'slideshow',
    },
  }),
  update: (id, formData) => uploadApi.put(`/slideshow/${id}`, formData, {
    headers: {
      'X-Upload-Category': 'slideshow',
    },
  }),
  delete: (id) => api.delete(`/slideshow/${id}`),
  reorder: (slides) => api.post('/slideshow/reorder', { slides }),
}

// Settings API removed - now using hardcoded values
// User Management API for password changes
export const userManagementAPI = {
  changePassword: (data) => api.put('/settings/change-password', data),
}

export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  getAllAdmin: (params) => api.get('/gallery/admin/all', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (formData) => uploadApi.post('/gallery', formData, {
    headers: {
      'X-Upload-Category': 'gallery',
    },
  }),
  update: (id, formData) => uploadApi.put(`/gallery/${id}`, formData, {
    headers: {
      'X-Upload-Category': 'gallery',
    },
  }),
  delete: (id) => api.delete(`/gallery/${id}`),
  bulkDelete: (ids) => api.delete('/gallery/bulk/delete', { data: { ids } }),
  toggleStatus: (id) => api.patch(`/gallery/${id}/toggle-status`),
}

export const placementAPI = {
  submit: (formData) => uploadApi.post('/placement/submit', formData, {
    headers: {
      'X-Upload-Category': 'placement',
    },
  }),
}

export const incubationAPI = {
  // Public endpoints
  get: () => api.get('/incubation'),
  register: (formData) => uploadApi.post('/incubation/register', formData, {
    headers: {
      'X-Upload-Category': 'incubation',
    },
  }),
  
  // Admin endpoints
  getAll: (params) => api.get('/incubation/admin', { params }),
  getById: (id) => api.get(`/incubation/${id}`),
  create: (data) => api.post('/incubation', data),
  update: (id, data) => api.put(`/incubation/${id}`, data),
  delete: (id) => api.delete(`/incubation/${id}`),
}

export const farmersAPI = {
  // Public endpoints
  getResources: (params = {}) => api.get('/farmers/resources', { params }),
  getResource: (id) => api.get(`/farmers/resources/${id}`),
  downloadResource: (id) => {
    // Create a direct download link
    const baseURL = import.meta.env.VITE_SERVER_HOST || '/api'
    const serverHost = baseURL.replace('/api', '')
    return `${serverHost}/api/farmers/resources/${id}/download`
  },
  
  // Admin endpoints
  createResource: (formData) => uploadApi.post('/farmers/resources', formData),
  updateResource: (id, data) => api.put(`/farmers/resources/${id}`, data),
  updateResourceWithFile: (id, formData) => uploadApi.put(`/farmers/resources/${id}/file`, formData),
  deleteResource: (id) => api.delete(`/farmers/resources/${id}`),
  getAdminResources: (params = {}) => api.get('/farmers/admin/resources', { params }),
  
  // Email endpoints (existing)
  sendAdvisoryQuery: (data) => api.post('/farmers/advisory', data),
  sendTrainingQuery: (data) => api.post('/farmers/training', data),
}

export const partnersAPI = {
  getAll: () => api.get('/partners'),
  getAllAdmin: (params) => api.get('/partners/admin', { params }),
  getById: (id) => api.get(`/partners/${id}`),
  create: (formData) => uploadApi.post('/partners', formData, {
    headers: {
      'X-Upload-Category': 'partners',
    },
  }),
  update: (id, formData) => uploadApi.put(`/partners/${id}`, formData, {
    headers: {
      'X-Upload-Category': 'partners',
    },
  }),
  delete: (id) => api.delete(`/partners/${id}`),
  bulkDelete: (ids) => api.delete('/partners/bulk/delete', { data: { ids } }),
  reorder: (partners) => api.post('/partners/reorder', { partners }),
}

export const academicsAPI = {
  // Get academics page content (public)
  getPage: () => api.get('/academics/page'),
  
  // Update academics page content (admin only)
  updatePage: (data) => api.put('/academics/page', data),
  
  // Reset academics page to default (admin only)
  resetPage: () => api.delete('/academics/page/reset'),
}

export const extensionAPI = {
  getAll: (params) => api.get('/extension', { params }),
  getPublic: (params) => api.get('/extension', { params }), // Public endpoint alias
  getAdmin: (params) => api.get('/extension/admin', { params }),
  getById: (id) => api.get(`/extension/${id}`),
  create: (data) => {
    // If data is FormData (for file uploads), use uploadApi
    if (data instanceof FormData) {
      return uploadApi.post('/extension', data);
    }
    // Otherwise use regular api
    return api.post('/extension', data);
  },
  update: (id, data) => {
    // If data is FormData (for file uploads), use uploadApi
    if (data instanceof FormData) {
      return uploadApi.put(`/extension/${id}`, data);
    }
    // Otherwise use regular api
    return api.put(`/extension/${id}`, data);
  },
  delete: (id) => api.delete(`/extension/${id}`),
}

export const studentCornerAPI = {
  getAll: (params) => api.get('/student-corner', { params }),
  getById: (id) => api.get(`/student-corner/${id}`),
  create: (data) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return uploadApi.post('/student-corner', data)
    }
    return api.post('/student-corner', data)
  },
  update: (id, data) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return uploadApi.put(`/student-corner/${id}`, data)
    }
    return api.put(`/student-corner/${id}`, data)
  },
  delete: (id) => api.delete(`/student-corner/${id}`),
}

export const applicationAPI = {
  submit: (formData) => uploadApi.post('/application/submit', formData, {
    headers: {
      'X-Upload-Category': 'resumes',
    },
  }),
}

export const jobApplicationAPI = {
  submit: (formData) => uploadApi.post('/job-application/submit', formData, {
    headers: {
      'X-Upload-Category': 'resumes',
    },
  }),
}

export const contactAPI = {
  get: () => api.get('/contact'),
  getPublic: () => api.get('/contact/public'),
  update: (data) => api.put('/contact', data),
  addDepartment: (data) => api.post('/contact/department', data),
  updateDepartment: (id, data) => api.put(`/contact/department/${id}`, data),
  deleteDepartment: (id) => api.delete(`/contact/department/${id}`),
  addEmergencyContact: (data) => api.post('/contact/emergency', data),
  updateEmergencyContact: (id, data) => api.put(`/contact/emergency/${id}`, data),
  deleteEmergencyContact: (id) => api.delete(`/contact/emergency/${id}`),
}

export default api

