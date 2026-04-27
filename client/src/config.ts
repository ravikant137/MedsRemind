const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

export const API_URL = isProd ? '' : (process.env.NEXT_PUBLIC_API_URL || '');
