import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/Appointments.css';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editData, setEditData] = useState({
    reason: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const config = {
      headers: {
        'x-auth-token': token,
      },
    };
    const fetchAppointments = async () => {
      try {
        // First get the default doctors list
        const defaultDoctorsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/doctors`);
        const defaultDoctors = defaultDoctorsRes.data;
        
        // Then get appointments
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments`, config);
        
        // Process appointments to include correct doctor information
        const processedAppointments = res.data.map(appointment => {
          if (appointment.doctor && typeof appointment.doctor === 'string' && appointment.doctor.startsWith('default')) {
            // This is a default doctor - find their info
            const defaultDoctor = defaultDoctors.find(d => d._id === appointment.doctor);
            if (defaultDoctor) {
              return {
                ...appointment,
                doctor: {
                  _id: defaultDoctor._id,
                  name: defaultDoctor.name,
                  specialist: defaultDoctor.specialist
                }
              };
            }
          }
          return appointment;
        });
        
        setAppointments(processedAppointments);
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };
    fetchAppointments();
  }, [navigate]);

  const handleDelete = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/appointments/${appointmentId}`, config);
      setAppointments(appointments.filter((app) => app._id !== appointmentId));
      setDeleteDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError('Failed to delete appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment._id);
    setEditData({
      reason: appointment.reason,
      date: format(new Date(appointment.date), 'yyyy-MM-dd'),
      time: appointment.time
    });
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditData({ reason: '', date: '', time: '' });
  };

  const handleSaveEdit = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      await axios.put(`${process.env.REACT_APP_API_URL}/api/appointments/${appointmentId}`,
        editData,
        config
      );

      // Update the appointments list
      setAppointments(appointments.map(app => 
        app._id === appointmentId
          ? { ...app, ...editData }
          : app
      ));

      setEditingAppointment(null);
      setEditData({ reason: '', date: '', time: '' });
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" className="appointments-container">
      <Box className="appointments-box">
        <Typography variant="h4" gutterBottom className="appointments-title">
          My Appointments
        </Typography>
        {error && (
          <Alert severity="error" className="appointments-alert">
            {error}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/book-appointment')}
          className="appointments-new-button"
        >
          Book New Appointment
        </Button>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialist Type</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Additional Notes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    {editingAppointment === appointment._id ? (
                      <TextField
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        size="small"
                      />
                    ) : (
                      format(new Date(appointment.date), 'MMM dd, yyyy')
                    )}
                  </TableCell>
                  <TableCell>
                    {editingAppointment === appointment._id ? (
                      <TextField
                        select
                        value={editData.time}
                        onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'].map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      appointment.time
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {appointment.doctor?.name || 'Unknown Doctor'}
                  </TableCell>
                  <TableCell>
                    {appointment.doctor?.specialist || 'General'}
                  </TableCell>
                  <TableCell>
                    {editingAppointment === appointment._id ? (
                      <TextField
                        value={editData.reason}
                        onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      appointment.reason
                    )}
                  </TableCell>
                  <TableCell>
                    {appointment.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getStatusColor(appointment.status)}
                      size="small"
                      disabled
                      sx={{ minWidth: '100px' }}
                    >
                      {appointment.status}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {editingAppointment === appointment._id ? (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleSaveEdit(appointment._id)}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={handleCancelEdit}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this appointment?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleDelete(selectedAppointment._id)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments; 