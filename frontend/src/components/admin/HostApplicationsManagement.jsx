import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';

// Host Applications Management - For managing user host applications
const HostApplicationsManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showApplicationDetail, setShowApplicationDetail] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('access');
            let url = 'http://127.0.0.1:8000/api/admin/host-applications/';
            
            if (statusFilter !== 'all') {
                url += `?status=${statusFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setApplications(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = async (applicationId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const applicationData = await response.json();
                setSelectedApplication(applicationData);
                setShowApplicationDetail(true);
                setReviewNotes('');
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
        }
    };

    const handleApproveApplication = async (applicationId) => {
        if (!reviewNotes.trim()) {
            alert('Please write review notes');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/approve/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notes: reviewNotes
                })
            });
            
            if (response.ok) {
                alert('Host application approved successfully!');
                setShowApplicationDetail(false);
                fetchApplications(); // Refresh the list
            } else {
                alert('Error approving application');
            }
        } catch (error) {
            console.error('Error approving application:', error);
            alert('Error approving application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectApplication = async (applicationId) => {
        if (!reviewNotes.trim()) {
            alert('Please write rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/reject/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notes: reviewNotes
                })
            });
            
            if (response.ok) {
                alert('Host application rejected successfully!');
                setShowApplicationDetail(false);
                fetchApplications(); // Refresh the list
            } else {
                alert('Error rejecting application');
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
            alert('Error rejecting application');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading host applications...</p>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Host Applications Management</h2>
                <p>Review and manage host applications from users</p>
            </div>

            {/* Filter Controls */}
            <div className="controls-section">
                <div className="filter-controls">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Applications</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Applications Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Email</th>
                            <th>Business Name</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Reviewed By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(application => (
                            <tr key={application.id}>
                                <td>
                                    <div className="user-info" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                        {application.citizenship_image ? (
                                            <img 
                                                src={`http://127.0.0.1:8000${application.citizenship_image}`} 
                                                alt="ID" 
                                                className="admin-listing-img" 
                                                style={{ width: '40px', height: '30px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '30px', background: '#eee', borderRadius: '4px' }}></div>
                                        )}
                                        <strong>{application.user_name}</strong>
                                    </div>
                                </td>
                                <td>{application.user_email}</td>
                                <td>{application.business_name || 'Individual'}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>
                                </td>
                                <td>{new Date(application.applied_at).toLocaleDateString()}</td>
                                <td>
                                    {application.reviewed_by ? (
                                        <span className="reviewed-info">
                                            Admin
                                            <small>{new Date(application.reviewed_at).toLocaleDateString()}</small>
                                        </span>
                                    ) : (
                                        <span className="not-reviewed">Not reviewed</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleViewApplication(application.id)}
                                            className="btn btn-info"
                                            title="View Details"
                                        >
                                            VIEW
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Application Detail Modal */}
            {showApplicationDetail && selectedApplication && (
                <div className="modal-overlay" onClick={() => setShowApplicationDetail(false)}>
                    <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Host Application Details</h3>
                            <button 
                                onClick={() => setShowApplicationDetail(false)}
                                className="close-btn"
                            >
                                    X
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Applicant Information */}
                            <div className="application-section">
                                <h4>Applicant Information</h4>
                                <div className="application-detail-grid">
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{selectedApplication.user_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedApplication.user_email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Citizenship Number:</label>
                                        <span>{selectedApplication.citizenship_number}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Citizenship Image:</label>
                                        {selectedApplication.citizenship_image && (
                                            <img 
                                                src={`http://127.0.0.1:8000${selectedApplication.citizenship_image}`} 
                                                alt="Citizenship"
                                                className="document-image"
                                                onClick={() => window.open(`http://127.0.0.1:8000${selectedApplication.citizenship_image}`, '_blank')}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="application-section">
                                <h4>Business Information</h4>
                                <div className="application-detail-grid">
                                    <div className="detail-item">
                                        <label>Business Name:</label>
                                        <span>{selectedApplication.business_name || 'Individual'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Business Registration:</label>
                                        <span>{selectedApplication.business_registration || 'Not provided'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Tax Number:</label>
                                        <span>{selectedApplication.tax_number || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Information */}
                            <div className="application-section">
                                <h4>Bank Information</h4>
                                <div className="application-detail-grid">
                                    <div className="detail-item">
                                        <label>Bank Name:</label>
                                        <span>{selectedApplication.bank_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Account Number:</label>
                                        <span>{selectedApplication.account_number}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Account Holder:</label>
                                        <span>{selectedApplication.account_holder_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Application Status */}
                            <div className="application-section">
                                <h4>Application Status</h4>
                                <div className="application-detail-grid">
                                    <div className="detail-item">
                                        <label>Current Status:</label>
                                        <span className={`status-badge ${getStatusBadgeClass(selectedApplication.status)}`}>
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Applied Date:</label>
                                        <span>{new Date(selectedApplication.applied_at).toLocaleDateString()}</span>
                                    </div>
                                    {selectedApplication.reviewed_by && (
                                        <>
                                            <div className="detail-item">
                                                <label>Reviewed Date:</label>
                                                <span>{new Date(selectedApplication.reviewed_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Review Notes:</label>
                                                <span>{selectedApplication.review_notes}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Review Section */}
                            {selectedApplication.status === 'pending' && (
                                <div className="application-section">
                                    <h4>Review Application</h4>
                                    <div className="review-section">
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Enter review notes or reason for rejection..."
                                            className="review-textarea"
                                            rows="4"
                                        />
                                        <div className="review-actions">
                                            <button 
                                                onClick={() => handleApproveApplication(selectedApplication.id)}
                                                className="btn btn-success"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'APPROVE Application'}
                                            </button>
                                            <button 
                                                onClick={() => handleRejectApplication(selectedApplication.id)}
                                                className="btn btn-danger"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'REJECT Application'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {applications.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No host applications found.</p>
                </div>
            )}
        </div>
    );
};

export default HostApplicationsManagement;
