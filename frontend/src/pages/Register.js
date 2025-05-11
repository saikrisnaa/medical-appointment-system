import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    specialist: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [specialists, setSpecialists] = useState([]);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [customSpecialist, setCustomSpecialist] = useState('');

  const {
    name,
    email,
    password,
    confirmPassword,
    role,
    phone,
    address,
    specialist,
  } = formData;

  useEffect(() => {
    if (role === 'doctor') {
      axios.get('/api/users/specialists')
        .then(res => setSpecialists(res.data))
        .catch(() => setSpecialists([]));
    }
    setCustomSpecialist('');
  }, [role]);

  useEffect(() => {
    if (formData.confirmPassword.length > 0) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (role === 'doctor' && specialist === '__other__' && !customSpecialist) {
      setError('Please enter your specialist type');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
        phone,
        address,
        specialist:
          role === 'doctor'
            ? (specialist === '__other__' ? customSpecialist : specialist)
            : undefined,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.errors?.[0]?.msg ||
        'An error occurred during registration'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box className="register-topbar" />
      <Box className="register-container">
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        {error && (
          <Alert severity="error" className="register-alert">
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={onSubmit} className="register-form">
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            error={passwordMatch === false}
            helperText={
              passwordMatch === false
                ? 'Passwords do not match'
                : ''
            }
            InputProps={{
              endAdornment:
                passwordMatch === true ? (
                  <CheckCircleIcon color="success" />
                ) : passwordMatch === false ? (
                  <CancelIcon color="error" />
                ) : null,
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            select
            label="Role"
            name="role"
            value={role}
            onChange={onChange}
          >
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
          </TextField>
          {role === 'doctor' && (
            <>
              <TextField
                margin="normal"
                fullWidth
                select
                required
                label="Specialist"
                name="specialist"
                value={specialist || ''}
                onChange={onChange}
                error={role === 'doctor' && !specialist}
                helperText={role === 'doctor' && !specialist ? 'Specialist is required' : ''}
              >
                {specialists.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
                <MenuItem value="__other__">Other (please specify)</MenuItem>
              </TextField>
              {specialist === '__other__' && (
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Enter Specialist"
                  name="customSpecialist"
                  value={customSpecialist}
                  onChange={e => {
                    setCustomSpecialist(e.target.value);
                    setFormData({ ...formData, specialist: '__other__' });
                  }}
                  error={role === 'doctor' && specialist === '__other__' && !customSpecialist}
                  helperText={role === 'doctor' && specialist === '__other__' && !customSpecialist ? 'Please enter your specialist type' : ''}
                />
              )}
            </>
          )}
          <TextField
            margin="normal"
            fullWidth
            name="phone"
            label="Phone Number"
            type="tel"
            id="phone"
            autoComplete="tel"
            value={phone}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="address"
            label="Address"
            id="address"
            autoComplete="street-address"
            value={address}
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              {'Already have an account? Sign in'}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;