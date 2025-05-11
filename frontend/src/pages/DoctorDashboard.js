import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/Dashboard.css';

const DoctorDashboard = ({ user, setUser, defaultDoctors }) => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [error, setError] = useState('');
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '', specialist: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    const fetchData = async () => {
      try {
        const appointmentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/upcoming`, config);
        setUpcomingAppointments(appointmentsRes.data);
        setEditData({
          name: user?.name || '',
          phone: user?.phone || '',
          address: user?.address || '',
          specialist: user?.specialist || '',
        });
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    if (user) fetchData();
  }, [user]);

  const getAppointmentMainName = useCallback(
    (appointment) => {
      if (appointment.patient && typeof appointment.patient === 'object' && appointment.patient.name) {
        return appointment.patient.name;
      }
      if (typeof appointment.patient === 'string') {
        return appointment.patient;
      }
      return 'Unknown Patient';
    },
    []
  );

  const fetchMyAppointments = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments`, config);
      setMyAppointments(
        res.data.filter((app) => app.doctor === user._id || app.doctor?._id === user._id)
      );
      setAppointmentsOpen(true);
    } catch (err) {
      setError('Failed to fetch appointments');
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/appointments/${id}`, { status: 'completed' }, config);
      setMyAppointments((apps) =>
        apps.map((app) => (app._id === id ? { ...app, status: 'completed' } : app))
      );
      setUpcomingAppointments((apps) =>
        apps.map((app) => (app._id === id ? { ...app, status: 'completed' } : app))
      );
    } catch (err) {
      setError('Failed to approve appointment');
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/appointments/${id}`, { status: 'cancelled' }, config);
      setMyAppointments((apps) =>
        apps.map((app) => (app._id === id ? { ...app, status: 'cancelled' } : app))
      );
      setUpcomingAppointments((apps) =>
        apps.map((app) => (app._id === id ? { ...app, status: 'cancelled' } : app))
      );
    } catch (err) {
      setError('Failed to reject appointment');
    }
  };

  const handleEditOpen = () => {
    setEditError('');
    setEditSuccess('');
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      specialist: user?.specialist || '',
    });
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/user`, editData, config);
      setUser(res.data);
      setEditSuccess('Profile updated successfully.');
      setTimeout(() => setEditOpen(false), 1000);
    } catch (err) {
      setEditError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Box className="dashboard-gradient-bar" />
      <Box className="dashboard-content">
        <Typography variant="h4" gutterBottom>
          Doctor Dashboard
        </Typography>
        {error && <Alert severity="error" className="dashboard-alert">{error}</Alert>}
        <Grid container spacing={3}>
          {/* Doctor Profile Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box className="dashboard-profile-header">
                  <PersonIcon className="dashboard-profile-icon" />
                  <Typography variant="h6">Profile Information</Typography>
                </Box>
                <List>
                  <ListItem>
                    <ListItemText primary="Name" secondary={user?.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Email" secondary={user?.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Role" secondary={user?.role} />
                  </ListItem>
                  {user?.specialist && (
                    <ListItem>
                      <ListItemText primary="Specialist" secondary={user?.specialist} />
                    </ListItem>
                  )}
                  {user?.phone && (
                    <ListItem>
                      <ListItemText primary="Phone" secondary={user?.phone} />
                    </ListItem>
                  )}
                  {user?.address && (
                    <ListItem>
                      <ListItemText primary="Address" secondary={user?.address} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleEditOpen}>
                  Edit Profile
                </Button>
              </CardActions>
            </Card>
          </Grid>
          {/* Upcoming Appointments Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Upcoming Appointments</Typography>
                </Box>
                {upcomingAppointments.length > 0 ? (
                  <List>
                    {upcomingAppointments.map((appointment) => (
                      <React.Fragment key={appointment._id}>
                        <ListItem>
                          <ListItemText
                            primary={ <b>Patient: {getAppointmentMainName(appointment)}</b>}
                            secondary={
                              <> Appointment Date : 
                                 {format(new Date(appointment.date), ' MMM dd, yyyy')} at {appointment.time}
                                <br /> 
                                Reason: {appointment.reason}
                                {appointment.notes && (
                                  <>
                                    <br />
                                  Additional Notes: {appointment.notes}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming appointments
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button variant="contained" onClick={fetchMyAppointments}>
                      View My Appointments
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* My Appointments Dialog */}
      <Dialog open={appointmentsOpen} onClose={() => setAppointmentsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          My Appointments
          <IconButton
            aria-label="close"
            onClick={() => setAppointmentsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {myAppointments.length > 0 ? (
            <List>
              {myAppointments.map((app) => (
                <ListItem key={app._id} alignItems="flex-start">
                  <ListItemText
                    primary={`Patient: ${app.patient?.name || app.patient}`}
                    secondary={
                      <>
                        {format(new Date(app.date), 'MMM dd, yyyy')} at {app.time}
                        <br />
                        Reason: {app.reason}
                        <br />
                        Status: {app.status === 'completed' ? 'accepted' : app.status}
                      </>
                    }
                  />
                  {app.status === 'scheduled' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(app._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(app._id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No appointments found.</Typography>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Edit Profile
          <IconButton
            aria-label="close"
            onClick={handleEditClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
            {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}
            <Typography variant="body2" sx={{ mb: 1 }}>Email: {user?.email}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Role: {user?.role}</Typography>
            <Box sx={{ mb: 2 }}>
              <label>Specialist</label>
              <input
                name="specialist"
                value={editData.specialist}
                onChange={handleEditChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <label>Name</label>
              <input
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <label>Phone</label>
              <input
                name="phone"
                value={editData.phone}
                onChange={handleEditChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <label>Address</label>
              <input
                name="address"
                value={editData.address}
                onChange={handleEditChange}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;