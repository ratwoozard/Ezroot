import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

/** [lon, lat][] */
export type RouteGeometry = number[][];

export interface RouteResultDto {
  geometry: RouteGeometry;
  distance_km: number;
  duration_min: number;
  warnings: string[];
}

@Injectable()
export class GraphhopperService {
  constructor(private config: ConfigService) {}

  get baseUrl(): string | null {
    return this.config.graphhopperUrl;
  }

  /**
   * Parse "lat,lon" or "lon,lat" string. Returns [lon, lat] for GeoJSON/OpenAPI.
   */
  parsePoint(input: string): [number, number] | null {
    const trimmed = input.trim();
    const parts = trimmed.split(/[\s,]+/).map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      const a = parts[0];
      const b = parts[1];
      if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [b, a];
      if (b >= -90 && b <= 90 && a >= -180 && a <= 180) return [a, b];
      return [a, b];
    }
    return null;
  }

  /**
   * Call GraphHopper /route or return dev fallback if URL not set or request fails.
   */
  async route(
    points: Array<[number, number]>,
    _vehicleProfile?: { weight?: number; height?: number; width?: number },
  ): Promise<RouteResultDto> {
    const url = this.baseUrl;
    if (!url || points.length < 2) {
      return this.devFallback(points);
    }
    const pointsParam = points.map(([lon, lat]) => `${lat},${lon}`).join('&point=');
    const routeUrl = `${url}/route?point=${pointsParam}&vehicle=truck&locale=da`;
    try {
      const res = await fetch(routeUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        return this.devFallback(points, `GraphHopper returned ${res.status}`);
      }
      const data = (await res.json()) as {
        paths?: Array<{
          points?: { coordinates?: number[][] };
          distance?: number;
          time?: number;
        }>;
      };
      const path = data.paths?.[0];
      if (!path) {
        return this.devFallback(points, 'Ingen rute fundet');
      }
      const coords = path.points?.coordinates ?? [];
      const geometry: RouteGeometry = coords.map((c) => [Number(c[0]), Number(c[1])]);
      const distance_km = (path.distance ?? 0) / 1000;
      const duration_min = (path.time ?? 0) / 60000;
      return {
        geometry: geometry.length > 0 ? geometry : this.fallbackGeometry(points),
        distance_km,
        duration_min,
        warnings: [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return this.devFallback(points, msg);
    }
  }

  private devFallback(points: Array<[number, number]>, reason?: string): RouteResultDto {
    const geometry = this.fallbackGeometry(points);
    const warnings = [
      reason
        ? `Dev fallback: ${reason}. Ruten er vejledende.`
        : 'TODO: GraphHopper ikke konfigureret (GRAPHHOPPER_URL). Ruten er vejledende.',
    ];
    return {
      geometry,
      distance_km: 0,
      duration_min: 0,
      warnings,
    };
  }

  private fallbackGeometry(points: Array<[number, number]>): RouteGeometry {
    if (points.length === 0) return [];
    if (points.length === 1) return [points[0]];
    return points;
  }
}
