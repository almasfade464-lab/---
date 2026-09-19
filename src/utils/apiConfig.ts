/**
 * API client helper to route calls smoothly across Web, PWA, and Capacitor native platforms (Android & iOS).
 * 
 * In standard Web / PWA environments, relative URLs (`/api/...`) hit the current origin.
 * In Capacitor native apps (e.g. running under https://localhost or capacitor://localhost),
 * if VITE_API_BASE_URL is defined, it prefixes requests with that backend server URL.
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  
  if (baseUrl) {
    return `${baseUrl}${normalizedPath}`;
  }
  
  return normalizedPath;
}
