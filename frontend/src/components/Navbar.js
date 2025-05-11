import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token },
      })
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/dashboard'); // or '/profile' if you have a profile page
  };

  return (
    <AppBar position="fixed" className="navbar-appbar">
      <Toolbar className="navbar-toolbar">
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          className="navbar-title"
        >
          APOLLO
        </Typography>

        <Box className="navbar-links">
          {(!user || user.role !== 'doctor') && (
            <>
              <button
                className="navbar-button"
                onClick={() => navigate('/appointments')}
              >
                Appointments
              </button>
              <button
                className="navbar-button"
                onClick={() => navigate('/book-appointment')}
              >
                Book Appointment
              </button>
            </>
          )}

          {isAuthenticated && user ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user.name ? (
                  <Avatar className="navbar-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>
                  {user.name ? user.name : 'Profile'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <button
                className="navbar-button"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="navbar-button"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;