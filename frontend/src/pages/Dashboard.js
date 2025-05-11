import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserDashboard from './UserDashboard';
import DoctorDashboard from './DoctorDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [defaultDoctors, setDefaultDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const config = { headers: { 'x-auth-token': token } };
    const fetchData = async () => {
      try {
        const [userRes, doctorsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/users/doctors`),
        ]);
        setUser(userRes.data);
        setDefaultDoctors(doctorsRes.data.filter((doc) => doc._id && doc._id.startsWith('default')));
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return user?.role === 'doctor' ? (
    <DoctorDashboard user={user} setUser={setUser} defaultDoctors={defaultDoctors} />
  ) : (
    <UserDashboard user={user} setUser={setUser} defaultDoctors={defaultDoctors} />
  );
};

export default Dashboard;