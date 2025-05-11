import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/user', { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  const features = [
    {
      icon: <CalendarTodayIcon fontSize="large" />,
      title: 'Easy Scheduling',
      description: 'Book appointments with your preferred doctors at your convenience.',
    },
    {
      icon: <AccessTimeIcon fontSize="large" />,
      title: '24/7 Access',
      description: 'Manage your appointments anytime, anywhere through our online platform.',
    },
    {
      icon: <PersonIcon fontSize="large" />,
      title: 'Personalized Care',
      description: 'Get personalized attention and care from our experienced medical professionals.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box className="home-hero-section">
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" className="home-hero-title" gutterBottom>
            Welcome to Apollo Medical Appointment System
          </Typography>
          <Typography variant="h5" className="home-hero-subtitle">
            Book appointments with ease and manage your healthcare needs efficiently
          </Typography>
          <Box className="home-hero-buttons">
            {(!user || user.role !== 'doctor') && (
              <button
                className="home-hero-button"
                onClick={() => navigate('/book-appointment')}
              >
                Book an Appointment
              </button>
            )}
            {!user && (
              <button
                className="home-signin-button"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" className="home-features-section">
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Grid container spacing={4} className="home-features-grid">
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card className="home-feature-card">
                <Box className="home-feature-icon">
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box className="home-cta-section">
        <Container maxWidth="md">
          <Paper elevation={3} className="home-cta-paper">
            <Typography variant="h4" component="h2" className="home-cta-title" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" className="home-cta-subtitle">
              Join our platform today and experience hassle-free medical appointment scheduling.
            </Typography>
            {!user && (
              <button
                className="home-cta-button"
                onClick={() => navigate('/register')}
              >
                Create an Account
              </button>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 