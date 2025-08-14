// API Server Configuration
// Automatically detects environment and uses appropriate URL
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost');

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3500'  // Development URL
  : 'https://db.madewithmanifest.com';  // Production URL

