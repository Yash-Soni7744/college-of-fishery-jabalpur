import React, { Suspense, lazy } from 'react'
import { Instagram, Linkedin, Facebook, Twitter, Youtube, ExternalLink } from 'lucide-react'

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

// Loading fallback matches container height
const EmbedLoader = () => (
  <div className="w-full h-[400px] bg-gray-50 rounded-2xl flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-gray-400 text-sm">Formatting post...</p>
    </div>
  </div>
)

// Profile Card for non-embeddable links
const ProfileCard = ({ platform, url }) => {
  const platformConfig = {
    instagram: { icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', label: 'Instagram' },
    linkedin: { icon: Linkedin, color: 'bg-[#0077b5]', label: 'LinkedIn' },
    facebook: { icon: Facebook, color: 'bg-[#1877f2]', label: 'Facebook' },
    twitter: { icon: Twitter, color: 'bg-black', label: 'X (Twitter)' },
    youtube: { icon: Youtube, color: 'bg-[#ff0000]', label: 'YouTube' }
  }

  const config = platformConfig[platform] || platformConfig.instagram
  const Icon = config.icon

  return (
    <div className="w-full flex items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl">
      <div className="w-full text-center">
        <div className={`w-20 h-20 ${config.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{config.label}</h3>
        <p className="text-sm text-gray-500 mb-6">
          Check out our official page for more updates and stories.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center px-6 py-3 ${config.color} text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all active:scale-95`}
        >
          View Profile
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  )
}

// Error fallback
const EmbedError = ({ url, platform }) => (
  <div className="w-full p-8 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-900 font-bold mb-2">Unable to load {platform} content</p>
      <p className="text-sm text-gray-500 mb-6 max-w-[200px] mx-auto">This post might be private or deleted.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all"
      >
        Open on {platform}
        <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </div>
  </div>
)

// Error boundary
class EmbedErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, errorInfo) { console.error('Embed error:', error, errorInfo) }
  render() {
    if (this.state.hasError) return <EmbedError url={this.props.url} platform={this.props.platform} />
    return this.props.children
  }
}

const normalizeLinkedInUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  const shareUrnMatch = normalized.match(/share-(\d+)/);
  if (shareUrnMatch && shareUrnMatch[1]) return `https://www.linkedin.com/embed/feed/update/urn:li:share:${shareUrnMatch[1]}`;
  if (normalized.includes('linkedin.com/posts/activity-')) {
    const activityIdMatch = normalized.match(/activity-(\d+)/);
    if (activityIdMatch && activityIdMatch[1]) return `https://www.linkedin.com/embed/feed/update/urn:li:share:${activityIdMatch[1]}`;
  }
  if (normalized.includes('linkedin.com/feed/update/') && !normalized.includes('/embed/')) return normalized.replace('linkedin.com/feed/update/', 'linkedin.com/embed/feed/update/');
  if (normalized.includes('linkedin.com/posts/') && !normalized.includes('/embed/')) return normalized.replace('linkedin.com/posts/', 'linkedin.com/embed/posts/');
  return normalized;
};

const normalizeFacebookUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  normalized = normalized.replace('//m.facebook.com', '//www.facebook.com');
  normalized = normalized.replace('//web.facebook.com', '//www.facebook.com');
  return normalized;
};

const isProfileUrl = (platform, url) => {
  if (!url) return false;
  const normalized = url.toLowerCase();
  
  if (platform === 'instagram') {
    // We allow Instagram profiles/channels even if they don't have post segments
    // temporarily to see if the library handles them as requested.
    return false;
  }
  if (platform === 'linkedin') return normalized.includes('/company/') || normalized.includes('/in/');
  if (platform === 'facebook') {
    return !normalized.includes('/posts/') && !normalized.includes('/permalink.php') && !normalized.includes('/photo.php') && !normalized.includes('/videos/') && !normalized.includes('/watch/');
  }
  if (platform === 'twitter') return !normalized.includes('/status/');
  return false;
};

const SocialEmbed = ({ platform, url, width = '100%' }) => {
  if (isProfileUrl(platform, url)) {
    return <ProfileCard platform={platform} url={url} />;
  }

  const processedUrl = platform === 'linkedin' 
    ? normalizeLinkedInUrl(url) 
    : platform === 'facebook'
      ? normalizeFacebookUrl(url)
      : url;

  return (
    <EmbedErrorBoundary url={processedUrl} platform={platform}>
      <Suspense fallback={<EmbedLoader />}>
        {platform === 'linkedin' ? (
          <LinkedInEmbed url={processedUrl} width={width} />
        ) : platform === 'twitter' ? (
          <XEmbed url={url} width={width} />
        ) : platform === 'facebook' ? (
          <FacebookEmbed url={processedUrl} width={width} style={{ width: '100%', borderRadius: '12px' }} />
        ) : platform === 'instagram' ? (
          <InstagramEmbed url={url} width={width} />
        ) : platform === 'youtube' ? (
          <YouTubeEmbed url={url} width={width} height={315} />
        ) : (
          <EmbedError url={url} platform={platform} />
        )}
      </Suspense>
    </EmbedErrorBoundary>
  )
}

export default SocialEmbed
