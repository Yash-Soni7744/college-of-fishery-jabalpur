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
    
    let filename = originalName || 'document';
    
    // Sanitize filename: remove characters that might be problematic
    filename = filename.replace(/[\\/:*?"<>|]/g, '_');
    
    const extensionMap = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
    };
    
    // Determine extension
    let extension = '';
    
    // 1. Check extensionMap based on blob.type
    if (extensionMap[blob.type]) {
      extension = extensionMap[blob.type];
    } 
    // 2. Fallback: if it's application/octet-stream or unknown, check URL and context
    else if (blob.type === 'application/octet-stream' || !blob.type) {
      if (url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/documents/')) {
        extension = '.pdf';
      } else if (url.toLowerCase().includes('.doc')) {
        extension = '.doc';
      } else if (url.toLowerCase().includes('.docx')) {
        extension = '.docx';
      }
    }

    // Apply extension if missing
    if (extension && !filename.toLowerCase().endsWith(extension)) {
      // Remove any trailing dots before appending
      const cleanName = filename.replace(/\.+$/, '');
      filename = cleanName + extension;
    }
    
    // If still no extension and it's likely a PDF (fallback based on common sense in this project)
    if (!filename.includes('.') && (url.toLowerCase().includes('/documents/') || url.toLowerCase().includes('/research/'))) {
      filename += '.pdf';
    }
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
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
