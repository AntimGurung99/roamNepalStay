// import React, { useState, useEffect } from 'react';
// import '../../styles/AdminComponents.css';

// // Bookings Management Component - For managing system bookings
// const BookingsManagement = () => {
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         const timeoutId = setTimeout(() => {
//             fetchBookings();
//         }, 500);
//         return () => clearTimeout(timeoutId);
//     }, [statusFilter, searchTerm]);

//     const fetchBookings = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('access');
//             let url = 'http://127.0.0.1:8000/api/admin/bookings/';
            
//             const params = new URLSearchParams();
//             if (statusFilter !== 'all') params.append('status', statusFilter);
//             if (searchTerm) params.append('search', searchTerm);
            
//             if (params.toString()) {
//                 url += '?' + params.toString();
//             }

//             const response = await fetch(url, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 }
//             });
            
//             if (response.ok) {
//                 const data = await response.json();
//                 setBookings(data.results || data);
//             }
//         } catch (error) {
//             console.error('Error fetching bookings:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getStatusClass = (status) => {
//         switch (status) {
//             case 'pending': return 'status-pending';
//             case 'paid': return 'status-published';
//             case 'completed': return 'status-approved';
//             case 'cancelled': return 'status-rejected';
//             default: return 'status-pending';
//         }
//     };

//     if (loading) {
//         return (
//             <div className="admin-loading">
//                 <div className="loading-spinner"></div>
//                 <p>Loading bookings...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="admin-section">
//             <div className="section-header">
//                 <h2>Bookings Management</h2>
//                 <p>View and monitor all stay reservations</p>
//             </div>

//             <div className="controls-section">
//                 <div className="search-box">
//                     <input
//                         type="text"
//                         placeholder="Search by guest or property name..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="search-input"
//                     />
//                 </div>
                
//                 <div className="filter-controls">
//                     <select 
//                         value={statusFilter} 
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="filter-select"
//                     >
//                         <option value="all">All Bookings</option>
//                         <option value="pending">Pending Payment</option>
//                         <option value="paid">Paid/Confirmed</option>
//                         <option value="completed">Completed</option>
//                         <option value="cancelled">Cancelled</option>
//                     </select>
//                 </div>
//             </div>

//             <div className="table-container">
//                 <table className="admin-table">
//                     <thead>
//                         <tr>
//                             <th>Guest</th>
//                             <th>Property</th>
//                             <th>Check In</th>
//                             <th>Check Out</th>
//                             <th>Amount</th>
//                             <th>Status</th>
//                             <th>Payment</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {bookings.map(booking => (
//                             <tr key={booking.id}>
//                                 <td>
//                                     <div className="user-info">
//                                         <strong>{booking.guest_name}</strong>
//                                     </div>
//                                 </td>
//                                 <td>
//                                     <div className="listing-info">
//                                         <strong>{booking.listing_title}</strong>
//                                         <small>{booking.listing_city}</small>
//                                     </div>
//                                 </td>
//                                 <td>{new Date(booking.check_in).toLocaleDateString()}</td>
//                                 <td>{new Date(booking.check_out).toLocaleDateString()}</td>
//                                 <td>Rs. {booking.total_amount}</td>
//                                 <td>
//                                     <span className={`status-badge ${getStatusClass(booking.status)}`}>
//                                         {booking.status}
//                                     </span>
//                                 </td>
//                                 <td>
//                                     <span className={`badge ${booking.payment_status === 'paid' ? 'host-badge' : 'guest-badge'}`}>
//                                         {booking.payment_status}
//                                     </span>
//                                 </td>
//                                 <td>
//                                     <button className="btn btn-info">DETAILS</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {bookings.length === 0 && (
//                 <div className="empty-state">
//                     <p>No bookings found.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BookingsManagement;


import React, { useEffect, useState } from "react";
import AdminBookingDetailsModal from "./AdminBookingDetailsModal";
import "../../styles/AdminComponents.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

const getPaymentClass = (paymentStatus) => {
  return (paymentStatus || "").toLowerCase() === "paid"
    ? "host-badge"
    : "guest-badge";
};

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openingBookingId, setOpeningBookingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access");
      let url = "http://127.0.0.1:8000/api/admin/bookings/";
      const params = new URLSearchParams();

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load bookings.");
      }

      const data = await response.json();
      setBookings(data.results || data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      setError("Could not load admin bookings right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookingId) => {
    setDetailLoading(true);
    setOpeningBookingId(bookingId);
    setError("");

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/bookings/${bookingId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load booking details.");
      }

      const data = await response.json();
      setSelectedBooking(data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Booking details could not be opened.");
    } finally {
      setDetailLoading(false);
      setOpeningBookingId(null);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Bookings Management</h2>
        <p>View and monitor all stay reservations</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by guest, property, city, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="admin-inline-error">{error}</div>}

      <div className="table-container">
        <table className="admin-table admin-bookings-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Property</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const bookingImage =
                  booking.listing_image ||
                  "https://via.placeholder.com/120x80?text=Stay";
                const location = [booking.listing_city, booking.listing_district]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="user-info">
                        <strong>{booking.guest_name || "Guest"}</strong>
                        <small>{booking.guest_email || "No email"}</small>
                      </div>
                    </td>

                    <td>
                      <div className="admin-booking-property-cell">
                        <img
                          src={bookingImage}
                          alt={booking.listing_title || "Property"}
                          className="admin-booking-thumb"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/120x80?text=Stay";
                          }}
                        />

                        <div className="listing-info">
                          <strong>{booking.listing_title || "Property"}</strong>
                          <small>{location || "Location not available"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(booking.check_in)}</td>
                    <td>{formatDate(booking.check_out)}</td>
                    <td>{formatCurrency(booking.total_amount)}</td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {prettifyText(booking.status)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${getPaymentClass(
                          booking.payment_status
                        )}`}
                      >
                        {prettifyText(booking.payment_status)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-info admin-details-btn"
                        onClick={() => handleViewDetails(booking.id)}
                        disabled={detailLoading}
                      >
                        {detailLoading && openingBookingId === booking.id
                          ? "OPENING..."
                          : "DETAILS"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="empty-state compact-empty-state">
                    <p>No bookings found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminBookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
      />
    </div>
  );
};

export default BookingsManagement;