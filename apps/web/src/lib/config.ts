/**
 * Client-side env (NEXT_PUBLIC_*).
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  mapStyleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? '',
} as const;

/**
 * Fallback map style when NEXT_PUBLIC_MAP_STYLE_URL is not set or fails.
 * Uses OpenFreeMap (same OSM/MapLibre stack as TerraInk) – gratis, ingen API-nøgle.
 * Andre styles: bright, positron, liberty, dark.
 * @see https://tiles.openfreemap.org/
 */
export const FALLBACK_MAP_STYLE =
  'https://tiles.openfreemap.org/styles/bright';
