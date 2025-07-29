import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Switch,
  AppBar,
  Toolbar,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

function Settings({ handleSignOut }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <Box>
      <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* User Profile Card */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src="https://placehold.co/100x100/E2E8F0/4A5568?text=VD"
              alt="User Avatar"
              sx={{ width: 64, height: 64, mr: 2 }}
            />
            <Box>
              <Typography variant="h6" component="p" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Vedika Desai
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Settings List */}
        <Card elevation={2}>
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <NotificationsIcon sx={{ color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      Notifications
                    </Typography>
                  }
                />
                <Switch
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  color="primary"
                />
              </ListItemButton>
            </ListItem>

            <Divider />

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PaletteIcon sx={{ color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      Appearance
                    </Typography>
                  }
                />
                <ChevronRightIcon color="action" />
              </ListItemButton>
            </ListItem>

            <Divider />

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleSignOut}
                sx={{
                  justifyContent: 'center',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  }
                }}
              >
                <LogoutIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Sign Out
                </Typography>
              </ListItemButton>
            </ListItem>
          </List>
        </Card>
      </Box>
    </Box>
  );
}

export default Settings;
