import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';

// Bookings Management Component - For managing system bookings
const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBookings();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [statusFilter, searchTerm]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            let url = 'http://127.0.0.1:8000/api/admin/bookings/';
            
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setBookings(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'paid': return 'status-published';
            case 'completed': return 'status-approved';
            case 'cancelled': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Bookings Management</h2>
                <p>View and monitor all stay reservations</p>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by guest or property name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending Payment</option>
                        <option value="paid">Paid/Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Property</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>
                                    <div className="user-info">
                                        <strong>{booking.guest_name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="listing-info">
                                        <strong>{booking.listing_title}</strong>
                                        <small>{booking.listing_city}</small>
                                    </div>
                                </td>
                                <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                                <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                                <td>Rs. {booking.total_amount}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${booking.payment_status === 'paid' ? 'host-badge' : 'guest-badge'}`}>
                                        {booking.payment_status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-info">DETAILS</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {bookings.length === 0 && (
                <div className="empty-state">
                    <p>No bookings found.</p>
                </div>
            )}
        </div>
    );
};

export default BookingsManagement;
