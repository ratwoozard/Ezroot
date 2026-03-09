'use client';

import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EzRoot
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.name} · {user.email}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Log ud
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}
