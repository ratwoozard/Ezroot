'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function RouteDisclaimer() {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: 'grey.100',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        <strong>Bemærk:</strong> Ruten er vejledende. Kontroller altid restriktioner og vejforhold før kørsel.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        © OpenStreetMap contributors
      </Typography>
    </Box>
  );
}
