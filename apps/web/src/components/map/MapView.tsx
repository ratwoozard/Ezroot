'use client';

import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { config, FALLBACK_MAP_STYLE } from '@/lib/config';

/** GeoJSON LineString coordinates [lon, lat][] */
export type RouteGeometry = number[][];

interface MapViewProps {
  /** Optional route to draw (e.g. from POST /routes/compute). */
  routeGeometry?: RouteGeometry | null;
  /** Initial center [lon, lat] */
  center?: [number, number];
  /** Initial zoom */
  zoom?: number;
}

const DEFAULT_CENTER: [number, number] = [12.57, 55.68];
const DEFAULT_ZOOM = 10;

export function MapView({
  routeGeometry = null,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [styleError, setStyleError] = useState(false);

  const styleUrl =
    config.mapStyleUrl && !styleError
      ? config.mapStyleUrl
      : FALLBACK_MAP_STYLE;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('error', (e) => {
      if (e.error?.message?.includes('style') || e.error?.message?.includes('Failed to load')) {
        setStyleError(true);
      }
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData({ type: 'FeatureCollection', features: [] });
    }
    if (routeGeometry && routeGeometry.length >= 2) {
      const geojson = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: routeGeometry,
        },
      };
      if (map.getSource('route')) {
        (map.getSource('route') as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource('route', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#1565c0', 'line-width': 4 },
        });
      }
    }
  }, [routeGeometry]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 300 }}
    />
  );
}
