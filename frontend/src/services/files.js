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
  
  const urlStr = String(filename);
  
  // If it's already a full URL (Cloudinary)
  if (urlStr.startsWith('http')) {
    return urlStr;
  }
  
  const clean = urlStr.replace(/^\/+/, '')
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

/**
 * Downloads a file with the specified filename, ensuring correct PDF extension if needed
 * @param {string} url - The URL of the file to download
 * @param {string} originalName - The desired filename
 */
export const downloadFile = async (url, originalName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network fetch failed');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    
    let filename = originalName || 'document.pdf';
    // Ensure PDF extension if the original name doesn't have it
    if (!filename.toLowerCase().endsWith('.pdf') && url.toLowerCase().includes('.pdf')) {
      filename += '.pdf';
    } else if (!filename.toLowerCase().endsWith('.pdf') && !filename.includes('.')) {
      // If no extension at all, default to .pdf if it's likely a PDF
      filename += '.pdf';
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    // Fallback: just open in new tab
    window.open(url, '_blank');
  }
};

export default {
  getBaseHost,
  getUploadsBase,
  getDocumentUrl,
  getImageUrl,
  downloadFile
}
