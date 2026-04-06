import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/HostBookingDetails.css";

const HostBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking && id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/host/bookings/${id}/`);
      setBooking(res.data || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const numberValue = Number(value || 0);
    return `Rs. ${numberValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const formatPaymentMethod = (method) => {
    if (!method) return "N/A";

    const value = method.toLowerCase().replaceAll("_", " ");
    if (value.includes("esewa")) return "eSewa";
    if (value.includes("khalti")) return "Khalti";
    if (value.includes("cash")) return "Cash in Hand";

    return method;
  };

  const getBookingImage = (data) => {
    return (
      data?.listing_image ||
      data?.image ||
      data?.property_image ||
      data?.property?.image ||
      data?.property?.thumbnail ||
      "https://via.placeholder.com/900x520?text=Property+Image"
    );
  };

  const guestName =
    booking?.user_name ||
    booking?.guest_name ||
    booking?.customer_name ||
    booking?.booked_by ||
    booking?.user?.name ||
    "Guest";

  const guestEmail =
    booking?.user_email ||
    booking?.guest_email ||
    booking?.email ||
    booking?.user?.email ||
    "N/A";

  return (
    <div>
      <Navbar searchTerm="" setSearchTerm={() => {}} />

      <div className="booking-details-page">
        <div className="booking-details-shell">
          <div className="booking-details-topbar">
            <button className="back-btn" onClick={() => navigate("/host/dashboard")}>
              <FaArrowLeft />
              <span>Back</span>
            </button>

            <h1 className="details-page-title">Booking Details</h1>
          </div>

          {loading && <p className="details-message">Loading booking details...</p>}
          {error && <p className="details-error">{error}</p>}

          {!loading && !error && booking && (
            <div className="booking-details-card">
              <div className="details-image-wrap">
                <img
                  src={getBookingImage(booking)}
                  alt={booking.listing_title || "Property"}
                  className="details-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/900x520?text=Property+Image";
                  }}
                />
              </div>

              <div className="details-content">
                <h2 className="details-property-title">
                  {booking.listing_title || booking.property_name || "Property Name"}
                </h2>

                <div className="details-grid">
                  <div className="detail-box">
                    <span className="detail-label">Guest Name</span>
                    <p>{guestName}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Email</span>
                    <p>{guestEmail}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Created At</span>
                    <p>{formatDateTime(booking.created_at || booking.booked_at)}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Payment Method</span>
                    <p>{formatPaymentMethod(booking.payment_method)}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Booking ID</span>
                    <p>{booking.id || "N/A"}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Status</span>
                    <p>{booking.status || "N/A"}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Check-in</span>
                    <p>{booking.check_in || "N/A"}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Check-out</span>
                    <p>{booking.check_out || "N/A"}</p>
                  </div>

                  <div className="detail-box">
                    <span className="detail-label">Total Amount</span>
                    <p>{formatCurrency(booking.total_amount || booking.host_payout || 0)}</p>
                  </div>

                  <div className="detail-box detail-box-full">
                    <span className="detail-label">Special Request</span>
                    <p>{booking.special_request || booking.notes || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !booking && (
            <p className="details-error">No booking data found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostBookingDetails;