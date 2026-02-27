import React, { useState } from 'react';
import '../styles/ListingDetailModal.css';
const WishlistHeart = ({ listingId, initialIsWishlisted }) => {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setIsWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted]);

    const toggleWishlist = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('access');
        if (!token) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/listings/${listingId}/toggle_wishlist/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setIsWishlisted(data.is_wishlisted);
                window.dispatchEvent(new Event('wishlistUpdate'));
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`} 
            onClick={toggleWishlist}
            disabled={loading}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>
    );
};

const ListingDetailModal = ({ isOpen, onClose, selectedListing, showWishlist = true }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    React.useEffect(() => {
        if (isOpen && selectedListing) {
            console.log('ListingDetailModal opened for:', selectedListing.title);
        }
    }, [isOpen, selectedListing]);

    if (!isOpen || !selectedListing) return null;

    const images = selectedListing.images || [];
    const hostName = selectedListing.host_name || "Host";
    const createdAt = selectedListing.created_at ? new Date(selectedListing.created_at).getFullYear() : "recent";

    return (
        <div className="modal-overlay listing-detail-modal-overlay" onClick={onClose}>
            <div className="modal-content listing-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="close-btn modal-close-x"
                >
                    ✕
                </button>

                {/* Image Carousel */}
                <div className="listing-detail-carousel">
                    {images.length > 0 ? (
                        <div className="carousel-container">
                            {showWishlist && <WishlistHeart listingId={selectedListing.id} initialIsWishlisted={selectedListing.is_wishlisted} />}
                            <img 
                                src={images[currentImageIndex]?.image?.startsWith('http') ? images[currentImageIndex].image : `http://127.0.0.1:8000${images[currentImageIndex]?.image}`}
                                alt={selectedListing.title}
                                className="carousel-image"
                            />
                            {images.length > 1 && (
                                <>
                                    <button 
                                        className="carousel-btn carousel-prev"
                                        onClick={() => setCurrentImageIndex(prev => 
                                            prev === 0 ? images.length - 1 : prev - 1
                                        )}
                                    >
                                        ‹
                                    </button>
                                    <button 
                                        className="carousel-btn carousel-next"
                                        onClick={() => setCurrentImageIndex(prev => 
                                            prev === images.length - 1 ? 0 : prev + 1
                                        )}
                                    >
                                        ›
                                    </button>
                                    <div className="carousel-indicators">
                                        {images.map((_, idx) => (
                                            <span 
                                                key={idx}
                                                className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="no-images-placeholder">
                            <span style={{ fontSize: '48px' }}>🏠</span>
                            <p>No images available</p>
                        </div>
                    )}
                </div>

                {/* Listing Header */}
                <div className="listing-detail-header">
                    <div className="listing-title-section">
                        <span className="category-tag">{selectedListing.category || "Property"}</span>
                        <h2>{selectedListing.title}</h2>
                        <div className="listing-meta-top">
                            <span className="location-meta">
                                <i className="bi bi-geo-alt-fill"></i> {selectedListing.address || ""}, {selectedListing.city || ""}, {selectedListing.region || ""}
                            </span>
                            <span className="rating-meta">
                                <i className="bi bi-star-fill"></i> {selectedListing.average_rating || "New"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Body with Layout */}
                <div className="listing-detail-content-wrapper">
                    <div className="listing-detail-main">
                        {/* Quick Stats */}
                        <div className="quick-stats-row">
                            <div className="stat-pill">
                                <i className="bi bi-people"></i>
                                <span>{selectedListing.max_guests || 0} Guests</span>
                            </div>
                            <div className="stat-pill">
                                <i className="bi bi-door-open"></i>
                                <span>{selectedListing.bedrooms || 0} Bedrooms</span>
                            </div>
                            <div className="stat-pill">
                                 <i className="bi bi-droplet"></i>
                                 <span>{selectedListing.bathrooms || 0} Bathrooms</span>
                             </div>
                        </div>

                        {/* Description */}
                        <div className="detail-section">
                            <div className="section-header-row">
                                <div className="host-brief">
                                    <h3>Hosted by {hostName}</h3>
                                    <p>Member since {createdAt}</p>
                                </div>
                                <div className="host-avatar-small">
                                    {hostName.charAt(0)}
                                </div>
                            </div>
                            <hr className="section-divider" />
                            <div className="feature-highlights">
                                <div className="highlight-item">
                                    <i className="bi bi-house-heart"></i>
                                    <div>
                                        <strong>{selectedListing.property_type}</strong>
                                        <p>You'll have the {selectedListing.property_type.toLowerCase()} to yourself.</p>
                                    </div>
                                </div>
                                {selectedListing.highlight && (
                                    <div className="highlight-item">
                                        <i className="bi bi-stars"></i>
                                        <div>
                                            <strong>{selectedListing.highlight}</strong>
                                            <p>{selectedListing.highlight_details || "This is one of the most loved areas."}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="highlight-item">
                                    <i className="bi bi-calendar-check"></i>
                                    <div>
                                        <strong>Free cancellation</strong>
                                        <p>Get a full refund if you change your mind.</p>
                                    </div>
                                </div>
                            </div>
                            <hr className="section-divider" />
                            <p className="description-text">{selectedListing.description}</p>
                        </div>

                        {/* Amenities */}
                        {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                            <div className="detail-section">
                                <h3>What this place offers</h3>
                                <div className="amenities-grid-premium">
                                    {selectedListing.amenities.map((amenity, idx) => (
                                        <div key={idx} className="amenity-item-premium">
                                            <i className="bi bi-check2-circle"></i>
                                            <span>{amenity.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        <div className="detail-section">
                            <h3>Where you'll be</h3>
                            <div className="location-card-premium">
                                <div className="location-icon-box">
                                    <i className="bi bi-map"></i>
                                </div>
                                <div className="location-info-premium">
                                    <strong>{selectedListing.city}, {selectedListing.province}</strong>
                                    <p>{selectedListing.district}, {selectedListing.region} Nepal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="listing-detail-sidebar">
                        <div className="booking-sticky-card">
                            <div className="booking-card-header">
                                <div className="price-tag">
                                    <span className="price">Rs. {selectedListing.price_per_night}</span>
                                    <span className="period">/ night</span>
                                </div>
                                <div className="rating-summary">
                                    <i className="bi bi-star-fill"></i> {selectedListing.average_rating || "New"}
                                </div>
                            </div>
                            <div className="booking-form-dummy">
                                <div className="check-in-out">
                                    <div className="date-input">
                                        <label>CHECK-IN</label>
                                        <span>Add date</span>
                                    </div>
                                    <div className="date-input">
                                        <label>CHECKOUT</label>
                                        <span>Add date</span>
                                    </div>
                                </div>
                                <div className="guests-input">
                                    <label>GUESTS</label>
                                    <span>1 guest</span>
                                </div>
                            </div>
                            <button className="reserve-btn-primary">Reserve Now</button>
                            <p className="wont-charge">You won't be charged yet</p>

                            <div className="price-breakdown">
                                <div className="breakdown-row">
                                    <span>Rs. {selectedListing.price_per_night} x 5 nights</span>
                                    <span>Rs. {selectedListing.price_per_night * 5}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Cleaning fee</span>
                                    <span>Rs. {selectedListing.cleaning_fee || 0}</span>
                                </div>
                                <hr />
                                <div className="breakdown-total">
                                    <span>Total</span>
                                    <span>Rs. {selectedListing.price_per_night * 5 + (selectedListing.cleaning_fee || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { WishlistHeart, ListingDetailModal };
export default ListingDetailModal;
