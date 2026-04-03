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
        const timeoutId = setTimeout(() => {
            fetchApplications();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [statusFilter]);

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString();
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://127.0.0.1:8000${path}`;
    };

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
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

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
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/approve/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notes: reviewNotes
                    })
                }
            );

            if (response.ok) {
                alert('Host application approved successfully!');
                setShowApplicationDetail(false);
                setSelectedApplication(null);
                setReviewNotes('');
                fetchApplications();
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
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/host-applications/${applicationId}/reject/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notes: reviewNotes
                    })
                }
            );

            if (response.ok) {
                alert('Host application rejected successfully!');
                setShowApplicationDetail(false);
                setSelectedApplication(null);
                setReviewNotes('');
                fetchApplications();
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
            case 'pending':
                return 'status-pending';
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

    const closeDetailModal = () => {
        setShowApplicationDetail(false);
        setSelectedApplication(null);
        setReviewNotes('');
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
                        {applications.map((application) => (
                            <tr key={application.id}>
                                <td>
                                    <div
                                        className="user-info"
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        {application.citizenship_image ? (
                                            <img
                                                src={getImageUrl(application.citizenship_image)}
                                                alt="ID"
                                                className="admin-listing-img"
                                                style={{ width: '40px', height: '30px' }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '30px',
                                                    background: '#eee',
                                                    borderRadius: '4px'
                                                }}
                                            ></div>
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
                                <td>{formatDate(application.applied_at)}</td>
                                <td>
                                    {application.reviewed_by ? (
                                        <span className="reviewed-info">
                                            Admin
                                            <small>{formatDate(application.reviewed_at)}</small>
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

            {showApplicationDetail && selectedApplication && (
                <div
                    className="host-details-overlay"
                    onClick={closeDetailModal}
                >
                    <div
                        className="host-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="host-details-header">
                            <div>
                                <h2>Host Application Details</h2>
                                <p>Review complete host application information</p>
                            </div>

                            <button
                                onClick={closeDetailModal}
                                className="host-details-close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="host-details-body">
                            <div className="host-section-card">
                                <h3>Applicant Information</h3>
                                <div className="host-details-grid">
                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Full Name</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.user_name || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Email</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.user_email || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Citizenship Number</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.citizenship_number || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="host-section-card">
                                <h3>Business Information</h3>
                                <div className="host-details-grid">
                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Business Name</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.business_name || 'Individual'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Business Registration</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.business_registration || 'Not provided'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Tax Number</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.tax_number || 'Not provided'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="host-section-card">
                                <h3>Bank Information</h3>
                                <div className="host-details-grid">
                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Bank Name</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.bank_name || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Account Number</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.account_number || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Account Holder</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.account_holder_name || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="host-section-card">
                                <h3>Application Status</h3>
                                <div className="host-details-grid">
                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Current Status</span>
                                        <span
                                            className={`host-status-badge ${getStatusBadgeClass(selectedApplication.status)}`}
                                        >
                                            {selectedApplication.status
                                                ? selectedApplication.status.charAt(0).toUpperCase() +
                                                  selectedApplication.status.slice(1)
                                                : 'Pending'}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Applied Date</span>
                                        <span className="host-detail-value">
                                            {formatDate(selectedApplication.applied_at)}
                                        </span>
                                    </div>

                                    <div className="host-detail-card">
                                        <span className="host-detail-label">Reviewed Date</span>
                                        <span className="host-detail-value">
                                            {selectedApplication.reviewed_at
                                                ? formatDate(selectedApplication.reviewed_at)
                                                : 'Not reviewed yet'}
                                        </span>
                                    </div>
                                </div>

                                <div className="host-notes-box">
                                    <span className="host-detail-label">Review Notes</span>
                                    <p>{selectedApplication.review_notes || 'No review notes available.'}</p>
                                </div>
                            </div>

                            <div className="host-section-card">
                                <h3>Citizenship Document</h3>
                                {selectedApplication.citizenship_image ? (
                                    <div className="host-document-preview">
                                        <img
                                            src={getImageUrl(selectedApplication.citizenship_image)}
                                            alt="Citizenship"
                                            onClick={() =>
                                                window.open(
                                                    getImageUrl(selectedApplication.citizenship_image),
                                                    '_blank'
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="host-empty-doc">
                                        No citizenship document uploaded.
                                    </div>
                                )}
                            </div>

                            {selectedApplication.status === 'pending' && (
                                <div className="host-section-card">
                                    <h3>Review Application</h3>
                                    <div className="clean-review-section">
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Enter review notes or reason for rejection..."
                                            className="clean-review-textarea"
                                            rows="4"
                                        />
                                        <div className="review-actions">
                                            <button
                                                onClick={() => handleApproveApplication(selectedApplication.id)}
                                                className="btn btn-success"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'Approve Application'}
                                            </button>
                                            <button
                                                onClick={() => handleRejectApplication(selectedApplication.id)}
                                                className="btn btn-danger"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'Reject Application'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {applications.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No host applications found.</p>
                </div>
            )}
        </div>
    );
};

export default HostApplicationsManagement;