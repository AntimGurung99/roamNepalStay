import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import UsersManagement from '../components/admin/UsersManagement';
import HostApplicationsManagement from '../components/admin/HostApplicationsManagement';

import ListingsManagement from '../components/admin/ListingsManagement';

// Admin Dashboard - Main admin panel
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // ACCESS CONTROL LOGIC:
        // We check if the logged-in user has staff or superuser flags.
        // If not, they are redirected back to the home page for safety.
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.is_staff && !storedUser.is_superuser) {
            console.warn("Access denied: User is not staff. Redirecting to home.");
            navigate('/');
            return;
        }
        setUser(storedUser);
        fetchDashboardStats();
    }, [navigate]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard/stats/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                setError('Failed to fetch dashboard statistics. Please check your connection.');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Connection error. Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading admin tools...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-page">
                <div className="error-card">
                    <h1>Oops! Something went wrong</h1>
                    <p>{error}</p>
                    <button onClick={fetchDashboardStats} className="btn-retry">Retry Loading</button>
                    <button onClick={() => navigate('/')} className="btn-back">Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Admin Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-logo">Roam Nepal Stay</div>
                    <h1>Admin Panel</h1>
                    <div className="admin-user-info">
                        <span>Welcome, <strong>{user?.first_name || 'Admin'}</strong></span>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                navigate('/');
                            }}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <nav className="admin-navbar">
                <ul className="admin-nav-list">
                    <li className={activeTab === 'dashboard' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('dashboard')}>
                            DASHBOARD
                        </button>
                    </li>
                    <li className={activeTab === 'users' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('users')}>
                            USERS
                        </button>
                    </li>
                    <li className={activeTab === 'host-applications' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('host-applications')}>
                            HOST APPLICATIONS
                            {stats?.pending_host_applications > 0 && (
                                <span className="notification-badge">
                                    {stats.pending_host_applications}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className={activeTab === 'listings' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('listings')}>
                            LISTINGS
                            {stats?.pending_listings > 0 && (
                                <span className="notification-badge">
                                    {stats.pending_listings}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className={activeTab === 'bookings' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('bookings')}>
                            BOOKINGS
                        </button>
                    </li>
                    <li className={activeTab === 'reviews' ? 'active' : ''}>
                        <button onClick={() => setActiveTab('reviews')}>
                            REVIEWS
                        </button>
                    </li>

                </ul>
            </nav>
            <div className="admin-container">
                {/* Main Content Area */}
                <main className="admin-main-content">
                    {activeTab === 'dashboard' && (
                        <DashboardOverview stats={stats} />
                    )}
                    {activeTab === 'users' && (
                        <UsersManagement />
                    )}
                    {activeTab === 'host-applications' && (
                        <HostApplicationsManagement />
                    )}
                    {activeTab === 'listings' && (
                        <ListingsManagement />
                    )}
                    {activeTab === 'bookings' && (
                        <BookingsManagement />
                    )}
                    {activeTab === 'reviews' && (
                        <ReviewsManagement />
                    )}

                </main>
            </div>
        </div>
    );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats }) => {
    if (!stats) return <div>Loading stats...</div>;

    return (
        <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_users}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_hosts}</h3>
                        <p>Total Hosts</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_listings}</h3>
                        <p>Total Listings</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_bookings}</h3>
                        <p>Total Bookings</p>
                    </div>
                </div>
                
                <div className="stat-card highlight">
                    <div className="stat-info">
                        <h3>Rs. {stats.total_revenue}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                
                <div className="stat-card warning">
                    <div className="stat-info">
                        <h3>{stats.pending_host_applications}</h3>
                        <p>Pending Applications</p>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="recent-activities">
                <div className="recent-section">
                    <h3>Recent Bookings</h3>
                    <div className="recent-list">
                        {stats.recent_bookings?.map(booking => (
                            <div key={booking.id} className="recent-item">
                                {booking.listing_image ? (
                                    <img src={`http://127.0.0.1:8000${booking.listing_image}`} className="admin-listing-img" style={{ width: '50px', height: '35px', marginRight: '10px' }} />
                                ) : (
                                    <div style={{ width: '50px', height: '35px', background: '#eee', borderRadius: '4px', marginRight: '10px' }}></div>
                                )}
                                <div className="recent-info">
                                    <strong>{booking.guest_name}</strong>
                                    <span>{booking.listing_title}</span>
                                    <small>{new Date(booking.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="recent-amount">
                                    Rs. {booking.total_amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recent-section">
                    <h3>Recent Reviews</h3>
                    <div className="recent-list">
                        {stats.recent_reviews?.map(review => (
                            <div key={review.id} className="recent-item">
                                {review.reviewer_image ? (
                                    <img src={`http://127.0.0.1:8000${review.reviewer_image}`} className="admin-avatar" style={{ width: '35px', height: '35px', marginRight: '10px' }} />
                                ) : (
                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#eee', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{review.reviewer_name?.charAt(0)}</div>
                                )}
                                <div className="recent-info">
                                    <strong>{review.reviewer_name}</strong>
                                    <span>{review.listing_title}</span>
                                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="recent-rating">
                                    Rating: {review.rating}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Placeholder components
const BookingsManagement = () => <div>Bookings Management Component</div>;
const ReviewsManagement = () => <div>Reviews Management Component</div>;

export default AdminDashboard;
