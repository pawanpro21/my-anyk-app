const rawApiUrl = import.meta.env.VITE_API_URL || '';
const parsedApiUrl = rawApiUrl
  .split(',')
  .map(item => String(item).trim())
  .filter(Boolean)[0] || null;

const defaultApiUrl = parsedApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);
export const API_URL = String(defaultApiUrl).replace(/\/$/, "");

export default API_URL;
