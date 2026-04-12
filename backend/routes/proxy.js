const express = require('express')
const https = require('https')
const http = require('http')
const { URL } = require('url')

const router = express.Router()

// Simple allow-list for remote assets
const ALLOWED_HOSTS = new Set([
  'www.ndvsu.org',
  'ndvsu.org',
  'res.cloudinary.com',
])

// GET /api/proxy/image?url=https%3A%2F%2Fwww.ndvsu.org%2Fimages%2Ffcj-slide-01.jpg
router.get('/image', (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ success: false, message: 'Missing url parameter' })
    }

    let remote
    try {
      remote = new URL(url)
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid URL' })
    }

    if (!ALLOWED_HOSTS.has(remote.hostname)) {
      return res.status(403).json({ success: false, message: 'Host not allowed' })
    }

    const client = remote.protocol === 'http:' ? http : https
    const request = client.get(remote, (r) => {
      if (r.statusCode && r.statusCode >= 400) {
        res.status(r.statusCode).end()
        r.resume()
        return
      }

      const contentType = r.headers['content-type'] || 'application/octet-stream'
      const { download, filename } = req.query

      // Set permissive CORS/CORP headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      res.setHeader('Content-Type', contentType)
      
      if (download === '1') {
        const downloadName = filename || remote.pathname.split('/').pop() || 'download.pdf'
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
      }

      if (r.headers['cache-control']) {
        res.setHeader('Cache-Control', r.headers['cache-control'])
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400')
      }

      r.pipe(res)
    })

    request.on('error', (err) => {
      console.error('Proxy error:', err)
      res.status(500).json({ success: false, message: 'Proxy fetch failed' })
    })

  } catch (error) {
    console.error('Proxy handler error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router






