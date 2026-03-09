'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { api } from '@/lib/api/client';
import type { components } from '@ezroot/openapi/generated/schema';
import { getErrorMessage } from '@/lib/api/errors';

type RouteResult = components['schemas']['RouteResult'];
type VehicleProfile = components['schemas']['VehicleProfile'];

export interface RouteRequestParams {
  origin: string;
  destination: string;
  waypoints?: string[];
}

interface RoutePlannerFormProps {
  vehicleProfiles: VehicleProfile[];
  onResult: (result: RouteResult | null, request?: RouteRequestParams) => void;
}

export function RoutePlannerForm({ vehicleProfiles, onResult }: RoutePlannerFormProps) {
  const [origin, setOrigin] = useState('55.68,12.57');
  const [destination, setDestination] = useState('55.69,12.58');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [vehicleId, setVehicleId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RouteResult | null>(null);

  const addWaypoint = () => setWaypoints((w) => [...w, '']);
  const removeWaypoint = (i: number) => setWaypoints((w) => w.filter((_, j) => j !== i));
  const setWaypoint = (i: number, v: string) =>
    setWaypoints((w) => w.map((x, j) => (j === i ? v : x)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    onResult(null);
    try {
      const body = {
        origin,
        destination,
        waypoints: waypoints.filter(Boolean).length ? waypoints.filter(Boolean) : undefined,
        vehicleId: vehicleId || undefined,
      };
      const { data, error: resError } = await api.POST('/routes/compute', { body });
      if (resError || !data) {
        const msg = resError && typeof resError === 'object' && 'message' in resError
          ? String((resError as { message: unknown }).message)
          : 'Kunne ikke beregne rute';
        setError(msg);
        return;
      }
      setLastResult(data);
      onResult(data, { origin, destination, waypoints: waypoints.filter(Boolean).length ? waypoints.filter(Boolean) : undefined });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">Planlæg rute</Typography>
      <TextField
        size="small"
        label="Start (lat,lon)"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="55.68,12.57"
        required
      />
      <TextField
        size="small"
        label="Slut (lat,lon)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="55.69,12.58"
        required
      />
      {waypoints.map((wp, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label={`Mellemstop ${i + 1}`}
            value={wp}
            onChange={(e) => setWaypoint(i, e.target.value)}
            placeholder="lat,lon"
            fullWidth
          />
          <IconButton size="small" onClick={() => removeWaypoint(i)} aria-label="Fjern">
            ×
          </IconButton>
        </Box>
      ))}
      <Button size="small" onClick={addWaypoint} variant="outlined">+ Mellemstop</Button>
      <FormControl size="small" fullWidth>
        <InputLabel>Køretøjsprofil</InputLabel>
        <Select
          value={vehicleId}
          label="Køretøjsprofil"
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <MenuItem value="">Ingen</MenuItem>
          {vehicleProfiles.map((p) => (
            <MenuItem key={p.vehicle_id} value={p.vehicle_id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Beregn rute'}
      </Button>
      {lastResult && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            Afstand: {lastResult.distance_km != null ? `${lastResult.distance_km.toFixed(1)} km` : '–'}
          </Typography>
          <Typography variant="body2">
            Varighed: {lastResult.duration_min != null ? `${Math.round(lastResult.duration_min)} min` : '–'}
          </Typography>
          {lastResult.warnings?.length ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              {lastResult.warnings.join(' ')}
            </Alert>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
