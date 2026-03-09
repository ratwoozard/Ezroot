'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { api } from '@/lib/api/client';
import type { components } from '@ezroot/openapi/generated/schema';
import { getErrorMessage } from '@/lib/api/errors';
import type { RouteGeometry } from '@/components/map/MapView';

type SavedRoute = components['schemas']['SavedRoute'];
type VehicleProfile = components['schemas']['VehicleProfile'];

interface SavedRoutesPanelProps {
  vehicleProfiles: VehicleProfile[];
  currentRouteForSave: {
    name: string;
    origin: string;
    destination: string;
    waypoints?: string[];
    geometry: RouteGeometry;
    distance_km?: number;
    duration_min?: number;
  } | null;
  onLoadRoute: (geometry: RouteGeometry) => void;
  onClearSavePreview: () => void;
}

export function SavedRoutesPanel({
  vehicleProfiles,
  currentRouteForSave,
  onLoadRoute,
  onClearSavePreview,
}: SavedRoutesPanelProps) {
  const [items, setItems] = useState<SavedRoute[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveVehicleId, setSaveVehicleId] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const limit = 20;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.GET('/saved-routes', {
        params: { query: { page, limit, search: search || undefined } },
      });
      if (res.data) {
        setItems(res.data.items ?? []);
        setTotalCount(res.data.totalCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, search]);

  const handleLoad = async (routeId: string) => {
    const res = await api.GET('/saved-routes/{id}', { params: { path: { id: routeId } } });
    if (res.data?.geometry?.length) {
      onLoadRoute(res.data.geometry);
    }
  };

  const handleDelete = async (routeId: string) => {
    await api.DELETE('/saved-routes/{id}', { params: { path: { id: routeId } } });
    fetchList();
  };

  const openSaveDialog = () => {
    setSaveName(currentRouteForSave?.name ?? 'Ny rute');
    setSaveVehicleId(vehicleProfiles[0]?.vehicle_id ?? '');
    setSaveError(null);
    setSaveOpen(true);
  };

  const handleSave = async () => {
    if (!currentRouteForSave || !saveName.trim() || !saveVehicleId) {
      setSaveError('Navn og køretøjsprofil er påkrævet');
      return;
    }
    setSaveError(null);
    const { error } = await api.POST('/saved-routes', {
      body: {
        name: saveName,
        vehicleId: saveVehicleId,
        origin: currentRouteForSave.origin,
        destination: currentRouteForSave.destination,
        waypoints: currentRouteForSave.waypoints,
        geometry: currentRouteForSave.geometry,
        distance_km: currentRouteForSave.distance_km,
        duration_min: currentRouteForSave.duration_min,
      },
    });
    if (error) {
      setSaveError(getErrorMessage(error));
      return;
    }
    setSaveOpen(false);
    onClearSavePreview();
    fetchList();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">Gemte ruter</Typography>
      <TextField
        size="small"
        placeholder="Søg..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {currentRouteForSave && (
        <Button size="small" variant="contained" onClick={openSaveDialog}>
          Gem nuværende rute
        </Button>
      )}
      {loading ? (
        <Typography variant="body2" color="text.secondary">Indlæser…</Typography>
      ) : (
        <List dense sx={{ maxHeight: 220, overflow: 'auto' }}>
          {items.map((r) => (
            <ListItem
              key={r.route_id}
              onClick={() => handleLoad(r.route_id!)}
              sx={{ cursor: 'pointer' }}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); handleDelete(r.route_id!); }}>
                  ×
                </IconButton>
              }
            >
              <ListItemText
                primary={r.name}
                secondary={r.distance_km != null ? `${r.distance_km.toFixed(1)} km` : undefined}
              />
            </ListItem>
          ))}
        </List>
      )}
      {totalCount > limit && (
        <Typography variant="caption">Viser {items.length} af {totalCount}</Typography>
      )}

      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Gem rute</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField size="small" label="Navn" value={saveName} onChange={(e) => setSaveName(e.target.value)} required />
          <FormControl size="small" fullWidth required>
            <InputLabel>Køretøjsprofil</InputLabel>
            <Select
              value={saveVehicleId}
              label="Køretøjsprofil"
              onChange={(e) => setSaveVehicleId(e.target.value)}
            >
              {vehicleProfiles.map((p) => (
                <MenuItem key={p.vehicle_id} value={p.vehicle_id!}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {saveError && <Typography color="error">{saveError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Annuller</Button>
          <Button onClick={handleSave} variant="contained">Gem</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
