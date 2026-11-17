// Backend API Base URL - configurable via VITE_API_BASE_URL in environment (e.g. Vercel)
// Falls back to http://localhost:8080 for local development.
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

// Default reliable SVG placeholder data URLs for Nigerian social commerce items
export const FALLBACK_ANKARA_IMAGE =
  "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80";

export const FALLBACK_SNEAKERS_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

export const FALLBACK_BAG_IMAGE =
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80";
