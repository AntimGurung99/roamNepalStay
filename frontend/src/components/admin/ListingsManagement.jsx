import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';
import '../../styles/ListingDetailModal.css';
import ListingDetailModal from '../ListingDetailModal';

const ListingsManagement = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchListings();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [filterStatus, searchTerm]);

    useEffect(() => {
        console.log('Modal state changed:', { showDetailModal, hasSelectedListing: !!selectedListing });
    }, [showDetailModal, selectedListing]);


    const fetchListings = async () => {
        console.log('Fetching admin listings...');
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            let url = `http://127.0.0.1:8000/api/admin/listings/?status=${filterStatus}&search=${searchTerm}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setListings(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const [detailLoading, setDetailLoading] = useState(false);

    const handleViewListing = async (listingId) => {
        console.log('VIEW button clicked for listing ID:', listingId);
        setDetailLoading(true);
        try {
            const token = localStorage.getItem('access');
            const url = `http://127.0.0.1:8000/api/admin/listings/${listingId}/`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Successfully fetched listing details for admin:', data.title);
                setSelectedListing(data);
                setShowDetailModal(true);
            } else {
                let errorMsg = `HTTP Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.detail || JSON.stringify(errorData);
                } catch (e) {
                    errorMsg = await response.text() || errorMsg;
                }
                console.error('Failed to fetch listing details for admin:', response.status, errorMsg);
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error fetching listing details:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/listings/${id}/approve/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchListings();
        } catch (error) {
            console.error('Error approving listing:', error);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return;
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`http://127.0.0.1:8000/api/admin/listings/${id}/reject/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            if (response.ok) fetchListings();
        } catch (error) {
            console.error('Error rejecting listing:', error);
        }
    };

    return (
        <div className="admin-management">
            <div className="admin-management-header">
                <h2>Listings Management</h2>
                <div className="admin-controls" style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        type="text" 
                        placeholder="Search listings..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-input"
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="admin-select"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="published">Published</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-spinner-small"></div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Photo</th>
                                <th>Title</th>
                                <th>Host</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.length > 0 ? (
                                listings.map((listing, index) => (
                                    <tr key={listing.id}>
                                        <td><strong>{index + 1}</strong></td>
                                        <td className="admin-photo-cell">
                                            {listing.primary_image ? (
                                                <div 
                                                    className="photo-click-area"
                                                    onClick={() => {
                                                        console.log('Photo clicked in admin row for:', listing.title);
                                                        handleViewListing(listing.id);
                                                    }}
                                                    style={{ cursor: 'pointer', position: 'relative' }}
                                                >
                                                    <img 
                                                        src={listing.primary_image?.startsWith('http') ? listing.primary_image : `http://127.0.0.1:8000${listing.primary_image}`} 
                                                        alt={listing.title} 
                                                        className="listing-photo admin-listing-img"
                                                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="no-photo" style={{ width: '60px', height: '40px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>No Image</div>
                                            )}
                                        </td>
                                        <td><strong>{listing.title}</strong></td>
                                        <td>{listing.host_name}</td>
                                        <td>{listing.city}, {listing.district}</td>
                                        <td>Rs. {listing.price_per_night}</td>
                                        <td>
                                            <span className={`status-badge ${listing.status}`}>
                                                {listing.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    onClick={() => handleViewListing(listing.id)}
                                                    className="btn btn-info"
                                                    title="View Details"
                                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                                    type="button"
                                                >
                                                    VIEW
                                                </button>

                                                {listing.status !== 'published' && (
                                                    <button 
                                                        onClick={() => handleApprove(listing.id)}
                                                        className="btn btn-success"
                                                    >
                                                        PUBLISH
                                                    </button>
                                                )}
                                                
                                                {listing.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleReject(listing.id)}
                                                        className="btn btn-danger"
                                                    >
                                                        REJECT
                                                    </button>
                                                )}

                                                {listing.status === 'published' && (
                                                    <button 
                                                        onClick={() => handleReject(listing.id)}
                                                        className="btn btn-warning"
                                                    >
                                                        SUSPEND
                                                    </button>
                                                )}
                                                
                                                {listing.status === 'rejected' && (
                                                    <span style={{ fontSize: '12px', color: '#ff385c' }}>Manually Rejected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>No listings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>


            {/* Use the shared ListingDetailModal component */}
            <ListingDetailModal 
                isOpen={showDetailModal} 
                onClose={() => setShowDetailModal(false)} 
                selectedListing={selectedListing} 
                showWishlist={false}
            />
        </div>
    );
};

export default ListingsManagement;
