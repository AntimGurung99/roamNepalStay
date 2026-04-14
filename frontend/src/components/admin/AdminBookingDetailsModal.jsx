// import React from "react";
// import "../../styles/AdminComponents.css";

// const FALLBACK_IMAGE =
//   "https://via.placeholder.com/1200x700?text=RoamNepalStay+Booking";

// const formatCurrency = (value) => {
//   const amount = Number(value || 0);
//   return `Rs. ${amount.toLocaleString(undefined, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;
// };

// const formatDate = (value) => {
//   if (!value) return "N/A";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return value;
//   return date.toLocaleDateString();
// };

// const formatDateTime = (value) => {
//   if (!value) return "N/A";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return value;
//   return date.toLocaleString();
// };

// const prettifyText = (value) => {
//   if (!value) return "N/A";
//   const cleaned = String(value).replaceAll("_", " ");
//   return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
// };

// const getStatusClass = (status) => {
//   switch ((status || "").toLowerCase()) {
//     case "pending":
//       return "status-pending";
//     case "paid":
//     case "confirmed":
//       return "status-published";
//     case "completed":
//       return "status-approved";
//     case "cancelled":
//     case "rejected":
//       return "status-rejected";
//     default:
//       return "status-pending";
//   }
// };

// const AdminBookingDetailsModal = ({ booking, isOpen, onClose }) => {
//   if (!isOpen || !booking) return null;

//   const bookingImage = booking.listing_image || FALLBACK_IMAGE;

//   const propertyLocation = [
//     booking.listing_city,
//     booking.listing_district,
//     booking.listing_country,
//   ]
//     .filter(Boolean)
//     .join(", ");

//   const guestLocation = [booking.guest_city, booking.guest_country]
//     .filter(Boolean)
//     .join(", ");

//   return (
//     <div className="modal-overlay admin-booking-overlay" onClick={onClose}>
//       <div
//         className="admin-booking-modal compact-booking-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="compact-booking-hero">
//           <img
//             src={bookingImage}
//             alt={booking.listing_title || "Booking"}
//             className="compact-booking-hero-image"
//             onError={(e) => {
//               e.currentTarget.src = FALLBACK_IMAGE;
//             }}
//           />

//           <div className="compact-booking-hero-overlay">
//             <div className="compact-booking-title-wrap">
//               <p className="compact-booking-overline">Booking Details</p>
//               <h2>{booking.listing_title || "Property Booking"}</h2>
//               <p className="compact-booking-location">
//                 {propertyLocation || "Nepal"}
//               </p>
//             </div>

//             <button
//               className="compact-booking-close"
//               onClick={onClose}
//               type="button"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         <div className="compact-booking-body">
//           <div className="compact-summary-grid">
//             <div className="compact-summary-card">
//               <span>Total</span>
//               <strong>{formatCurrency(booking.total_amount)}</strong>
//             </div>

//             <div className="compact-summary-card">
//               <span>Nights</span>
//               <strong>{booking.total_nights || 0}</strong>
//             </div>

//             <div className="compact-summary-card">
//               <span>Guests</span>
//               <strong>{booking.guests_count || 0}</strong>
//             </div>

//             <div className="compact-summary-card">
//               <span>Payment</span>
//               <strong>{prettifyText(booking.payment_status)}</strong>
//             </div>
//           </div>

//           <div className="compact-booking-sections">
//             <section className="compact-booking-card">
//               <div className="compact-booking-head">
//                 <h3>Booking Overview</h3>
//                 <span
//                   className={`status-badge ${getStatusClass(booking.status)}`}
//                 >
//                   {prettifyText(booking.status)}
//                 </span>
//               </div>

//               <div className="compact-info-grid four-col">
//                 <div className="compact-info-box">
//                   <label>Booking ID</label>
//                   <p>#{booking.id}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Check In</label>
//                   <p>{formatDate(booking.check_in)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Check Out</label>
//                   <p>{formatDate(booking.check_out)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Created</label>
//                   <p>{formatDateTime(booking.created_at)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Payment Status</label>
//                   <p>{prettifyText(booking.payment_status)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Payment Method</label>
//                   <p>{prettifyText(booking.payment_method)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Paid At</label>
//                   <p>{formatDateTime(booking.paid_at)}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Host Responded</label>
//                   <p>{formatDateTime(booking.host_responded_at)}</p>
//                 </div>
//               </div>
//             </section>

//             <section className="compact-booking-card">
//               <div className="compact-booking-head">
//                 <h3>Guest Information</h3>
//               </div>

//               <div className="compact-info-grid two-col">
//                 <div className="compact-info-box">
//                   <label>Guest Name</label>
//                   <p>{booking.guest_name || "N/A"}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Email</label>
//                   <p>{booking.guest_email || "N/A"}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Phone</label>
//                   <p>{booking.guest_phone || "N/A"}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Location</label>
//                   <p>{guestLocation || "N/A"}</p>
//                 </div>
//               </div>
//             </section>

//             <section className="compact-booking-card">
//               <div className="compact-booking-head">
//                 <h3>Property Information</h3>
//               </div>

//               <div className="compact-info-grid two-col">
//                 <div className="compact-info-box">
//                   <label>Property Name</label>
//                   <p>{booking.listing_title || "N/A"}</p>
//                 </div>

//                 <div className="compact-info-box">
//                   <label>Host Name</label>
//                   <p>{booking.host_name || "N/A"}</p>
//                 </div>

//                 <div className="compact-info-box compact-info-box-wide">
//                   <label>Address</label>
//                   <p>{booking.listing_address || propertyLocation || "N/A"}</p>
//                 </div>
//               </div>
//             </section>

//             <section className="compact-booking-card">
//               <div className="compact-booking-head">
//                 <h3>Price Breakdown</h3>
//               </div>

//               <div className="compact-price-list">
//                 <div className="compact-price-row">
//                   <span>Room subtotal</span>
//                   <strong>{formatCurrency(booking.room_subtotal)}</strong>
//                 </div>

//                 <div className="compact-price-row">
//                   <span>Cleaning fee</span>
//                   <strong>{formatCurrency(booking.cleaning_fee)}</strong>
//                 </div>

//                 <div className="compact-price-row">
//                   <span>Service fee</span>
//                   <strong>{formatCurrency(booking.service_fee)}</strong>
//                 </div>

//                 <div className="compact-price-row">
//                   <span>Host payout</span>
//                   <strong>{formatCurrency(booking.host_payout)}</strong>
//                 </div>

//                 <div className="compact-price-row">
//                   <span>Platform revenue</span>
//                   <strong>{formatCurrency(booking.superadmin_revenue)}</strong>
//                 </div>

//                 <div className="compact-price-row compact-total-row">
//                   <span>Total</span>
//                   <strong>{formatCurrency(booking.total_amount)}</strong>
//                 </div>
//               </div>
//             </section>

//             <section className="compact-booking-card">
//               <div className="compact-booking-head">
//                 <h3>Special Requests</h3>
//               </div>

//               <div className="compact-note-box">
//                 <p>{booking.special_requests || "No special requests added."}</p>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminBookingDetailsModal;



import React from "react";
import "../../styles/AdminBookingDetailsModal.css"

const FALLBACK_IMAGE =
  "https://via.placeholder.com/600x400?text=RoamNepalStay";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const prettifyText = (value) => {
  if (!value) return "N/A";
  const cleaned = String(value).replaceAll("_", " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getStatusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "status-pending";
    case "paid":
    case "confirmed":
      return "status-published";
    case "completed":
      return "status-approved";
    case "cancelled":
    case "rejected":
      return "status-rejected";
    default:
      return "status-pending";
  }
};

const AdminBookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const bookingImage = booking.listing_image || FALLBACK_IMAGE;

  const propertyLocation = [
    booking.listing_city,
    booking.listing_district,
    booking.listing_country,
  ]
    .filter(Boolean)
    .join(", ");

  const guestLocation = [booking.guest_city, booking.guest_country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="admin-booking-overlay" onClick={onClose}>
      <div
        className="admin-booking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="booking-top">
          <img
            src={bookingImage}
            alt={booking.listing_title || "Property"}
            className="booking-top-img"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="booking-top-info">
            <h2>{booking.listing_title || "Property Booking"}</h2>
            <p>{propertyLocation || "Nepal"}</p>
          </div>

          <button
            type="button"
            className="booking-top-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-booking-body">
          <div className="booking-summary-grid">
            <div className="booking-summary-card">
              <span>Total Amount</span>
              <strong>{formatCurrency(booking.total_amount)}</strong>
            </div>

            <div className="booking-summary-card">
              <span>Total Nights</span>
              <strong>{booking.total_nights || 0} night(s)</strong>
            </div>

            <div className="booking-summary-card">
              <span>Guests</span>
              <strong>{booking.guests_count || 0} guest(s)</strong>
            </div>

            <div className="booking-summary-card">
              <span>Payment</span>
              <strong>{prettifyText(booking.payment_status)}</strong>
            </div>
          </div>

          <div className="booking-sections">
            <section className="booking-section">
              <div className="booking-section-head">
                <h3>Booking Overview</h3>
                <span
                  className={`status-badge ${getStatusClass(booking.status)}`}
                >
                  {prettifyText(booking.status)}
                </span>
              </div>

              <div className="booking-info-grid four-col">
                <div className="booking-info-box">
                  <label>Booking ID</label>
                  <p>#{booking.id}</p>
                </div>

                <div className="booking-info-box">
                  <label>Check In</label>
                  <p>{formatDate(booking.check_in)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Check Out</label>
                  <p>{formatDate(booking.check_out)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Created</label>
                  <p>{formatDateTime(booking.created_at)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Payment Status</label>
                  <p>{prettifyText(booking.payment_status)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Payment Method</label>
                  <p>{prettifyText(booking.payment_method)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Paid At</label>
                  <p>{formatDateTime(booking.paid_at)}</p>
                </div>

                <div className="booking-info-box">
                  <label>Host Responded</label>
                  <p>{formatDateTime(booking.host_responded_at)}</p>
                </div>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-head">
                <h3>Guest Information</h3>
              </div>

              <div className="booking-info-grid two-col">
                <div className="booking-info-box">
                  <label>Guest Name</label>
                  <p>{booking.guest_name || "N/A"}</p>
                </div>

                <div className="booking-info-box">
                  <label>Email</label>
                  <p>{booking.guest_email || "N/A"}</p>
                </div>

                <div className="booking-info-box">
                  <label>Phone</label>
                  <p>{booking.guest_phone || "N/A"}</p>
                </div>

                <div className="booking-info-box">
                  <label>Location</label>
                  <p>{guestLocation || "N/A"}</p>
                </div>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-head">
                <h3>Property Information</h3>
              </div>

              <div className="booking-info-grid two-col">
                <div className="booking-info-box">
                  <label>Property Name</label>
                  <p>{booking.listing_title || "N/A"}</p>
                </div>

                <div className="booking-info-box">
                  <label>Host Name</label>
                  <p>{booking.host_name || "N/A"}</p>
                </div>

                <div className="booking-info-box booking-info-box-wide">
                  <label>Address</label>
                  <p>{booking.listing_address || propertyLocation || "N/A"}</p>
                </div>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-head">
                <h3>Price Breakdown</h3>
              </div>

              <div className="booking-price-list">
                <div className="booking-price-row">
                  <span>Room subtotal</span>
                  <strong>{formatCurrency(booking.room_subtotal)}</strong>
                </div>

                <div className="booking-price-row">
                  <span>Cleaning fee</span>
                  <strong>{formatCurrency(booking.cleaning_fee)}</strong>
                </div>

                <div className="booking-price-row">
                  <span>Service fee</span>
                  <strong>{formatCurrency(booking.service_fee)}</strong>
                </div>

                <div className="booking-price-row">
                  <span>Host payout</span>
                  <strong>{formatCurrency(booking.host_payout)}</strong>
                </div>

                <div className="booking-price-row">
                  <span>Platform revenue</span>
                  <strong>{formatCurrency(booking.superadmin_revenue)}</strong>
                </div>

                <div className="booking-price-row booking-total-row">
                  <span>Total</span>
                  <strong>{formatCurrency(booking.total_amount)}</strong>
                </div>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-head">
                <h3>Special Requests</h3>
              </div>

              <div className="booking-note-box">
                <p>{booking.special_requests || "No special requests added."}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetailsModal;