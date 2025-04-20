// lib/utils/isWebView.ts

export function isWebViewUA(userAgent: string) {
    const ua = userAgent.toLowerCase();
  
    const isAndroidWV = ua.includes('wv') || (ua.includes('version/') && ua.includes('chrome/'));
    const isIOSWV = ua.includes('applewebkit') && !ua.includes('safari');
    const isInAppBrowser = ua.includes('instagram') || ua.includes('fbav') || ua.includes('line') || ua.includes('linkedin') || ua.includes('medial');
  
    return isAndroidWV || isIOSWV || isInAppBrowser;
  }