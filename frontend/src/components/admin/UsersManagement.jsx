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
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterType]);

    const isSuperAdminUser = (user) => {
        return (
            user?.is_superuser === true ||
            user?.email === 'naruto@gmail.com' ||
            user?.username === 'naruto'
        );
    };

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
                fetchUsers();
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
                fetchUsers();
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
                fetchUsers();
                alert('User staff status removed successfully!');
            }
        } catch (error) {
            console.error('Error removing staff status:', error);
            alert('Error removing staff status');
        }
    };

    const getUserTypeLabel = (user) => {
        if (isSuperAdminUser(user)) return 'SUPERADMIN';
        return user.is_host ? 'HOST' : 'GUEST';
    };

    const getUserTypeBadgeClass = (user) => {
        if (isSuperAdminUser(user)) return 'superadmin-badge';
        return user.is_host ? 'host-badge' : 'guest-badge';
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
                        {users.map(user => {
                            const isSuperAdmin = isSuperAdminUser(user);

                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div
                                            className="user-info"
                                            style={{ flexDirection: 'row', alignItems: 'center' }}
                                        >
                                            {user.profile_image ? (
                                                <img
                                                    src={`http://127.0.0.1:8000${user.profile_image}`}
                                                    alt={user.full_name}
                                                    className="admin-avatar"
                                                />
                                            ) : (
                                                <div
                                                    className="no-avatar"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#eee',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        color: '#999',
                                                        marginRight: '8px'
                                                    }}
                                                >
                                                    {user.full_name?.charAt(0)}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{user.full_name}</strong>

                                                {isSuperAdmin ? (
                                                    <span className="badge superadmin-badge">SUPERADMIN</span>
                                                ) : user.is_staff ? (
                                                    <span className="badge staff-badge">STAFF</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </td>

                                    <td>{user.email}</td>

                                    <td>
                                        <span className={`badge ${getUserTypeBadgeClass(user)}`}>
                                            {getUserTypeLabel(user)}
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

                                            {!isSuperAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleActive(user.id)}
                                                        className={`btn ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.is_active ? 'Deactive' : 'Active'}
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
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showUserDetail && selectedUser && (
                <div className="user-details-overlay" onClick={() => setShowUserDetail(false)}>
                    <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-details-header">
                            <div>
                                <h2>User Details</h2>
                                <p>View complete user profile information</p>
                            </div>

                            <button
                                onClick={() => setShowUserDetail(false)}
                                className="user-details-close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="user-details-body">
                            <div className="user-profile-top">
                                {selectedUser.profile_image ? (
                                    <img
                                        src={`http://127.0.0.1:8000${selectedUser.profile_image}`}
                                        alt={selectedUser.full_name}
                                        className="user-details-avatar"
                                    />
                                ) : (
                                    <div className="user-details-avatar placeholder-avatar">
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                )}

                                <div className="user-profile-meta">
                                    <h3>{selectedUser.full_name}</h3>
                                    <p>{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="user-section-card">
                                <h3>Basic Information</h3>
                                <div className="user-details-grid-clean">
                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Full Name</span>
                                        <span className="user-detail-value-clean">{selectedUser.full_name || 'N/A'}</span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Email</span>
                                        <span className="user-detail-value-clean">{selectedUser.email || 'N/A'}</span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Username</span>
                                        <span className="user-detail-value-clean">{selectedUser.username || 'N/A'}</span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Phone</span>
                                        <span className="user-detail-value-clean">{selectedUser.phone_number || 'Not provided'}</span>
                                    </div>

                                    <div className="user-detail-card-clean full-width">
                                        <span className="user-detail-label-clean">Address</span>
                                        <span className="user-detail-value-clean">{selectedUser.address || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-section-card">
                                <h3>Account Information</h3>
                                <div className="user-details-grid-clean">
                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">User Type</span>
                                        <span className={`badge ${getUserTypeBadgeClass(selectedUser)}`}>
                                            {getUserTypeLabel(selectedUser)}
                                        </span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Host Application Status</span>
                                        <span className="badge">
                                            {selectedUser.host_application_status || 'NONE'}
                                        </span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Account Status</span>
                                        <span className={`status-badge ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                                            {selectedUser.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Staff Status</span>
                                        <span
                                            className={`badge ${
                                                isSuperAdminUser(selectedUser)
                                                    ? 'superadmin-badge'
                                                    : selectedUser.is_staff
                                                    ? 'staff-badge'
                                                    : 'guest-badge'
                                            }`}
                                        >
                                            {isSuperAdminUser(selectedUser)
                                                ? 'Superadmin'
                                                : selectedUser.is_staff
                                                ? 'Staff'
                                                : 'Regular User'}
                                        </span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Joined Date</span>
                                        <span className="user-detail-value-clean">
                                            {selectedUser.created_at
                                                ? new Date(selectedUser.created_at).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="user-detail-card-clean">
                                        <span className="user-detail-label-clean">Last Login</span>
                                        <span className="user-detail-value-clean">
                                            {selectedUser.last_login_at
                                                ? new Date(selectedUser.last_login_at).toLocaleDateString()
                                                : 'Never logged in'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {users.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No users found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

// today added: Memoizing component to prevent performance bottlenecks
export default React.memo(UsersManagement);