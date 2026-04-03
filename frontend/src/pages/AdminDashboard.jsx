import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import UsersManagement from '../components/admin/UsersManagement';
import HostApplicationsManagement from '../components/admin/HostApplicationsManagement';
import ListingsManagement from '../components/admin/ListingsManagement';
import BookingsManagement from '../components/admin/BookingsManagement';
import ReviewsManagement from '../components/admin/ReviewsManagement';
import AdminCharts from '../components/admin/AdminCharts';
import PlatformSettingsManagement from '../components/admin/PlatformSettingsManagement';

// Admin Dashboard - Main admin panel with premium aesthetics
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Access Control
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.is_staff && !storedUser.is_superuser) {
            console.warn("Access denied. Redirecting.");
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
                setError('Failed to fetch dashboard statistics. Authentication or Server Error.');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Connection error. Could not reach backend.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Establishing secure admin session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-page">
                <div className="error-card">
                    <h1>System Error</h1>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={fetchDashboardStats} className="btn-retry">Try Again</button>
                        <button onClick={() => navigate('/')} className="btn-back">Home Page</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header with improved glassmorphism feel */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-header-left">
                        {/* Hidden or removed logo as requested */}
                    </div>
                    <h1>ADMIN PANEL</h1>
                    <div className="admin-user-info">
                        <span className="welcome-text">Hi, <strong>{user?.first_name || 'Admin'}</strong></span>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Sticky Navigation with Horizontal Scroll Support */}
            <nav className="admin-navbar">
                <div className="navbar-scroll-container">
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
                                APPLICATIONS
                                {stats?.pending_host_applications > 0 && (
                                    <span className="notification-badge">{stats.pending_host_applications}</span>
                                )}
                            </button>
                        </li>
                        <li className={activeTab === 'listings' ? 'active' : ''}>
                            <button onClick={() => setActiveTab('listings')}>
                                LISTINGS
                                {stats?.pending_listings > 0 && (
                                    <span className="notification-badge">{stats.pending_listings}</span>
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
                        {user?.is_superuser && (
                            <li className={activeTab === 'settings' ? 'active' : ''}>
                             <button onClick={() => setActiveTab('settings')}>
                                        SETTINGS
                            </button>
                          </li>
                        )}
                    </ul>
                </div>
            </nav>

            <div className="admin-container">
                <main className="admin-main-content">
                    {activeTab === 'dashboard' && <DashboardOverview stats={stats} />}
                    {activeTab === 'users' && <UsersManagement />}
                    {activeTab === 'host-applications' && <HostApplicationsManagement />}
                    {activeTab === 'listings' && <ListingsManagement />}
                    {activeTab === 'bookings' && <BookingsManagement />}
                    {activeTab === 'reviews' && <ReviewsManagement />}
                    {activeTab === 'settings' && user?.is_superuser && <PlatformSettingsManagement />}
                </main>
            </div>
        </div>
    );
};

// Enhanced Dashboard Overview Component
const DashboardOverview = ({ stats }) => {
    if (!stats) return <div className="loading-stats">Refreshing stats...</div>;

    return (
        <div className="dashboard-overview animate-fade-in">
            <div className="section-header">
                <h2>System Overview</h2>
                <p>Real-time analytics across RoamNepalStay ecosystem</p>
            </div>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_users}</h3>
                        <p>Total Community</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_hosts}</h3>
                        <p>Active Hosts</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_listings}</h3>
                        <p>Total Properties</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.total_bookings}</h3>
                        <p>Total Stay Reservations</p>
                    </div>
                </div>
                
                <div className="stat-card highlight">
                    <div className="stat-info">
                        <h3>Rs. {Number(stats.total_revenue).toLocaleString()}</h3>
                        <p>Gross Platform Revenue</p>
                    </div>
                </div>
                
                <div className="stat-card warning">
                    <div className="stat-info">
                        <h3>{stats.pending_host_applications}</h3>
                        <p>Pending Verifications</p>
                    </div>
                </div>
            </div>

            <AdminCharts stats={stats} />
            
            <div className="recent-activities">
                <div className="recent-section card-elevated">
                    <h3>Latest Bookings</h3>
                    <div className="recent-list">
                        {stats.recent_bookings?.map(booking => (
                            <div key={booking.id} className="recent-item hover-effect">
                                {booking.listing_image ? (
                                    <img src={`http://127.0.0.1:8000${booking.listing_image}`} className="admin-listing-img" alt="Property" />
                                ) : (
                                    <div className="placeholder-img"></div>
                                )}
                                <div className="recent-info">
                                    <strong>{booking.guest_name}</strong>
                                    <span>{booking.listing_title}</span>
                                    <small>{new Date(booking.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="recent-amount">Rs. {booking.total_amount}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recent-section card-elevated">
                    <h3>Recent Feedback</h3>
                    <div className="recent-list">
                        {stats.recent_reviews?.map(review => (
                            <div key={review.id} className="recent-item hover-effect">
                                <div className="avatar-small">{review.reviewer_name?.charAt(0)}</div>
                                <div className="recent-info">
                                    <strong>{review.reviewer_name}</strong>
                                    <span>{review.listing_title}</span>
                                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="recent-rating">⭐ {review.rating}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
