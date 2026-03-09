/**
 * Route summary DTOs (OpenAPI RouteResult, SavedRoute basics).
 */

/** LineString as [lon, lat][] */
export type RouteGeometry = number[][];

export interface RouteResultSummary {
  geometry: RouteGeometry;
  distance_km: number;
  duration_min: number;
  warnings: string[];
}

export interface SavedRouteSummary {
  route_id: string;
  name: string;
  vehicle_id: string;
  distance_km?: number;
  duration_min?: number;
  geometry: RouteGeometry;
}
