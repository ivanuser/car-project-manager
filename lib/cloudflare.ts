/**
 * cloudflare.ts - Cloudflare integration utilities
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// Check if the application is running in a Cloudflare environment
export const isCloudflareEnvironment = (): boolean => {
  return (
    typeof process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL !== 'undefined' &&
    process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL === 'true'
  );
};

// Get the correct site URL based on the environment
export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

// Helper function to handle Cloudflare specific headers
export const getCloudflareHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (isCloudflareEnvironment()) {
    // Add any Cloudflare-specific headers here if needed
    headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID || '';
    headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET || '';
  }

  return headers;
};

export default {
  isCloudflareEnvironment,
  getSiteUrl,
  getCloudflareHeaders,
};
