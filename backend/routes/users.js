const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Default doctors to show if DB is empty
const defaultDoctors = [
  {
    _id: 'default1',
    name: 'Dr. John Smith',
    email: 'john.smith@hospital.com',
    role: 'doctor',
    phone: '1234567890',
    address: '123 Main St, City',
    specialist: 'Cardiologist',
  },
  {
    _id: 'default2',
    name: 'Dr. Emily Brown',
    email: 'emily.brown@hospital.com',
    role: 'doctor',
    phone: '9876543210',
    address: '456 Elm St, City',
    specialist: 'Dermatologist',
  },
  {
    _id: 'default3',
    name: 'Dr. Alex Green',
    email: 'alex.green@hospital.com',
    role: 'doctor',
    phone: '5551234567',
    address: '789 Oak St, City',
    specialist: 'Pediatrician',
  },
];

// Make defaultDoctors available to other modules
router.defaultDoctors = defaultDoctors;

// @route   GET /api/users/specialists
// @desc    Get all unique specialists (from DB and defaults)
// @access  Public
router.get('/specialists', async (req, res) => {
  const dbSpecialists = await User.distinct('specialist', { role: 'doctor' });
  const defaultSpecialists = defaultDoctors.map(doc => doc.specialist);
  const allSpecialists = Array.from(new Set([...dbSpecialists, ...defaultSpecialists]));
  res.json(allSpecialists);
});

// @route   GET /api/users/doctors
// @desc    Get all doctors, or default doctors if none exist, filter by specialist if provided
// @access  Public
router.get('/doctors', async (req, res) => {
  const { specialist } = req.query;
  let query = { role: 'doctor' };
  if (specialist) query.specialist = specialist;
  let dbDoctors = await User.find(query).select('-password');
  let allDefaultDoctors = defaultDoctors;
  if (specialist) {
    allDefaultDoctors = defaultDoctors.filter(doc => doc.specialist === specialist);
  }
  // Combine DB and default doctors
  const doctors = [
    ...dbDoctors,
    ...allDefaultDoctors
  ];
  res.json(doctors);
});

module.exports = router; 