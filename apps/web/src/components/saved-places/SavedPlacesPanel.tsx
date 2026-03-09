'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { api } from '@/lib/api/client';
import type { components } from '@ezroot/openapi/generated/schema';
import { getErrorMessage } from '@/lib/api/errors';

type SavedPlace = components['schemas']['SavedPlace'];

export function SavedPlacesPanel() {
  const [items, setItems] = useState<SavedPlace[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [address, setAddress] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const limit = 20;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.GET('/saved-places', {
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

  const handleAdd = () => {
    setName('');
    setLat('');
    setLon('');
    setAddress('');
    setSubmitError(null);
    setOpen(true);
  };

  const handleCreate = async () => {
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (Number.isNaN(latN) || Number.isNaN(lonN)) {
      setSubmitError('Ugyldige koordinater');
      return;
    }
    setSubmitError(null);
    const { error } = await api.POST('/saved-places', {
      body: { name, lat: latN, lon: lonN, address: address || undefined },
    });
    if (error) {
      setSubmitError(getErrorMessage(error));
      return;
    }
    setOpen(false);
    fetchList();
  };

  const handleDelete = async (placeId: string) => {
    await api.DELETE('/saved-places/{id}', { params: { path: { id: placeId } } });
    fetchList();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">Gemte steder</Typography>
      <TextField
        size="small"
        placeholder="Søg..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button size="small" variant="outlined" onClick={handleAdd}>+ Tilføj sted</Button>
      {loading ? (
        <Typography variant="body2" color="text.secondary">Indlæser…</Typography>
      ) : (
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {items.map((p) => (
            <ListItem
              key={p.place_id}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => handleDelete(p.place_id!)}>
                  ×
                </IconButton>
              }
            >
              <ListItemText
                primary={p.name}
                secondary={p.address ?? `${p.lat}, ${p.lon}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      {totalCount > limit && (
        <Typography variant="caption">Viser {items.length} af {totalCount}</Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Nyt gemt sted</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField size="small" label="Navn" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField size="small" label="Lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="55.68" />
          <TextField size="small" label="Lon" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="12.57" />
          <TextField size="small" label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
          {submitError && <Typography color="error">{submitError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuller</Button>
          <Button onClick={handleCreate} variant="contained">Gem</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
