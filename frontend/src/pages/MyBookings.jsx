import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/MyBookings.css"
import {
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaTimesCircle,
  FaFlagCheckered,
} from "react-icons/fa";
import { RiHomeHeartFill,} from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { MdNightsStay } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import khaltiLogo from "../images/khalti.png";

const MyBookings = () => {
    const [ bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    useEffect(() => {
      fetchBookings();
    }, []);


    const fetchBookings = async() => {
      try {
        const res = await api.get("/bookings/my/");
        setBookings(res.data.results || res.data);

      } catch (err){
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    const handlePayNow = async (booking) => {
      try{
        const res = await api.post(`/bookings/${booking.id}/initiate-payment/`, {});
        const { payment_url, pidx } = res.data;
      if (payment_url) {
        localStorage.setItem("pending_booking_id", booking.id);
        localStorage.setItem("pending_booking_pidx", pidx);
        window.location.href = payment_url;
      }
       } catch (err) {
      alert(err?.response?.data?.error || "Failed to initiate payment.");
      }
      };

    const getStatusColor = (status) => {
      const colors = {
        pending: "#d22ea0",
        confirmed: "#093187",
        paid: "#084d21",
        cancelled: "#c51919",
        completed: "#657411f2",
    };
    return colors[status] || "#6b7280";
    };

  const iconStyle = {marginRight:"6px", verticalAlign: "middle"}

  const getStatusLabel = (status) => {
    const labels = {
    pending: (
      <>
        <FaClock style={iconStyle} />
        Pending
      </>
    ),
    confirmed: (
      <>
        <FaCheckCircle style={iconStyle} />
        Confirmed
      </>
    ),
    paid: (
      <>
        <FaCreditCard style={iconStyle} />
        Paid
      </>
    ),
    cancelled: (
      <>
        <FaTimesCircle style={iconStyle} />
        Cancelled
      </>
    ),
    completed: (
      <>
        <FaFlagCheckered style={{ marginRight: "5px" }} />
        Completed
      </>
    ),
  };

  return labels[status] || status;
  };

  return (
    <div className="page-container">
       <Navbar />
       <div className="content">
          <div className="header">
          <h1>My Bookings</h1>
          <p>Where you’ve been and where you’re headed—it's all here</p>
        </div>
          {loading && <div className="center"> please stay clamly your    booking details is loading..</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && bookings.length === 0 && (
          <div className="empty-box">
             <div className="icon">
                <RiHomeHeartFill size={50} color="#ff4d4d" />
             </div>
            <h3>No bookings yet</h3>
            <p>Explore listings and make your first booking!</p>
            <button onClick={() => navigate("/home")}>
              Explore Listings
            </button>
          </div>
        )}
        
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="card-flex">

                {/* Image */}
                {booking.listing_image ? (
                  <img
                    src={booking.listing_image}
                    alt={booking.listing_title}
                    className="booking-img"
                  />
                ) : (
                   <div className="img-placeholder">
                    <RiHomeHeartFill size={35} color="#9ca3af" />
                  </div>
                )}

                {/* Details */}
                <div className="details">
                  <div className="top-row">
                    <h3>{booking.listing_title}</h3>
                    <span
                      className="status-badge"
                      style={{
                        background: `${getStatusColor(booking.status)}20`,
                        color: getStatusColor(booking.status),
                      }}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <p className="location"><IoLocationOutline />{booking.listing_city}</p>

                  <div className="info-row">
                    <span><SlCalender />{booking.check_in} → {booking.check_out}</span>
                    <span><IoPeopleSharp />{booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}</span>
                    <span><MdNightsStay />{booking.total_nights} night{booking.total_nights > 1 ? "s" : ""}</span>
                  </div>

                  <div className="bottom-row">
                    <div>
                      <span className="price">
                        Rs.{parseFloat(booking.total_amount).toFixed(2)}
                      </span>
                      <span
                        className={`payment-status ${
                          booking.payment_status === "paid" ? "paid" : "unpaid"
                        }`}
                      >
                        {booking.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="khalti-section">
                       <img src={khaltiLogo} alt="Khalti Logo" className="khalti-logo" />
                    {booking.status === "confirmed" &&
                      booking.payment_status === "unpaid" && (
                        <button
                          className="pay-btn"
                          onClick={() => handlePayNow(booking)}
                        >
                          Pay with Khalti
                        </button>
                      )}
                      </div>

                    {booking.payment_status === "paid" && (
                      <span className="paid-badge">
                        Payment Complete
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
        


      



  

