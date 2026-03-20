import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateListingModal from '../components/CreateListingModal';
import '../styles/profilePage.css';

const MyProperties = () => {
  const [myListings, setMyListings] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/listings/my_listings/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyListings(data);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = async (listingId) => {
    const token = localStorage.getItem("access");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/listings/${listingId}/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedListing(data);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching listing details:", error);
    }
  };

  return (
    <div className="profile-container">
      <Navbar />
      <main className="profile-content">
        <div className="my-listings-section" style={{ maxWidth: '1000px', width: '100%' }}>
          <h2 className="section-title">My List of Properties</h2>
          <p style={{ color: '#717171', marginBottom: '24px' }}>
            Manage your listings, update details, and manage photos.
          </p>
          
          {loading ? (
            <p>Loading your properties...</p>
          ) : myListings.length > 0 ? (
            <div className="listings-list">
              {myListings.map(listing => (
                <div key={listing.id} className="listing-item-row">
                  <div className="listing-item-img">
                    <img src={`http://127.0.0.1:8000${listing.primary_image}`} alt={listing.title} />
                  </div>
                  <div className="listing-item-info">
                    <h3>{listing.title}</h3>
                    <p>{listing.city}, {listing.region}</p>
                    <div className="listing-status-row">
                      <span className={`status-badge status-${listing.status}`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                      <span className="price">Rs. {listing.price_per_night}/night</span>
                    </div>
                  </div>
                  <div className="listing-item-actions">
                    <button 
                      className="edit-listing-btn"
                      onClick={() => handleEditListing(listing.id)}
                    >
                      <i className="bi bi-pencil-square"></i> Edit Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-listings-message" style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏠</div>
              <h3>No properties found</h3>
              <p>You haven't added any listings yet. Start hosting today!</p>
            </div>
          )}
        </div>
      </main>

      <CreateListingModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedListing(null);
          fetchMyListings(); // Refresh list after edit
        }}
        initialData={selectedListing}
      />
    </div>
  );
};

export default MyProperties;
