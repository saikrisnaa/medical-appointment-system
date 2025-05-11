import React, { useState, useEffect } from 'react';
import '../styles/BookAppointment.css';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctor: '',
    date: null,
    time: '',
    reason: '',
    notes: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');

  const { doctor, date, time, reason, notes } = formData;

  useEffect(() => {
    // Fetch specialists list
    axios.get('/api/users/specialists')
      .then(res => setSpecialists(res.data))
      .catch(() => setSpecialists([]));
  }, []);

  useEffect(() => {
    // Fetch doctors list for selected specialist
    if (selectedSpecialist) {
      axios.get('/api/users/doctors', { params: { specialist: selectedSpecialist } })
        .then(res => setDoctors(res.data))
        .catch(() => setDoctors([]));
      setFormData(f => ({ ...f, doctor: '' }));
      setAvailableTimes([]);
    }
  }, [selectedSpecialist]);

  useEffect(() => {
    // Fetch available times when doctor and date are selected
    const fetchAvailableTimes = async () => {
      if (doctor && date) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/available-times`, {
            params: {
              doctor,
              date: date.toISOString().split('T')[0],
            },
          });
          setAvailableTimes(res.data);
        } catch (err) {
          setError('Failed to fetch available times');
        }
      }
    };

    fetchAvailableTimes();
  }, [doctor, date]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/appointments`,
        {
          ...formData,
          date: date.toISOString().split('T')[0],
        },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      navigate('/appointments');
    } catch (err) {
      setError(
        err.response?.data?.msg || 'An error occurred while booking the appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box className="bookapp-gradient-bar" />
      <Box className="bookapp-main-box">
        <Typography component="h1" variant="h4" gutterBottom>
          Book an Appointment
        </Typography>
        {error && (
          <Alert severity="error" className="bookapp-alert">
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={onSubmit} className="bookapp-form-box">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Select Specialist"
                name="specialist"
                value={selectedSpecialist}
                onChange={e => setSelectedSpecialist(e.target.value)}
              >
                {specialists.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Select Doctor"
                name="doctor"
                value={doctor}
                onChange={onChange}
                disabled={!selectedSpecialist}
              >
                {doctors.map((doc) => (
                  <MenuItem key={doc._id} value={doc._id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={(newDate) =>
                    setFormData({ ...formData, date: newDate })
                  }
                  renderInput={(params) => (
                    <TextField {...params} required fullWidth />
                  )}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Select Time"
                name="time"
                value={time}
                onChange={onChange}
                disabled={!date || !doctor}
              >
                {availableTimes.map((timeSlot) => (
                  <MenuItem key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Reason for Appointment"
                name="reason"
                multiline
                rows={2}
                value={reason}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                multiline
                rows={3}
                value={notes}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="bookapp-submit-btn"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BookAppointment; 