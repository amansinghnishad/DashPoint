const FALLBACK_API_BASE_URL = "http://localhost:5000/api";

// Production requests go through the Vercel same-origin rewrite so auth
// refresh cookies are first-party and survive browser reloads.
export const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : (import.meta.env.VITE_API_URL || FALLBACK_API_BASE_URL).trim();

export const SERVER_BASE_URL = API_BASE_URL.replace(/\/?api\/?$/, "");

export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
