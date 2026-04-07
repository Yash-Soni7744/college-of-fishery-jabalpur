import React, { Suspense, lazy } from 'react'

// Lazy load the embed components
const LinkedInEmbed = lazy(() => 
  import('react-social-media-embed').then(module => ({ default: module.LinkedInEmbed }))
)

const XEmbed = lazy(() => 
  import('react-social-media-embed').then(module => ({ default: module.XEmbed }))
)

const FacebookEmbed = lazy(() =>
  import('react-social-media-embed').then(module => ({ default: module.FacebookEmbed }))
)

const InstagramEmbed = lazy(() =>
  import('react-social-media-embed').then(module => ({ default: module.InstagramEmbed }))
)

const YouTubeEmbed = lazy(() =>
  import('react-social-media-embed').then(module => ({ default: module.YouTubeEmbed }))
)

// Loading fallback
const EmbedLoader = () => (
  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
      <p className="text-gray-600">Loading post...</p>
    </div>
  </div>
)

// Error fallback
const EmbedError = ({ url, platform }) => (
  <div className="w-full p-6 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-center">
      <p className="text-gray-600 mb-3">Unable to load {platform} post</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        View on {platform}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
)

// Error boundary class component
class EmbedErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Embed error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <EmbedError url={this.props.url} platform={this.props.platform} />
    }

    return this.props.children
  }
}

// Main component
const SocialEmbed = ({ platform, url, width = '100%', height }) => {
  return (
    <EmbedErrorBoundary url={url} platform={platform}>
      <Suspense fallback={<EmbedLoader />}>
        {platform === 'linkedin' ? (
          <LinkedInEmbed
            url={url}
            width={width}
            height={height || 400}
          />
        ) : platform === 'twitter' ? (
          <XEmbed
            url={url}
            width={width}
          />
        ) : platform === 'facebook' ? (
          <FacebookEmbed
            url={url}
            width={width}
            height={height || 400}
          />
        ) : platform === 'instagram' ? (
          <InstagramEmbed
            url={url}
            width={width}
          />
        ) : platform === 'youtube' ? (
          <YouTubeEmbed
            url={url}
            width={width}
            height={height || 315}
          />
        ) : (
          <EmbedError url={url} platform={platform} />
        )}
      </Suspense>
    </EmbedErrorBoundary>
  )
}

export default SocialEmbed
