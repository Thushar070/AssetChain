/**
 * Centralized runtime network configuration.
 *
 * Strategy:
 *   1. If VITE_API_URL is set in .env AND does NOT contain "localhost" → use it as-is (production/staging).
 *   2. Otherwise → derive the backend URL from window.location.hostname at runtime.
 *      - This makes localhost dev AND LAN cross-device testing work automatically
 *        without any code changes.
 *
 * Examples:
 *   Developer machine:   window.location.hostname = "localhost"   → http://localhost:3001/api/v1
 *   Friend's laptop:     window.location.hostname = "10.10.32.207" → http://10.10.32.207:3001/api/v1
 *   Production:          VITE_API_URL = "https://api.assetchain.io/api/v1" → used directly
 */

const BACKEND_PORT = 3001;

function deriveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;

  // 1. If an explicit env URL is configured, use it.
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '');
  }

  const hostname = window.location.hostname;
  const isLocalDev =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  // 2. Local dev or LAN testing
  if (isLocalDev) {
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:${BACKEND_PORT}/api/v1`;
  }

  // 3. Deployed production site (e.g. Vercel)
  return '/api/v1';
}

function deriveWsBaseUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;

  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '');
  }

  const hostname = window.location.hostname;
  const isLocalDev =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (isLocalDev) {
    return `${wsProtocol}//${hostname}:${BACKEND_PORT}`;
  }

  return `${wsProtocol}//${hostname}`;
}

/**
 * The single source of truth for the API base URL.
 * Import this in api.ts and any component that needs to make direct fetch() calls.
 */
export const API_BASE_URL = deriveApiBaseUrl();

/**
 * The single source of truth for the WebSocket URL.
 */
export const WS_BASE_URL = deriveWsBaseUrl();
