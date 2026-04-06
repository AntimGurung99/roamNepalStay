import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import Navbar from "../components/Navbar";
import NotificationBell from "../components/NotificationBell";
import api from "../api/axios";
import "../styles/HostDashboard.css";

const CHART_COLORS = ["#ff5c8a", "#7b2ea3", "#4caf50", "#ffb703", "#3a86ff", "#f28482"];

const HostDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("booking_lineup");

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
      setAnalytics(res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const normalizePaymentMethod = (method) => {
    if (!method) return "unknown";
    const value = method.toLowerCase().replaceAll(" ", "_");

    if (value.includes("esewa")) return "esewa";
    if (value.includes("khalti")) return "khalti";
    if (value.includes("cash")) return "cash_in_hand";

    return value;
  };

  const formatCurrency = (value) => {
    const numberValue = Number(value || 0);
    return `Rs. ${numberValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const totalBookings = analytics?.total_bookings ?? bookings.length ?? 0;

  const totalRevenue =
    analytics?.host_net_revenue ??
    bookings.reduce(
      (sum, booking) =>
        sum + Number(booking.host_payout || booking.total_amount || 0),
      0
    );

  const cancelledBookings = useMemo(() => {
    return bookings.filter(
      (booking) => String(booking.status || "").toLowerCase() === "cancelled"
    );
  }, [bookings]);

  const onlineBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const method = normalizePaymentMethod(booking.payment_method);
      return method === "esewa" || method === "khalti";
    });
  }, [bookings]);

  const bookingLineUpCount = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() !== "cancelled"
  ).length;

  const propertyBookingMap = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const propertyName =
        booking.listing_title ||
        booking.property_name ||
        booking.property_title ||
        "Unknown Property";
      map[propertyName] = (map[propertyName] || 0) + 1;
    });
    return map;
  }, [bookings]);

  const mostBookedProperty = useMemo(() => {
    const entries = Object.entries(propertyBookingMap);
    if (!entries.length) return "No bookings yet";
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [propertyBookingMap]);

  const recentBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aDate = new Date(a.created_at || a.booked_at || 0).getTime();
      const bDate = new Date(b.created_at || b.booked_at || 0).getTime();
      return bDate - aDate;
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === "booking_lineup") {
      return bookings.filter(
        (booking) => String(booking.status || "").toLowerCase() !== "cancelled"
      );
    }

    if (activeTab === "recent") {
      return recentBookings;
    }

    if (activeTab === "online") {
      return bookings.filter((booking) => {
        const method = normalizePaymentMethod(booking.payment_method);
        return method === "esewa" || method === "khalti";
      });
    }

    if (activeTab === "cancelled_by_host") {
      return bookings.filter(
        (booking) => String(booking.status || "").toLowerCase() === "cancelled"
      );
    }

    return bookings;
  }, [activeTab, bookings, recentBookings]);

  const getBookingEmail = (booking) => {
    return (
      booking.user_email ||
      booking.guest_email ||
      booking.email ||
      booking.user?.email ||
      "guest@email.com"
    );
  };

  const getBookingImage = (booking) => {
    return (
      booking.listing_image ||
      booking.image ||
      booking.property_image ||
      booking.property?.image ||
      booking.property?.thumbnail ||
      "https://via.placeholder.com/800x500?text=Property+Image"
    );
  };

  const esewaCount = bookings.filter(
    (booking) => normalizePaymentMethod(booking.payment_method) === "esewa"
  ).length;

  const khaltiCount = bookings.filter(
    (booking) => normalizePaymentMethod(booking.payment_method) === "khalti"
  ).length;

  const cashCount = bookings.filter(
    (booking) => normalizePaymentMethod(booking.payment_method) === "cash_in_hand"
  ).length;

  const barChartData = [
    { label: "eSewa", value: esewaCount },
    { label: "Khalti", value: khaltiCount },
    { label: "Cash in Hand", value: cashCount },
  ];

  const maxChartValue = Math.max(...barChartData.map((item) => item.value), 1);

  const pieData = useMemo(() => {
    const entries = Object.entries(propertyBookingMap);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    return entries.slice(0, 6).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: total ? ((value / total) * 100).toFixed(1) : 0,
    }));
  }, [propertyBookingMap]);

  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  const pieGradient = useMemo(() => {
    if (!pieData.length || totalPieValue === 0) {
      return "conic-gradient(#f7cad8 0deg 360deg)";
    }

    let currentDeg = 0;
    const segments = pieData.map((item) => {
      const deg = (item.value / totalPieValue) * 360;
      const start = currentDeg;
      const end = currentDeg + deg;
      currentDeg = end;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [pieData, totalPieValue]);

  return (
    <div>
      <Navbar searchTerm="" setSearchTerm={() => {}} />

      <div className="host-dashboard">
        <div className="dashboard-topbar">
          <button className="pink-home-btn" onClick={() => navigate("/home")}>
            <FaHome />
            <span>Home</span>
          </button>

          <h1 className="dashboard-title">Welcome to the Host Dashboard</h1>

          <div className="dashboard-bell-wrap">
            <NotificationBell
              scope="host"
              title="Host Notifications"
              viewAllPath="/host/notifications"
            />
          </div>
        </div>

        {(loading || analyticsLoading) && (
          <p className="dashboard-message">Loading dashboard...</p>
        )}

        {error && <p className="dashboard-error">{error}</p>}

        {!loading && !analyticsLoading && (
          <>
            <div className="host-summary-cards">
              <div className="summary-card">
                <h3>Total Booking</h3>
                <p>{totalBookings}</p>
              </div>

              <div className="summary-card">
                <h3>Host Revenue Total</h3>
                <p>{formatCurrency(totalRevenue)}</p>
              </div>

              <div className="summary-card">
                <h3>Total Booked Cancelled</h3>
                <p>{cancelledBookings.length}</p>
              </div>

              <div className="summary-card">
                <h3>Total Book via Online Payment</h3>
                <p>{onlineBookings.length}</p>
              </div>

              <div className="summary-card">
                <h3>Most Booked Property</h3>
                <p>{mostBookedProperty}</p>
              </div>

              <div className="summary-card">
                <h3>Booking Line Up</h3>
                <p>{bookingLineUpCount}</p>
              </div>
            </div>

            <div className="dashboard-tabs">
              <button
                className={activeTab === "booking_lineup" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("booking_lineup")}
              >
                Booking Line Up
              </button>

              <button
                className={activeTab === "recent" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("recent")}
              >
                Recent Booking
              </button>

              <button
                className={activeTab === "online" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("online")}
              >
                Via Online Payment
              </button>

              <button
                className={activeTab === "cancelled_by_host" ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab("cancelled_by_host")}
              >
                Cancelled by Host
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="empty-text">No bookings found in this section.</p>
            ) : (
              <div className="booking-gallery">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="property-card">
                    <div className="property-image-wrap">
                      <img
                        src={getBookingImage(booking)}
                        alt={booking.listing_title || "Property"}
                        className="property-image"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/800x500?text=Property+Image";
                        }}
                      />
                    </div>

                    <div className="property-content">
                      <h3 className="property-card-title">
                        {booking.listing_title || "Property Name"}
                      </h3>

                      <p className="booking-email-text">
                        <strong>Booked by:</strong> {getBookingEmail(booking)}
                      </p>

                      <div className="property-bottom property-bottom-center">
                        <button
                          className="view-btn"
                          onClick={() =>
                          navigate(`/host/booking/${booking.id}`, {
                            state: { booking },
                          })
                        }
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="analytics-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h2>Payment Method Bar Graph</h2>
                    <span>eSewa, Khalti, Cash in Hand</span>
                  </div>
                </div>

                <div className="logic-bar-chart">
                  <div className="chart-y-axis">
                    {[maxChartValue, Math.ceil(maxChartValue * 0.75), Math.ceil(maxChartValue * 0.5), Math.ceil(maxChartValue * 0.25), 0]
                      .filter((value, index, arr) => arr.indexOf(value) === index)
                      .map((tick) => (
                        <div key={tick} className="y-tick-row">
                          <span>{tick}</span>
                          <div className="y-line" />
                        </div>
                      ))}
                  </div>

                  <div className="chart-bars-area">
                    <div className="bars-wrap">
                      {barChartData.map((item) => (
                        <div key={item.label} className="single-bar-group">
                          <div className="bar-number">{item.value}</div>
                          <div
                            className="logic-bar"
                            style={{
                              height: `${Math.max((item.value / maxChartValue) * 260, item.value > 0 ? 40 : 8)}px`,
                            }}
                          />
                          <div className="x-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="x-axis-line" />
                  </div>
                </div>
              </div>

              <div className="chart-card pie-card">
                <div className="chart-header">
                  <div>
                    <h2>Booking by Property</h2>
                    <span>Pie chart according to your property bookings</span>
                  </div>
                </div>

                <div className="pie-layout">
                  <div
                    className="custom-pie-chart"
                    style={{ background: pieGradient }}
                  >
                    <div className="pie-inner-circle">
                      <span>{totalBookings}</span>
                      <small>Bookings</small>
                    </div>
                  </div>

                  <div className="pie-legend">
                    {pieData.length ? (
                      pieData.map((item) => (
                        <div key={item.name} className="legend-item">
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="legend-text">
                            <strong>{item.name}</strong>
                            <small>
                              {item.value} booking{item.value > 1 ? "s" : ""} ({item.percentage}%)
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-text">No property booking data yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;