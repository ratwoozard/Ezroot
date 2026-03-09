'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { useAuth } from '@/lib/auth/AuthContext';
import { api } from '@/lib/api/client';
import { MapView } from '@/components/map/MapView';
import { RouteDisclaimer } from '@/components/map/RouteDisclaimer';
import { RoutePlannerForm, type RouteRequestParams } from '@/components/route-planner/RoutePlannerForm';
import { SavedPlacesPanel } from '@/components/saved-places/SavedPlacesPanel';
import { SavedRoutesPanel } from '@/components/saved-routes/SavedRoutesPanel';
import { ExportPanel } from '@/components/exports/ExportPanel';
import type { components } from '@ezroot/openapi/generated/schema';
import type { RouteGeometry } from '@/components/map/MapView';

type RouteResult = components['schemas']['RouteResult'];
type VehicleProfile = components['schemas']['VehicleProfile'];
type SavedRoute = components['schemas']['SavedRoute'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [vehicleProfiles, setVehicleProfiles] = useState<VehicleProfile[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeRequest, setRouteRequest] = useState<RouteRequestParams | null>(null);
  const [loadedRouteGeometry, setLoadedRouteGeometry] = useState<RouteGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profilesRes, routesRes] = await Promise.all([
          api.GET('/vehicle-profiles', { params: { query: { page: 1, limit: 100 } } }),
          api.GET('/saved-routes', { params: { query: { page: 1, limit: 100 } } }),
        ]);
        if (profilesRes.data?.items) setVehicleProfiles(profilesRes.data.items);
        if (routesRes.data?.items) setSavedRoutes(routesRes.data.items);
      } catch {
        setError('Kunne ikke hente data');
      }
    };
    fetch();
  }, []);

  const handleRouteResult = (result: RouteResult | null, request?: RouteRequestParams) => {
    setRouteResult(result);
    setRouteRequest(request ?? null);
    if (!result) setLoadedRouteGeometry(null);
  };

  const mapGeometry = routeResult?.geometry ?? loadedRouteGeometry ?? null;
  const currentRouteForSave = routeResult && routeRequest
    ? {
        name: '',
        origin: routeRequest.origin,
        destination: routeRequest.destination,
        waypoints: routeRequest.waypoints,
        geometry: routeResult.geometry ?? [],
        distance_km: routeResult.distance_km,
        duration_min: routeResult.duration_min,
      }
    : null;

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Paper
        elevation={0}
        sx={{
          width: 320,
          minWidth: 320,
          maxHeight: '100vh',
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6">Dashboard</Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              {user.name} · {user.email}
            </Typography>
          )}
        </Box>
        {error && (
          <Alert severity="info" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <RoutePlannerForm
          vehicleProfiles={vehicleProfiles}
          onResult={handleRouteResult}
        />
        <SavedPlacesPanel />
        <SavedRoutesPanel
          vehicleProfiles={vehicleProfiles}
          currentRouteForSave={currentRouteForSave}
          onLoadRoute={(g) => {
            setLoadedRouteGeometry(g);
            setRouteResult(null);
            setRouteRequest(null);
          }}
          onClearSavePreview={() => {
            setRouteResult(null);
            setRouteRequest(null);
          }}
        />
        <ExportPanel savedRoutes={savedRoutes} />
      </Paper>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ flex: 1, position: 'relative', minHeight: 400 }}>
          <MapView routeGeometry={mapGeometry} />
        </Box>
        <RouteDisclaimer />
      </Box>
    </Box>
  );
}
