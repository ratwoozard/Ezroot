'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import type { components } from '@ezroot/openapi/generated/schema';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/api/errors';

type SavedRoute = components['schemas']['SavedRoute'];

interface ExportPanelProps {
  savedRoutes: SavedRoute[];
}

type JobStatus = components['schemas']['ExportJob'];

export function ExportPanel({ savedRoutes }: ExportPanelProps) {
  const [routeId, setRouteId] = useState('');
  const [format, setFormat] = useState<'GPX' | 'PDF'>('GPX');
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!routeId) {
      setError('Vælg en rute');
      return;
    }
    setError(null);
    setJob(null);
    setLoading(true);
    try {
      const { data, error: resError } = await api.POST('/exports', {
        body: { routeId, format },
      });
      if (resError) {
        setError(getErrorMessage(resError));
        return;
      }
      if (data) setJob(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isPlaceholderPdf = job?.status === 'completed' && format === 'PDF' && job.message?.includes('placeholder');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">Eksport</Typography>
      <FormControl size="small" fullWidth>
        <InputLabel>Rute</InputLabel>
        <Select
          value={routeId}
          label="Rute"
          onChange={(e) => setRouteId(e.target.value)}
        >
          <MenuItem value="">Vælg...</MenuItem>
          {savedRoutes.map((r) => (
            <MenuItem key={r.route_id} value={r.route_id}>{r.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" fullWidth>
        <InputLabel>Format</InputLabel>
        <Select
          value={format}
          label="Format"
          onChange={(e) => setFormat(e.target.value as 'GPX' | 'PDF')}
        >
          <MenuItem value="GPX">GPX</MenuItem>
          <MenuItem value="PDF">PDF</MenuItem>
        </Select>
      </FormControl>
      {error && <Alert severity="error">{error}</Alert>}
      <Button size="small" variant="outlined" onClick={handleCreate} disabled={loading}>
        {loading ? 'Opretter…' : 'Opret eksport'}
      </Button>
      {job && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">Status: {job.status}</Typography>
          {job.message && (
            <Typography variant="caption" color="text.secondary">{job.message}</Typography>
          )}
          {job.status === 'completed' && job.file_url && (
            <Box sx={{ mt: 1 }}>
              {job.file_url.startsWith('data:') ? (
                <Button
                  size="small"
                  component="a"
                  href={job.file_url}
                  download="route.gpx"
                  variant="contained"
                >
                  Download GPX
                </Button>
              ) : (
                <Link href={job.file_url} target="_blank" rel="noopener">
                  Åbn fil
                </Link>
              )}
            </Box>
          )}
          {isPlaceholderPdf && (
            <Alert severity="info" sx={{ mt: 1 }}>
              PDF-eksport er endnu en placeholder. Brug GPX til download af rutedata.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
