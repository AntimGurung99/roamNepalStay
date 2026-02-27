import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: 'roamnepalstay@gmail.com',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store tokens and user data
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Check if user is admin
                if (data.user.is_staff || data.user.is_superuser) {
                    navigate('/admin');
                } else {
                    setError('Access denied. Admin privileges required.');
                }
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <h1>🔐 Admin Login</h1>
                    <p>RoamNepalStay Admin Panel Access</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter admin email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login to Admin Panel'}
                    </button>

                    <div className="admin-credentials">
                        <h4>Super Admin Credentials:</h4>
                        <p><strong>Email:</strong> roamnepalstay@gmail.com</p>
                        <p><strong>Password:</strong> admin123</p>
                    </div>

                    <div className="back-to-home">
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="back-btn"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
