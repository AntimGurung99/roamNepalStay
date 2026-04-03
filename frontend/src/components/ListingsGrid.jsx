import React, { useState, useEffect } from 'react';
import '../styles/ListingsGrid.css';
import '../styles/ListingDetailModal.css';
import ListingDetailModal, { WishlistHeart } from './ListingDetailModal';

const ListingCard = ({ listing, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    listing.all_images && listing.all_images.length > 0
      ? listing.all_images
      : listing.primary_image
      ? [listing.primary_image]
      : [];

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="listing-card" onClick={() => onClick(listing.id)}>
      <div className="listing-image-container">
        <WishlistHeart
          listingId={listing.id}
          initialIsWishlisted={listing.is_wishlisted}
        />

        {images.length > 0 ? (
          <>
            <img
              src={
                images[currentImageIndex]?.startsWith('http')
                  ? images[currentImageIndex]
                  : `http://127.0.0.1:8000${images[currentImageIndex]}`
              }
              alt={listing.title}
            />
            {images.length > 1 && (
              <>
                <button className="image-arrow left" onClick={handlePrev}>
                  &lt;
                </button>
                <button className="image-arrow right" onClick={handleNext}>
                  &gt;
                </button>
              </>
            )}
          </>
        ) : (
          <div className="no-image">No Photos</div>
        )}
      </div>

      <div className="listing-card-info">
        <div className="listing-card-title">{listing.title}</div>

        {listing.highlight && (
          <div className="listing-card-highlight">✨ {listing.highlight}</div>
        )}

        <div className="listing-card-location">
          <i className="bi bi-geo-alt"></i> {listing.city}, {listing.region},{" "}
          {listing.province}
        </div>

        <div className="listing-card-price">
          <strong>Rs. {listing.price_per_night}</strong> per night
        </div>
      </div>
    </div>
  );
};

const ListingsGrid = ({ searchTerm }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm || '');
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchListings();
  }, [debouncedSearchTerm]);

  const fetchListings = async () => {
    console.log('Fetching public listings for Home Page...');
    setLoading(true);
    const token = localStorage.getItem('access');

    try {
      const query = debouncedSearchTerm?.trim()
        ? `?search=${encodeURIComponent(debouncedSearchTerm.trim())}`
        : '';

      const response = await fetch(`http://127.0.0.1:8000/api/listings/${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          setListings(data);
        } else if (data && data.results && Array.isArray(data.results)) {
          setListings(data.results);
        } else {
          setListings([]);
        }
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (listingId) => {
    console.log('Listing card clicked on Home Page. ID:', listingId);
    setDetailLoading(true);
    const token = localStorage.getItem('access');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/listings/${listingId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched details for modal:', data.title);
        setSelectedListing(data);
        setShowDetailModal(true);
      } else {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorMsg = (await response.text()) || errorMsg;
        }
        console.error(
          'Failed to fetch listing details on Home Page:',
          response.status,
          errorMsg
        );
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <div className="listings-section">
        <div className="listings-grid">
          {loading ? (
            <div className="no-listings">Loading listings...</div>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={handleCardClick}
              />
            ))
          ) : (
            <div className="no-listings">
              No listings found for "{debouncedSearchTerm}".
            </div>
          )}
        </div>
      </div>

      <ListingDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        selectedListing={selectedListing}
        detailLoading={detailLoading}
      />
    </>
  );
};

export default ListingsGrid;