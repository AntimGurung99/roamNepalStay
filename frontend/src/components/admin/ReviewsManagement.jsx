import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';
import { LiaStarSolid } from "react-icons/lia";

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch('http://127.0.0.1:8000/api/admin/reviews/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (reviewId) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(
                `http://127.0.0.1:8000/api/admin/reviews/${reviewId}/toggle_approval/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                fetchReviews();
            }
        } catch (error) {
            console.error('Error toggling review approval:', error);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Reviews Management</h2>
                <p>Review and moderate user experiences</p>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Property</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id}>
                                <td>
                                    <strong>{review.reviewer_name}</strong>
                                </td>
                                <td>{review.listing_title}</td>
                                <td>
                                    <span style={{ color: '#1e1c17', fontWeight: 'bold' }}>
                                         <LiaStarSolid />{review.rating}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '300px', fontSize: '0.85rem' }}>
                                        {review.comment}
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`status-badge ${
                                            review.is_approved ? 'status-approved' : 'status-rejected'
                                        }`}
                                    >
                                        {review.is_approved ? 'Approved' : 'Unapproved'}
                                    </span>
                                </td>
                                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleToggleApproval(review.id)}
                                        className={`btn ${review.is_approved ? 'btn-danger' : 'btn-success'}`}
                                    >
                                        {review.is_approved ? 'HIDE' : 'APPROVE'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {reviews.length === 0 && (
                <div className="empty-state">
                    <p>No reviews found.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsManagement;