import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';

// Users Management Component - For managing system users
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(storedUser);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, filterType]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('access');
            let url = 'http://127.0.0.1:8000/api/admin/users/';
            
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterType !== 'all') params.append('type', filterType);
            
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
                setUsers(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/toggle_active/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                fetchUsers(); // Refresh the list
                alert('User status updated successfully!');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Error updating user status');
        }
    };

    const handleMakeStaff = async (userId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/make_staff/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                fetchUsers(); // Refresh the list
                alert('User made staff successfully!');
            }
        } catch (error) {
            console.error('Error making user staff:', error);
            alert('Error making user staff');
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setSelectedUser(userData);
                setShowUserDetail(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // Remove staff privileges from a user
    const handleRemoveStaff = async (userId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/remove_staff/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                fetchUsers(); // Refresh the list
                alert('User staff status removed successfully!');
            }
        } catch (error) {
            console.error('Error removing staff status:', error);
            alert('Error removing staff status');
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Users Management</h2>
                <p>Manage all registered users and their permissions</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="controls-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Users</option>
                        <option value="hosts">Hosts Only</option>
                        <option value="guests">Guests Only</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Listings</th>
                            <th>Bookings</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {user.profile_image ? (
                                            <img 
                                                src={`http://127.0.0.1:8000${user.profile_image}`} 
                                                alt={user.full_name} 
                                                className="admin-avatar" 
                                            />
                                        ) : (
                                            <div className="no-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999', marginRight: '8px' }}>
                                                {user.full_name?.charAt(0)}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong>{user.full_name}</strong>
                                            {user.is_staff && (
                                                <span className="badge staff-badge">Staff</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.is_host ? 'host-badge' : 'guest-badge'}`}>
                                        {user.is_host ? 'Host' : 'Guest'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{user.total_listings}</td>
                                <td>{user.total_bookings}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleViewUser(user.id)}
                                            className="btn btn-info"
                                            title="View Details"
                                        >
                                            VIEW
                                        </button>
                                        <button 
                                            onClick={() => handleToggleActive(user.id)}
                                            className={`btn ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                                            title={user.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {user.is_active ? 'OFF' : 'ON'}
                                        </button>
                                        {currentUser?.is_superuser && (
                                            user.is_staff ? (
                                                <button 
                                                    onClick={() => handleRemoveStaff(user.id)}
                                                    className="btn btn-danger"
                                                    title="Remove Staff"
                                                >
                                                    UNSTAFF
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleMakeStaff(user.id)}
                                                    className="btn btn-primary"
                                                    title="Make Staff"
                                                >
                                                    STAFF
                                                </button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Detail Modal */}
            {showUserDetail && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowUserDetail(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button 
                                onClick={() => setShowUserDetail(false)}
                                className="close-btn"
                            >
                                    X
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                {selectedUser.profile_image ? (
                                    <img 
                                        src={`http://127.0.0.1:8000${selectedUser.profile_image}`} 
                                        alt={selectedUser.full_name} 
                                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0f0f0' }} 
                                    />
                                ) : (
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#999' }}>
                                        {selectedUser.full_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="user-detail-grid">
                                <div className="detail-item">
                                    <label>Full Name:</label>
                                    <span>{selectedUser.full_name}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Email:</label>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Username:</label>
                                    <span>{selectedUser.username}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phone:</label>
                                    <span>{selectedUser.phone_number || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Address:</label>
                                    <span>{selectedUser.address || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>User Type:</label>
                                    <span className={`badge ${selectedUser.is_host ? 'host-badge' : 'guest-badge'}`}>
                                        {selectedUser.is_host ? 'Host' : 'Guest'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Host Application Status:</label>
                                    <span className="badge">
                                        {selectedUser.host_application_status}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Account Status:</label>
                                    <span className={`status-badge ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Staff Status:</label>
                                    <span className={`badge ${selectedUser.is_staff ? 'staff-badge' : 'guest-badge'}`}>
                                        {selectedUser.is_staff ? 'Staff' : 'Regular User'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Joined Date:</label>
                                    <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Last Login:</label>
                                    <span>
                                        {selectedUser.last_login_at 
                                            ? new Date(selectedUser.last_login_at).toLocaleDateString()
                                            : 'Never logged in'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {users.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No users found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
