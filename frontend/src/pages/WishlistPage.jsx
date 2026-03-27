import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../styles/ListingsGrid.css';
import ListingDetailModal from '../components/ListingDetailModal';
import { FaHeart } from "react-icons/fa";
import api from '../api/axios';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const token = localStorage.getItem('access');
        if (!token) return;

        try {
            const response = await api.get('/wishlist/');
            if (response.status === 200) {
                const data = response.data;
                // Handle both direct array and paginated results
                if (Array.isArray(data)) {
                    setWishlistItems(data);
                } else if (data && data.results && Array.isArray(data.results)) {
                    setWishlistItems(data.results);
                } else {
                    setWishlistItems([]);
                }
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (wishlistId) => {
        const token = localStorage.getItem('access');
        try {
            const response = await api.delete(`/wishlist/${wishlistId}/`);
            if (response.status === 204 || response.status === 200) {
                setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
                window.dispatchEvent(new Event('wishlistUpdate'));
                if (selectedListing && selectedListing.id === wishlistItems.find(i => i.id === wishlistId)?.listing) {
                    setShowDetailModal(false);
                }
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleCardClick = async (listingId) => {
        const token = localStorage.getItem('access');
        try {
            const response = await api.get(`/listings/${listingId}/`);
            if (response.status === 200) {
                const data = response.data;
                setSelectedListing(data);
                setCurrentImageIndex(0);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching listing details:', error);
        }
    };

    return (
        <div className="wishlist-page">
            <Navbar />
            <div className="listings-section">
                <h1 className="listings-title">My Wishlist</h1>
                {loading ? (
                    <p>Loading your favorite properties...</p>
                ) : wishlistItems.length > 0 ? (
                    <div className="listings-grid">
                        {wishlistItems.map(item => (
                            <WishlistCard 
                                key={item.id} 
                                item={item} 
                                onRemove={() => handleRemoveFromWishlist(item.id)} 
                                onClick={() => handleCardClick(item.listing)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-listings" style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px', color: 'red' }}>
                        <FaHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save properties you like so you can easily find them later.</p>
                        <button 
                            className="reserve-btn-primary" 
                            style={{ width: 'auto', padding: '12px 24px', marginTop: '20px' }}
                            onClick={() => window.location.href = '/'}
                        >
                            Explore Nepal
                        </button>
                    </div>
                )}
            </div>

            <ListingDetailModal 
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                selectedListing={selectedListing}
            />
        </div>
    );
};

const WishlistCard = ({ item, onRemove, onClick }) => {
    const listing = item.listing_details;
    if (!listing) return null;

    return (
        <div className="listing-card" onClick={onClick}>
            <div className="listing-image-container">
                <button 
                    className="wishlist-heart-btn active" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <i className="bi bi-heart-fill"></i>
                </button>
                <img 
                    src={listing.primary_image?.startsWith('http') ? listing.primary_image : `http://127.0.0.1:8000${listing.primary_image}`} 
                    alt={listing.title} 
                />
            </div>

            <div className="listing-card-info">
                <div className="listing-card-title">{listing.title}</div>
                <div className="listing-card-location">
                    <i className="bi bi-geo-alt"></i> {listing.city}, {listing.region}
                </div>
                <div className="listing-card-price">
                    <strong>Rs. {listing.price_per_night}</strong> per night
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
