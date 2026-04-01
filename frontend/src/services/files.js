// Utilities to build environment-aware URLs for static uploaded files

// Derive the base host from VITE_SERVER_HOST (e.g., https://domain.tld or https://domain.tld/api)
// - Strips a trailing "/api" if present (API base vs static base)
// - Removes a single trailing slash
export const getBaseHost = () => {
  const raw = (import.meta?.env?.VITE_SERVER_HOST || '').toString()
  if (!raw) return ''
  const trimmed = raw.replace(/\/$/, '')
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed
}

// Base for uploads. If no host provided, use relative path for same-origin setups
export const getUploadsBase = () => {
  const host = getBaseHost()
  return host ? `${host.replace(/\/$/, '')}/uploads` : '/uploads'
}

// Document (PDFs) URL builder
export const getDocumentUrl = (filename) => {
  if (!filename) return ''
  // If it's already a full URL (Cloudinary), return it as is
  if (String(filename).startsWith('http')) return filename
  const clean = String(filename).replace(/^\/+/, '')
  return `${getUploadsBase()}/documents/${clean}`
}

// Generic image/file URL builder for sub-directories inside uploads
export const getImageUrl = (subdir, filename) => {
  if (!filename) return ''
  // If it's already a full URL (Cloudinary), return it as is
  if (String(filename).startsWith('http')) return filename
  const clean = String(filename).replace(/^\/+/, '')
  const dir = String(subdir || '').replace(/^\/+|\/+$/g, '')
  return `${getUploadsBase()}/${dir}/${clean}`
}

export default {
  getBaseHost,
  getUploadsBase,
  getDocumentUrl,
  getImageUrl,
}
