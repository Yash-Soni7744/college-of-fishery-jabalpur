import React, { Suspense, lazy } from 'react'
import { Instagram, Linkedin, Facebook, Twitter, Youtube, ExternalLink, ArrowUpRight } from 'lucide-react'

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
      <p className="text-gray-400 text-sm font-medium">Preparing post...</p>
    </div>
  </div>
)

// High-quality Profile Card for non-embeddable links (like profile pages)
const ProfileCard = ({ platform, url }) => {
  const platformConfig = {
    instagram: { 
      icon: Instagram, 
      color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', 
      label: 'Instagram Feed',
      username: '@cofsc_jabalpur',
      description: 'Follow our official Instagram for daily updates, reels, and stories from the college.'
    },
    linkedin: { 
      icon: Linkedin, 
      color: 'bg-[#0077b5]', 
      label: 'LinkedIn Page',
      username: 'COFS Jabalpur',
      description: 'Connect with us on LinkedIn for professional news, career updates, and academic highlights.'
    },
    facebook: { 
      icon: Facebook, 
      color: 'bg-[#1877f2]', 
      label: 'Facebook Page',
      username: 'College of Fishery Science',
      description: 'Join our community on Facebook for event updates, photos, and live announcements.'
    },
    twitter: { 
      icon: Twitter, 
      color: 'bg-black', 
      label: 'X (Twitter)',
      username: '@cofs_jabalpur',
      description: 'Get real-time updates and short news highlights directly from our Twitter feed.'
    },
    youtube: { 
      icon: Youtube, 
      color: 'bg-[#ff0000]', 
      label: 'YouTube Channel',
      username: 'COFS TV',
      description: 'Watch detailed videos, event recordings, and educational content on our channel.'
    }
  }

  const config = platformConfig[platform] || platformConfig.instagram
  const Icon = config.icon

  return (
    <div className="w-full p-8 bg-white border border-gray-50 flex flex-col items-center text-center">
      <div className={`w-20 h-20 ${config.color} rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transform rotate-3`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      
      <div className="mb-8">
        <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{config.label}</h3>
        <p className="text-blue-600 font-bold text-sm mb-4">{config.username}</p>
        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto">
          {config.description}
        </p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-4 px-6 ${config.color} text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group uppercase tracking-widest`}
      >
        Open Profile
        <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </a>
    </div>
  )
}

// Error fallback
const EmbedError = ({ url, platform }) => (
  <div className="w-full p-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
    <p className="text-gray-900 font-bold mb-1">Content Hidden</p>
    <p className="text-xs text-gray-500 mb-6">This {platform} content is either private or could not be loaded.</p>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4"
    >
      View directly on {platform}
      <ExternalLink className="w-4 h-4 ml-1" />
    </a>
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

// Helper to detect if a URL is a profile page (improved detection)
const isProfileUrl = (platform, url) => {
  if (!url) return false;
  const normalized = url.toLowerCase();
  
  if (platform === 'instagram') {
    // IG profile links are just username, but embeds only work with /p/ /reels/ /tv/
    return !normalized.includes('/p/') && !normalized.includes('/reels/') && !normalized.includes('/tv/');
  }
  if (platform === 'linkedin') {
    return normalized.includes('/company/') || normalized.includes('/in/') || !normalized.includes('/update/');
  }
  if (platform === 'facebook') {
    const isPost = normalized.includes('/posts/') || 
                   normalized.includes('/permalink.php') || 
                   normalized.includes('/photo.php') || 
                   normalized.includes('/videos/') || 
                   normalized.includes('/watch/');
    return !isPost;
  }
  if (platform === 'twitter') {
    return !normalized.includes('/status/');
  }
  return false;
};

const SocialEmbed = ({ platform, url, width = '100%' }) => {
  // If it's a profile link, we use our high-quality custom card 
  // because social platforms explicitly block embedding of entire grids/profiles.
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
          <LinkedInEmbed url={processedUrl} width="100%" />
        ) : platform === 'twitter' ? (
          <XEmbed url={url} width="100%" />
        ) : platform === 'facebook' ? (
          <FacebookEmbed 
            url={processedUrl} 
            width="100%" 
            containerStyle={{ width: '100%', margin: '0' }}
          />
        ) : platform === 'instagram' ? (
          <InstagramEmbed url={url} width="100%" />
        ) : platform === 'youtube' ? (
          <YouTubeEmbed url={url} width="100%" height={315} />
        ) : (
          <EmbedError url={url} platform={platform} />
        )}
      </Suspense>
    </EmbedErrorBoundary>
  )
}

export default SocialEmbed
