import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="profile-container">
      <Navbar />
      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <h1>{user.first_name} {user.last_name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <label>Account Type</label>
              <span>{user.is_host ? 'Host' : 'Guest'}</span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span className="status-badge">Active</span>
            </div>
          </div>

          <button className="edit-profile-btn">Edit Profile</button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
