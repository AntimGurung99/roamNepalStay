// import React, { useState } from "react";
// import api from "../api/axios";
// import "../styles/ListingDetailModal.css";
// import BookingModal from "./BookingModal";

// const WishlistHeart = ({ listingId, initialIsWishlisted }) => {
//   const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

//   const [loading, setLoading] = useState(false);

//   React.useEffect(() => {
//     setIsWishlisted(initialIsWishlisted);
//   }, [initialIsWishlisted]);

//   const toggleWishlist = async (e) => {
//     e.stopPropagation();
//     const token = localStorage.getItem("access");
//     if (!token) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await api.post(`/listings/${listingId}/toggle_wishlist/`);

//       const data = response.data;

//       if (response.status === 200) {
//         setIsWishlisted(data.is_wishlisted);
//         window.dispatchEvent(new Event("wishlistUpdate"));
//       }
//     } catch (error) {
//       console.error("Error toggling wishlist:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
//       onClick={toggleWishlist}
//       disabled={loading}
//       title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//     >
//       <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
//     </button>
//   );
// };

// const ListingDetailModal = ({
//   isOpen,
//   onClose,
//   selectedListing,
//   showWishlist = true,
// }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [showBookingModal, setShowBookingModal] = useState(false);

//   React.useEffect(() => {
//     if (isOpen && selectedListing) {
//       console.log("ListingDetailModal opened for:", selectedListing.title);
//     }
//   }, [isOpen, selectedListing]);

//   if (!isOpen || !selectedListing) return null;

//   const images = selectedListing.images || [];
//   const hostName = selectedListing.host_name || "Host";
//   const createdAt = selectedListing.created_at
//     ? new Date(selectedListing.created_at).getFullYear()
//     : "recent";

//   return (
//     <div
//       className="modal-overlay listing-detail-modal-overlay"
//       onClick={onClose}
//     >
//       <div
//         className="modal-content listing-detail-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button onClick={onClose} className="close-btn modal-close-x">
//           ✕
//         </button>

//         {/* Image Carousel */}
//         <div className="listing-detail-carousel">
//           {images.length > 0 ? (
//             <div className="carousel-container">
//               {showWishlist && (
//                 <WishlistHeart
//                   listingId={selectedListing.id}
//                   initialIsWishlisted={selectedListing.is_wishlisted}
//                 />
//               )}
//               <img
//                 src={
//                   images[currentImageIndex]?.toString().startsWith("http")
//                     ? images[currentImageIndex]
//                     : `http://127.0.0.1:8000${images[currentImageIndex]}`
//                 }
//                 alt={selectedListing.title}
//                 className="carousel-image"
//               />
//               {images.length > 1 && (
//                 <>
//                   <button
//                     className="carousel-btn carousel-prev"
//                     onClick={() =>
//                       setCurrentImageIndex((prev) =>
//                         prev === 0 ? images.length - 1 : prev - 1
//                       )
//                     }
//                   >
//                     ‹
//                   </button>
//                   <button
//                     className="carousel-btn carousel-next"
//                     onClick={() =>
//                       setCurrentImageIndex((prev) =>
//                         prev === images.length - 1 ? 0 : prev + 1
//                       )
//                     }
//                   >
//                     ›
//                   </button>
//                   <div className="carousel-indicators">
//                     {images.map((_, idx) => (
//                       <span
//                         key={idx}
//                         className={`indicator ${
//                           idx === currentImageIndex ? "active" : ""
//                         }`}
//                         onClick={() => setCurrentImageIndex(idx)}
//                       />
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           ) : (
//             <div className="no-images-placeholder">
//               <span style={{ fontSize: "48px" }}></span>
//               <p>No images available</p>
//             </div>
//           )}
//         </div>

//         {/* Listing Header */}
//         <div className="listing-detail-header">
//           <div className="listing-title-section">
//             <span className="category-tag">
//               {selectedListing.category || "Property"}
//             </span>
//             <h2>{selectedListing.title}</h2>
//             <div className="listing-meta-top">
//               <span className="location-meta">
//                 <i className="bi bi-geo-alt-fill"></i>{" "}
//                 {selectedListing.address || ""}, {selectedListing.city || ""},{" "}
//                 {selectedListing.region || ""}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Modal Body with Layout */}
//         <div className="listing-detail-content-wrapper">
//           <div className="listing-detail-main">
//             {/* Quick Stats */}
//             <div className="quick-stats-row">
//               <div className="stat-pill">
//                 <i className="bi bi-people"></i>
//                 <span>{selectedListing.max_guests || 0} Guests</span>
//               </div>
//               <div className="stat-pill">
//                 <i className="bi bi-door-open"></i>
//                 <span>{selectedListing.bedrooms || 0} Bedrooms</span>
//               </div>
//               <div className="stat-pill">
//                 <i className="bi bi-droplet"></i>
//                 <span>{selectedListing.bathrooms || 0} Bathrooms</span>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="detail-section">
//               <div className="section-header-row">
//                 <div className="host-brief">
//                   <h3>Hosted by {hostName}</h3>
//                   <p>Member since {createdAt}</p>
//                 </div>
//                 <div className="host-avatar-small">{hostName.charAt(0)}</div>
//               </div>
//               <hr className="section-divider" />
//               <div className="feature-highlights">
//                 <div className="highlight-item">
//                   <i className="bi bi-house-heart"></i>
//                   <div>
//                     <strong>{selectedListing.property_type}</strong>
//                     <p>
//                       You'll have the {selectedListing.property_type.toLowerCase()}{" "}
//                       to yourself.
//                     </p>
//                   </div>
//                 </div>
//                 {selectedListing.highlight && (
//                   <div className="highlight-item">
//                     <i className="bi bi-stars"></i>
//                     <div>
//                       <strong>{selectedListing.highlight}</strong>
//                       <p>
//                         {selectedListing.highlight_details ||
//                           "This is one of the most loved areas."}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//                 <div className="highlight-item">
//                   <i className="bi bi-calendar-check"></i>
//                   <div>
//                     <strong>Free cancellation</strong>
//                     <p>Get a full refund if you change your mind.</p>
//                   </div>
//                 </div>
//               </div>
//               <hr className="section-divider" />
//               <p className="description-text">{selectedListing.description}</p>
//             </div>

//             {/* Amenities */}
//             {selectedListing.amenities && selectedListing.amenities.length > 0 && (
//               <div className="detail-section">
//                 <h3>What this place offers</h3>
//                 <div className="amenities-grid-premium">
//                   {selectedListing.amenities.map((amenity, idx) => (
//                     <div key={idx} className="amenity-item-premium">
//                       <i className="bi bi-check2-circle"></i>
//                       <span>{amenity.replace(/_/g, " ")}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Location Section */}
//             <div
//               className="detail-section"
//               style={{ borderBottom: "1px solid #ebebeb", paddingBottom: "32px" }}
//             >
//               <h3>Where you'll be</h3>
//               <div className="location-card-premium">
//                 <div className="location-icon-box">
//                   <i className="bi bi-map"></i>
//                 </div>
//                 <div className="location-info-premium">
//                   <strong>
//                     {selectedListing.city}, {selectedListing.province}
//                   </strong>
//                   <p>
//                     {selectedListing.district}, {selectedListing.region} Nepal
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Reviews Section */}
//             <div className="reviews-section" style={{ marginTop: "32px" }}>
//               <h3 style={{ marginBottom: "24px", fontSize: "22px" }}>
//                 {selectedListing.total_reviews || 0} reviews
//               </h3>

//               {selectedListing.approved_reviews &&
//               selectedListing.approved_reviews.length > 0 ? (
//                 <div
//                   className="listing-reviews-list"
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//                     gap: "24px",
//                   }}
//                 >
//                   {selectedListing.approved_reviews.map((review, idx) => (
//                     <div
//                       key={review.id || idx}
//                       className="listing-review-card"
//                       style={{ padding: "4px" }}
//                     >
//                       <div
//                         className="listing-review-top"
//                         style={{ marginBottom: "12px" }}
//                       >
//                         <div
//                           style={{
//                             display: "flex",
//                             gap: "12px",
//                             alignItems: "center",
//                           }}
//                         >
//                           <div
//                             className="host-avatar-small"
//                             style={{
//                               width: "44px",
//                               height: "44px",
//                               fontSize: "16px",
//                               background: "#f0f0f0",
//                               color: "#333",
//                             }}
//                           >
//                             {review.reviewer_avatar ? (
//                               <img
//                                 src={review.reviewer_avatar}
//                                 alt={review.reviewer_name}
//                                 style={{
//                                   width: "100%",
//                                   height: "100%",
//                                   borderRadius: "50%",
//                                   objectFit: "cover",
//                                 }}
//                               />
//                             ) : (
//                               review.reviewer_name.charAt(0)
//                             )}
//                           </div>
//                           <div>
//                             <div
//                               className="listing-review-name"
//                               style={{ fontWeight: "600", fontSize: "16px" }}
//                             >
//                               {review.reviewer_name}
//                             </div>
//                             <div
//                               className="listing-review-date"
//                               style={{ fontSize: "14px", color: "#717171" }}
//                             >
//                               {new Date(review.created_at).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div
//                         className="listing-review-rating"
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "4px",
//                           marginBottom: "8px",
//                         }}
//                       >
//                         {[...Array(5)].map((_, i) => (
//                           <i
//                             key={i}
//                             className={`bi bi-star-fill`}
//                             style={{
//                               color: i < review.rating ? "gold" : "#ddd",
//                               fontSize: "12px",
//                             }}
//                           ></i>
//                         ))}
//                       </div>
//                       <p
//                         className="listing-review-comment"
//                         style={{ fontSize: "15px", lineHeight: "1.5", color: "#222" }}
//                       >
//                         {review.comment}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p style={{ color: "#717171" }}>No reviews yet for this stay.</p>
//               )}
//             </div>
//           </div>

//           <div className="listing-detail-sidebar">
//             <div className="booking-sticky-card">
//               <div className="booking-card-header">
//                 <div className="price-tag">
//                   <span className="price">
//                     Rs. {selectedListing.price_per_night}
//                   </span>
//                   <span className="period">/ night</span>
//                 </div>
//               </div>

//               <button
//                 className="reserve-btn-primary"
//                 onClick={() => {
//                   const token = localStorage.getItem("access");
//                   if (!token) {
//                     alert("Please login to make a booking.");
//                     return;
//                   }
//                   setShowBookingModal(true);
//                 }}
//               >
//                 Reserve Now
//               </button>
//               <p className="wont-charge">You won't be charged yet</p>
//             </div>
//             <BookingModal
//               isOpen={showBookingModal}
//               onClose={() => setShowBookingModal(false)}
//               listing={selectedListing}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export { WishlistHeart, ListingDetailModal };
// export default ListingDetailModal;


import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "../styles/ListingDetailModal.css";
import BookingModal from "./BookingModal";

const API_BASE = "http://127.0.0.1:8000";

const WishlistHeart = ({ listingId, initialIsWishlisted }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("access");
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.post(`/listings/${listingId}/toggle_wishlist/`);
      const data = response.data;

      if (response.status === 200) {
        setIsWishlisted(data.is_wishlisted);
        window.dispatchEvent(new Event("wishlistUpdate"));
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
      onClick={toggleWishlist}
      disabled={loading}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      type="button"
    >
      <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
    </button>
  );
};

const ListingDetailModal = ({
  isOpen,
  onClose,
  selectedListing,
  showWishlist = true,
  showBooking = true,
  imageFit = "cover",
  mode = "default",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (isOpen && selectedListing) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, selectedListing]);

  const images = useMemo(() => selectedListing?.images || [], [selectedListing]);

  if (!isOpen || !selectedListing) return null;

  const currentImage = images[currentImageIndex];
  const imageSrc = currentImage
    ? currentImage.toString().startsWith("http")
      ? currentImage
      : `${API_BASE}${currentImage}`
    : null;

  const hostName = selectedListing.host_name || "Host";
  const createdAt = selectedListing.created_at
    ? new Date(selectedListing.created_at).getFullYear()
    : "recent";

  const goPrev = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="modal-overlay listing-detail-modal-overlay" onClick={onClose}>
      <div
        className={`modal-content listing-detail-modal ${
          mode === "admin" ? "listing-detail-modal-admin-split" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="close-btn modal-close-x" type="button">
          ✕
        </button>

        {mode === "admin" ? (
          <div className="admin-split-layout">
            <div className="admin-split-gallery">
              <div className="admin-gallery-main">
                {images.length > 0 ? (
                  <>
                    <div className={`admin-main-image-shell fit-${imageFit}`}>
                      <img
                        src={imageSrc}
                        alt={selectedListing.title}
                        className={`admin-main-image fit-${imageFit}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          className="carousel-btn carousel-prev"
                          onClick={goPrev}
                          type="button"
                        >
                          ‹
                        </button>
                        <button
                          className="carousel-btn carousel-next"
                          onClick={goNext}
                          type="button"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="no-images-placeholder admin-no-image">
                    <p>No images available</p>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="admin-thumb-grid">
                  {images.map((img, idx) => {
                    const thumbSrc = img?.toString().startsWith("http")
                      ? img
                      : `${API_BASE}${img}`;

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`admin-thumb-card ${idx === currentImageIndex ? "active" : ""}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img
                          src={thumbSrc}
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="admin-split-sidebar">
              <div className="admin-sidebar-sticky">
                <span className="category-tag">
                  {selectedListing.category || "Property"}
                </span>

                <h2 className="admin-sidebar-title">{selectedListing.title}</h2>

                <div className="admin-sidebar-location">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>
                    {selectedListing.address || ""}, {selectedListing.city || ""},{" "}
                    {selectedListing.region || ""}
                  </span>
                </div>

                <div className="admin-price-box">
                  <div className="admin-price-main">
                    Rs. {selectedListing.price_per_night}
                  </div>
                  <div className="admin-price-sub">per night</div>
                </div>

                <div className="admin-quick-stats">
                  <div className="admin-stat-card">
                    <i className="bi bi-people"></i>
                    <div>
                      <strong>{selectedListing.max_guests || 0}</strong>
                      <span>Guests</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <i className="bi bi-door-open"></i>
                    <div>
                      <strong>{selectedListing.bedrooms || 0}</strong>
                      <span>Bedrooms</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <i className="bi bi-droplet"></i>
                    <div>
                      <strong>{selectedListing.bathrooms || 0}</strong>
                      <span>Bathrooms</span>
                    </div>
                  </div>
                </div>

                <div className="admin-info-block">
                  <h4>Host</h4>
                  <div className="admin-host-row">
                    <div className="host-avatar-small">{hostName.charAt(0)}</div>
                    <div>
                      <strong>{hostName}</strong>
                      <p>Member since {createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="admin-info-block">
                  <h4>Property Details</h4>
                  <div className="admin-details-list">
                    <div><strong>Type:</strong> {selectedListing.property_type || "Property"}</div>
                    <div><strong>City:</strong> {selectedListing.city || "-"}</div>
                    <div><strong>District:</strong> {selectedListing.district || "-"}</div>
                    <div><strong>Province:</strong> {selectedListing.province || "-"}</div>
                    <div><strong>Region:</strong> {selectedListing.region || "-"}</div>
                    <div><strong>Status:</strong> {selectedListing.status || "-"}</div>
                  </div>
                </div>

                <div className="admin-info-block">
                  <h4>Description</h4>
                  <p className="admin-description-text">
                    {selectedListing.description || "No description available."}
                  </p>
                </div>

                {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                  <div className="admin-info-block">
                    <h4>Amenities</h4>
                    <div className="admin-amenities-grid">
                      {selectedListing.amenities.map((amenity, idx) => (
                        <div key={idx} className="admin-amenity-pill">
                          <i className="bi bi-check2"></i>
                          <span>{amenity.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="admin-info-block">
                  <h4>Reviews</h4>
                  <p>
                    <strong>{selectedListing.total_reviews || 0}</strong> total reviews
                  </p>

                  {selectedListing.approved_reviews?.length > 0 ? (
                    <div className="admin-reviews-stack">
                      {selectedListing.approved_reviews.map((review, idx) => (
                        <div key={review.id || idx} className="admin-review-card">
                          <div className="admin-review-head">
                            <strong>{review.reviewer_name}</strong>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="admin-review-stars">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`bi ${i < review.rating ? "bi-star-fill" : "bi-star"}`}
                              ></i>
                            ))}
                          </div>
                          <p>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="listing-detail-carousel public-carousel">
              {images.length > 0 ? (
                <div className="carousel-container">
                  {showWishlist && (
                    <div className="public-wishlist-wrap">
                      <WishlistHeart
                        listingId={selectedListing.id}
                        initialIsWishlisted={selectedListing.is_wishlisted}
                      />
                    </div>
                  )}

                  <div className={`carousel-image-shell fit-${imageFit}`}>
                    <img
                      src={imageSrc}
                      alt={selectedListing.title}
                      className={`carousel-image fit-${imageFit}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {images.length > 1 && (
                    <>
                      <button className="carousel-btn carousel-prev" onClick={goPrev} type="button">
                        ‹
                      </button>
                      <button className="carousel-btn carousel-next" onClick={goNext} type="button">
                        ›
                      </button>

                      <div className="carousel-indicators">
                        {images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`indicator ${idx === currentImageIndex ? "active" : ""}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {images.length > 1 && (
                    <div className="carousel-thumbnails">
                      {images.map((img, idx) => {
                        const thumbSrc = img?.toString().startsWith("http")
                          ? img
                          : `${API_BASE}${img}`;

                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`carousel-thumb ${idx === currentImageIndex ? "active" : ""}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img
                              src={thumbSrc}
                              alt={`Thumbnail ${idx + 1}`}
                              loading="lazy"
                              decoding="async"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-images-placeholder">
                  <p>No images available</p>
                </div>
              )}
            </div>

            <div className="listing-detail-header">
              <div className="listing-title-section">
                <span className="category-tag">{selectedListing.category || "Property"}</span>
                <h2>{selectedListing.title}</h2>
                <div className="listing-meta-top">
                  <span className="location-meta">
                    <i className="bi bi-geo-alt-fill"></i>
                    {selectedListing.address || ""}, {selectedListing.city || ""}, {selectedListing.region || ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="listing-detail-content-wrapper">
              <div className="listing-detail-main">
                <div className="quick-stats-row">
                  <div className="stat-pill">
                    <i className="bi bi-people"></i>
                    <div>
                      <strong>{selectedListing.max_guests || 0}</strong>
                      <span>Guests</span>
                    </div>
                  </div>

                  <div className="stat-pill">
                    <i className="bi bi-door-open"></i>
                    <div>
                      <strong>{selectedListing.bedrooms || 0}</strong>
                      <span>Bedrooms</span>
                    </div>
                  </div>

                  <div className="stat-pill">
                    <i className="bi bi-droplet"></i>
                    <div>
                      <strong>{selectedListing.bathrooms || 0}</strong>
                      <span>Bathrooms</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section public-card-section">
                  <h3>Host</h3>
                  <div className="public-host-card">
                    <div className="host-avatar-small">{hostName.charAt(0)}</div>
                    <div>
                      <strong>{hostName}</strong>
                      <p>Member since {createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section public-card-section">
                  <h3>Description</h3>
                  <p className="description-text">
                    {selectedListing.description || "No description available."}
                  </p>
                </div>

                {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                  <div className="detail-section public-card-section">
                    <h3>Amenities</h3>
                    <div className="public-amenities-grid">
                      {selectedListing.amenities.map((amenity, idx) => (
                        <div key={idx} className="public-amenity-pill">
                          <i className="bi bi-check2"></i>
                          <span>{amenity.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section public-card-section">
                  <h3>Reviews</h3>
                  {selectedListing.approved_reviews?.length > 0 ? (
                    <div className="listing-reviews-list public-reviews-grid">
                      {selectedListing.approved_reviews.map((review, idx) => (
                        <div key={review.id || idx} className="listing-review-card">
                          <div className="listing-review-top">
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                              <div className="host-avatar-small review-avatar">
                                {review.reviewer_avatar ? (
                                  <img
                                    src={review.reviewer_avatar}
                                    alt={review.reviewer_name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  review.reviewer_name?.charAt(0) || "U"
                                )}
                              </div>
                              <div>
                                <div className="listing-review-name">{review.reviewer_name}</div>
                                <div className="listing-review-date">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="listing-review-rating">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className="bi bi-star-fill"
                                style={{ opacity: i < review.rating ? 1 : 0.25 }}
                              ></i>
                            ))}
                          </div>

                          <p className="listing-review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#717171" }}>No reviews yet for this stay.</p>
                  )}
                </div>
              </div>

              {showBooking && (
                <div className="listing-detail-sidebar">
                  <div className="booking-sticky-card public-booking-card">
                    <div className="booking-card-header">
                      <div className="price-tag">
                        <span className="price">Rs. {selectedListing.price_per_night}</span>
                        <span className="period"> / night</span>
                      </div>
                    </div>

                    <button
                      className="reserve-btn-primary"
                      onClick={() => {
                        const token = localStorage.getItem("access");
                        if (!token) {
                          alert("Please login to make a booking.");
                          return;
                        }
                        setShowBookingModal(true);
                      }}
                      type="button"
                    >
                      Reserve Now
                    </button>

                    <p className="wont-charge">You won't be charged yet</p>
                  </div>

                  <BookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    listing={selectedListing}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { WishlistHeart, ListingDetailModal };
export default ListingDetailModal;