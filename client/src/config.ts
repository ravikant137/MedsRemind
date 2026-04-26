const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const envApiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const API_URL = (isProd && envApiUrl.includes('localhost')) ? '' : envApiUrl;
