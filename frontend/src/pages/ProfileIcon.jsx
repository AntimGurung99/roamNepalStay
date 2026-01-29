import React, { useState, useEffect } from 'react';

const ProfileIcon = () => {
  const [user, setUser] = useState(null);

  // On page load, check if user info exists in localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="profile-icon">
      {user ? (
        <div>
          <p>Welcome, {user.first_name} {user.last_name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};

const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  window.location.href = '/login'; // Redirect to login page after logout
};

export default ProfileIcon;
