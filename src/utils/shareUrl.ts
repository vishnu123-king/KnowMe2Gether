/**
 * Utility to format public shareable links for responders.
 * Ensures links use the public domain (such as https://your-app.onrender.com)
 * rather than internal Docker/localhost addresses when running in production.
 */
export function formatPublicShareUrl(shareUrl?: string, responderToken?: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    // Extract token if not explicitly provided
    let token = responderToken;
    if (!token && shareUrl) {
      const match = shareUrl.match(/\/test\/([^/?#]+)/);
      if (match) {
        token = match[1];
      }
    }

    // If running in browser on a production domain (e.g. *.onrender.com or custom domain)
    // Always use window.location.origin to guarantee the link matches the public site!
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      if (token) {
        return `${origin}/test/${token}`;
      }
      if (shareUrl && !shareUrl.includes('localhost') && !shareUrl.includes('0.0.0.0')) {
        return shareUrl;
      }
      return `${origin}/test/${token || ''}`;
    }

    // If browser is on localhost, but shareUrl is already a real public URL (e.g. onrender.com)
    if (shareUrl && !shareUrl.includes('localhost') && !shareUrl.includes('0.0.0.0') && !shareUrl.includes('127.0.0.1')) {
      return shareUrl;
    }

    // Default local preview
    if (token) {
      return `${origin}/test/${token}`;
    }
  }

  return shareUrl || '';
}
