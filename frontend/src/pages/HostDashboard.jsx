import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/HostDashboard.css";

const HostDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchBookings();
    fetchAnalytics();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/host/bookings/");
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load host bookings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get("/host/analytics/");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.check_in);
      return checkInDate >= today && booking.status !== "cancelled";
    });
  }, [bookings]);

  const historyBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const checkOutDate = new Date(booking.check_out);
      return checkOutDate < today && booking.status !== "cancelled";
    });
  }, [bookings]);

  const cancelledBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "cancelled");
  }, [bookings]);

  const cashBookingsCount = useMemo(() => {
    return bookings.filter(
      (booking) => booking.payment_method === "cash_in_hand"
    ).length;
  }, [bookings]);

  const totalBookingsCount = analytics?.total_bookings ?? bookings.length ?? 0;
  const paidBookingsCount = analytics?.paid_bookings ?? 0;
  const unpaidBookingsCount = analytics?.unpaid_bookings ?? 0;

  const chartData = [
    { label: "Cash Booking", value: cashBookingsCount },
    { label: "Total Booking", value: totalBookingsCount },
    { label: "Paid", value: paidBookingsCount },
    { label: "Unpaid", value: unpaidBookingsCount },
  ];

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);

  const displayedBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "history"
      ? historyBookings
      : cancelledBookings;

  const formatCurrency = (value) => {
    const numberValue = Number(value || 0);
    return `Rs. ${numberValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div>
      <Navbar searchTerm="" setSearchTerm={() => {}} />

      <div className="host-dashboard">
        <div className="dashboard-topbar">
          <button
            className="profile-back-btn"
            onClick={() => navigate("/home")}
          >
            ← Back to Home
          </button>
          <h1 className="dashboard-title">Host Dashboard</h1>
        </div>

        {(loading || analyticsLoading) && (
          <p className="dashboard-message">Loading dashboard...</p>
        )}

        {error && <p className="dashboard-error">{error}</p>}

        {!loading && !analyticsLoading && (
          <>
            <div className="host-summary-cards">
              <div className="summary-card">
                <h3>Total Bookings</h3>
                <p>{analytics?.total_bookings ?? bookings.length ?? 0}</p>
              </div>

              <div className="summary-card">
                <h3>Host Net Revenue</h3>
                <p>{formatCurrency(analytics?.host_net_revenue)}</p>
              </div>

              <div className="summary-card">
                <h3>Platform Fee Collected</h3>
                <p>{formatCurrency(analytics?.platform_revenue)}</p>
              </div>

              <div className="summary-card">
                <h3>Paid Bookings</h3>
                <p>{analytics?.paid_bookings ?? 0}</p>
              </div>

              <div className="summary-card">
                <h3>Unpaid Bookings</h3>
                <p>{analytics?.unpaid_bookings ?? 0}</p>
              </div>

              <div className="summary-card summary-card-wide">
                <h3>Most Booked Property</h3>
                <p>{analytics?.most_booked_property ?? "No bookings yet"}</p>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h2>Booking Overview</h2>
                <span>Cash, Total, Paid, Unpaid</span>
              </div>

              <div className="custom-bar-chart">
                {chartData.map((item) => (
                  <div key={item.label} className="bar-group">
                    <div className="bar-value">{item.value}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${(item.value / maxChartValue) * 220}px`,
                        }}
                      />
                    </div>
                    <div className="bar-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-tabs">
              <button
                className={activeTab === "upcoming" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Bookings
              </button>

              <button
                className={activeTab === "history" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("history")}
              >
                Booking History
              </button>

              <button
                className={activeTab === "cancelled" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("cancelled")}
              >
                Cancelled Bookings
              </button>
            </div>

            {!loading && displayedBookings.length === 0 && (
              <p className="empty-text">No bookings found in this section.</p>
            )}

            <div className="booking-list">
              {displayedBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.listing_title}</h3>
                      <p className="booking-subtitle">
                        Booking #{booking.id}
                      </p>
                    </div>

                    <div className="booking-badges">
                      <span className={`badge status-${booking.status || "pending"}`}>
                        {booking.status}
                      </span>
                      <span
                        className={`badge payment-${
                          booking.payment_status || "unpaid"
                        }`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-grid">
                    <div className="booking-item">
                      <span className="label">Guest</span>
                      <span className="value">{booking.guest_name || "N/A"}</span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Check-in</span>
                      <span className="value">{booking.check_in}</span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Check-out</span>
                      <span className="value">{booking.check_out}</span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Guests</span>
                      <span className="value">{booking.guests_count}</span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Total Paid by Guest</span>
                      <span className="value">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Host Payout</span>
                      <span className="value">
                        {formatCurrency(booking.host_payout)}
                      </span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Platform Revenue</span>
                      <span className="value">
                        {formatCurrency(booking.superadmin_revenue)}
                      </span>
                    </div>

                    <div className="booking-item">
                      <span className="label">Payment Method</span>
                      <span className="value">
                        {booking.payment_method
                          ? booking.payment_method.replaceAll("_", " ")
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="booking-footer">
                    <span>
                      Created:{" "}
                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;