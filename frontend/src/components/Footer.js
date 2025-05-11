import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg" className="footer-container">
        <Box className="footer-content">
          <Typography variant="body2" color="text.secondary">
            {new Date().getFullYear()} Medical Appointment System. All rights reserved.
          </Typography>
          <Box className="footer-links">
            <Link href="#" color="inherit" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" className="footer-link">
              Terms of Service
            </Link>
            <Link href="#" color="inherit" className="footer-link">
              Contact Us
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;