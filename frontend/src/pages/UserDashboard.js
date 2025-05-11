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
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const UserDashboard = ({ user, setUser, defaultDoctors }) => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [error, setError] = useState('');
  const [doctorsOpen, setDoctorsOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [pastOpen, setPastOpen] = useState(false);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '' });
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
        });
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };
    if (user) fetchData();
  }, [user]);

  const getDoctorName = useCallback(
    (doctor) => {
      if (doctor && typeof doctor === 'object' && doctor.name) return doctor.name;
      if (typeof doctor === 'string' && doctor.startsWith('default')) {
        const found = defaultDoctors.find((d) => d._id === doctor);
        return found ? found.name : 'Unknown Doctor';
      }
      return 'Unknown Doctor';
    },
    [defaultDoctors]
  );

  const handleShowDoctors = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/doctors`, config);
      setDoctors(res.data);
      setDoctorsOpen(true);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const handleShowPast = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments`, config);
      const now = new Date();
      const past = res.data.filter((app) => new Date(app.date) < now);
      setPastAppointments(past);
      setPastOpen(true);
    } catch (err) {
      setError('Failed to fetch past appointments');
    }
  };

  const handleEditOpen = () => {
    setEditError('');
    setEditSuccess('');
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
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
          User Dashboard
        </Typography>
        {error && <Alert severity="error" className="dashboard-alert">{error}</Alert>}
        <Grid container spacing={3}>
          {/* User Profile Card */}
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
                            primary={getDoctorName(appointment.doctor)}
                            secondary={
                              <>
                                {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                                <br />
                                Reason: {appointment.reason}
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
                <CardActions>
                  <Button size="small" onClick={() => navigate('/appointments')}>
                    View All Appointments
                  </Button>
                  <Button size="small" onClick={() => navigate('/book-appointment')}>
                    Book New Appointment
                  </Button>
                </CardActions>
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
                    <Button variant="contained" onClick={handleShowDoctors}>
                      Doctors
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={handleShowPast}>
                      Past Appointments
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* Doctors Dialog */}
      <Dialog open={doctorsOpen} onClose={() => setDoctorsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Available Doctors
          <IconButton
            aria-label="close"
            onClick={() => setDoctorsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {doctors.length > 0 ? (
            <List>
              {doctors.map((doc) => (
                <ListItem key={doc._id}>
                  <ListItemText
                    primary={doc.name}
                    secondary={doc.specialist ? `Specialist: ${doc.specialist}` : ''}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No doctors available.</Typography>
          )}
        </DialogContent>
      </Dialog>
      {/* Past Appointments Dialog */}
      <Dialog open={pastOpen} onClose={() => setPastOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Past Appointments
          <IconButton
            aria-label="close"
            onClick={() => setPastOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {pastAppointments.length > 0 ? (
            <List>
              {pastAppointments.map((app) => (
                <ListItem key={app._id}>
                  <ListItemText
                    primary={`Dr. ${app.doctor?.name || app.doctor}`}
                    secondary={
                      <>
                        {format(new Date(app.date), 'MMM dd, yyyy')} at {app.time}
                        <br />
                        Reason: {app.reason}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No past appointments.</Typography>
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

export default UserDashboard;