import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/HostDashboard.css";

const HostDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/host/bookings/");
      setBookings(res.data);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="host-dashboard">
      <button 
        className="profile-back-btn" 
        onClick={() => navigate("/home")}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Home
      </button>
      <h1 className="dashboard-title">Host Dashboard</h1>

      {loading && <p>Loading bookings...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && bookings.length === 0 && (
        <p>No bookings yet.</p>
      )}

      <div className="booking-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">

            <div className="booking-header">
              <h3>{booking.listing_title}</h3>
              <span className={`status ${booking.payment_status}`}>
                {booking.payment_status === "paid" ? "Paid" : "Unpaid"}
              </span>
            </div>

            <div className="booking-body">
              <p><strong>Guest:</strong> {booking.guest_name}</p>
              <p><strong>Dates:</strong> {booking.check_in} → {booking.check_out}</p>
              <p><strong>Guests:</strong> {booking.guests_count}</p>
              <p><strong>Total:</strong> Rs.{booking.total_amount}</p>
            </div>

            <div className="booking-footer">
              <span className="booking-id">Booking #{booking.id}</span>
              <span className="created-date">
                {new Date(booking.created_at).toLocaleDateString()}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default HostDashboard;