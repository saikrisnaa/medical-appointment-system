const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const userRouter = require('./users');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// @route   POST api/appointments
// @desc    Create an appointment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('doctor', 'Doctor is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('time', 'Time is required').not().isEmpty(),
      check('reason', 'Reason is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { doctor, date, time, reason, notes } = req.body;

      // Allow booking with default doctors (skip DB check)
      if (!doctor.startsWith('default')) {
        // Check if doctor exists in DB
        const doctorExists = await User.findById(doctor);
        if (!doctorExists || doctorExists.role !== 'doctor') {
          return res.status(400).json({ msg: 'Doctor not found' });
        }
      }

      // Check for existing appointment at the same time (optional for default doctors)
      const existingAppointment = await Appointment.findOne({
        doctor,
        date,
        time,
        status: 'scheduled',
      });

      if (existingAppointment) {
        return res.status(400).json({ msg: 'Time slot already booked' });
      }

      const newAppointment = new Appointment({
        patient: req.user.id,
        doctor,
        date,
        time,
        reason,
        notes,
      });

      const appointment = await newAppointment.save();
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/appointments
// @desc    Get all appointments for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let appointments = await Appointment.find({
      $or: [{ patient: req.user.id }, { doctor: req.user.id }],
    })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'name email specialist',
        match: { _id: { $exists: true } }
      })
      .sort({ date: -1 });

    // Get default doctors
    const defaultDoctors = userRouter.defaultDoctors;

    // Process appointments to handle default and real doctors
    const processedAppointments = await Promise.all(appointments.map(async app => {
      const appointment = app.toObject();
      // Default doctor
      if (typeof appointment.doctor === 'string' && appointment.doctor.startsWith('default')) {
        const defaultDoctor = defaultDoctors.find(d => d._id === appointment.doctor);
        if (defaultDoctor) {
          appointment.doctor = {
            _id: defaultDoctor._id,
            name: defaultDoctor.name,
            specialist: defaultDoctor.specialist
          };
        }
      }
      // Real doctor but not populated
      else if (typeof appointment.doctor === 'string') {
        // Try to fetch from DB
        const dbDoctor = await User.findById(appointment.doctor).select('name specialist');
        if (dbDoctor) {
          appointment.doctor = {
            _id: dbDoctor._id,
            name: dbDoctor.name,
            specialist: dbDoctor.specialist
          };
        }
      }
      return appointment;
    }));

    res.json(processedAppointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/appointments/:id
// @desc    Update an appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if user is authorized to update the appointment
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/appointments/:id
// @desc    Delete an appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Debug logging for authorization
    console.log('Delete attempt:', {
      patient: appointment.patient,
      doctor: appointment.doctor,
      user: req.user.id
    });

    // Check if user is authorized to delete the appointment
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await appointment.deleteOne();
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/appointments/available-times
// @desc    Get available time slots for a doctor on a date
// @access  Public
router.get('/available-times', async (req, res) => {
  // For now, return the same slots for all doctors
  return res.json([
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'
  ]);
});

// @route   GET api/appointments/upcoming
// @desc    Get upcoming appointments for the logged-in user
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    let appointments = await Appointment.find({
      $or: [{ patient: req.user.id }, { doctor: req.user.id }],
      date: { $gte: now },
      status: 'scheduled',
    })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        select: 'name email specialist',
        match: { _id: { $exists: true } }
      })
      .sort({ date: 1 });

    // Get default doctors
    const defaultDoctors = userRouter.defaultDoctors;

    // Process appointments to handle default and real doctors
    const processedAppointments = await Promise.all(appointments.map(async app => {
      const appointment = app.toObject();
      // Default doctor
      if (typeof appointment.doctor === 'string' && appointment.doctor.startsWith('default')) {
        const defaultDoctor = defaultDoctors.find(d => d._id === appointment.doctor);
        if (defaultDoctor) {
          appointment.doctor = {
            _id: defaultDoctor._id,
            name: defaultDoctor.name,
            specialist: defaultDoctor.specialist
          };
        }
      }
      // Real doctor but not populated
      else if (typeof appointment.doctor === 'string') {
        // Try to fetch from DB
        const dbDoctor = await User.findById(appointment.doctor).select('name specialist');
        if (dbDoctor) {
          appointment.doctor = {
            _id: dbDoctor._id,
            name: dbDoctor.name,
            specialist: dbDoctor.specialist
          };
        }
      }
      return appointment;
    }));

    res.json(processedAppointments);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router; 