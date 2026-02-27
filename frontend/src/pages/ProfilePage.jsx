import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreateListingModal from '../components/CreateListingModal';
import '../styles/profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        refreshUserData();
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const refreshUserData = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const latestUser = await response.json();
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

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
            
            {!user.is_host && (
              <div className="detail-item">
                <label>Host Status</label>
                <span className={`status-badge status-${user.host_application_status || 'none'}`}>
                  {user.host_application_status === 'pending' ? 'Pending' : 
                   user.host_application_status === 'approved' ? 'Approved' :
                   user.host_application_status === 'rejected' ? 'Rejected' :
                   'Not Applied'}
                </span>
              </div>
            )}

            <div className="detail-item">
              <label>Status</label>
              <span className="status-badge active">Active</span>
            </div>
          </div>

          <button className="edit-profile-btn">Edit Profile</button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
