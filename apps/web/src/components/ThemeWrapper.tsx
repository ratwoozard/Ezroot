'use client';

import { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#1565c0' },
          secondary: { main: '#2e7d32' },
        },
        typography: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        },
      }),
    [],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
