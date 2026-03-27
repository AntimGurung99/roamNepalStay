import React, { useState } from "react";
import api from "../api/axios";
import "../styles/BookingModal.css";

const BookingModal = ({ isOpen, onClose, listing }) => {
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  if (!isOpen || !listing) return null;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const pricePerNight = parseFloat(listing.price_per_night || 0);
  const cleaningFee = parseFloat(listing.cleaning_fee || 0);
  const serviceFee = Math.round(pricePerNight * nights * 0.05 * 100) / 100;
  const total = pricePerNight * nights + cleaningFee + serviceFee;
  const today = new Date().toISOString().split("T")[0];

  const handleNext = () => {
    setError("");
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (guestsCount < 1 || guestsCount > listing.max_guests) {
      setError(`Guests must be between 1 and ${listing.max_guests}.`);
      return;
    }
    setStep(2);
  };

  // Step 1: Create booking then initiate Khalti payment
  const handlePayNow = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      // Step 1 — Create booking
      const bookingRes = await api.post("/bookings/", {
        listing: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
        special_requests: specialRequests,
      });

      const newBooking = bookingRes.data;
      setBooking(newBooking);

      // Step 2 — Initiate Khalti payment
      const paymentRes = await api.post(
        `/bookings/${newBooking.id}/initiate-payment/`,
        {}
      );

      const { payment_url } = paymentRes.data;

      if (payment_url) {
        // Save booking id for after redirect
        localStorage.setItem("pending_booking_id", newBooking.id);
        localStorage.setItem("pending_booking_pidx", paymentRes.data.pidx);

        // Redirect to Khalti
        window.location.href = payment_url;
      } else {
        setError("Failed to get payment URL. Please try again.");
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.check_in?.[0] ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(errMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCheckIn("");
    setCheckOut("");
    setGuestsCount(1);
    setSpecialRequests("");
    setBooking(null);
    setError("");
    onClose();
  };

  return (
    <div className="booking-modal-overlay" onClick={handleClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="booking-modal-header">
          <h2>
            {step === 1 && "Select Dates & Guests"}
            {step === 2 && "Review & Pay"}
          </h2>
          <button className="booking-close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Step Indicator */}
        <div className="booking-steps">
          {[1, 2].map((s) => (
            <div key={s} className={`booking-step ${step >= s ? "active" : ""}`}>
              <div className="step-circle">{s}</div>
              <span>{s === 1 ? "Dates" : "Pay"}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div className="booking-error">{error}</div>}

        {/* Step 1 — Dates & Guests */}
        {step === 1 && (
          <div className="booking-step-content">
            <div className="booking-listing-info">
              {listing.primary_image && (
                <img
                  src={
                    listing.primary_image?.startsWith("http")
                      ? listing.primary_image
                      : `http://127.0.0.1:8000${listing.primary_image}`
                  }
                  alt={listing.title}
                  className="booking-listing-img"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              <div>
                <h3>{listing.title}</h3>
                <p>{listing.city}, {listing.country}</p>
                <p className="booking-price">Rs. {listing.price_per_night} / night</p>
              </div>
            </div>

            <div className="booking-dates">
              <div className="date-field">
                <label>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut("");
                  }}
                />
              </div>
              <div className="date-field">
                <label>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="nights-preview">
                {nights} night{nights > 1 ? "s" : ""} · Rs. {total.toFixed(2)} total
              </div>
            )}

            <div className="booking-guests">
              <label>Guests (max {listing.max_guests})</label>
              <div className="guest-counter">
                <button
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  type="button"
                >−</button>
                <span>{guestsCount}</span>
                <button
                  onClick={() => setGuestsCount(Math.min(listing.max_guests, guestsCount + 1))}
                  type="button"
                >+</button>
              </div>
            </div>

            <div className="booking-special">
              <label>Special Requests (optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests..."
                rows={3}
              />
            </div>

            <button className="booking-btn-primary" onClick={handleNext}>
              Continue 
            </button>
          </div>
        )}

        {/* Step 2 — Review & Pay */}
        {step === 2 && (
          <div className="booking-step-content">
            <div className="booking-summary">
              <h3>{listing.title}</h3>
              <p>
                {checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""} · {guestsCount} guest{guestsCount > 1 ? "s" : ""}
              </p>
            </div>

            <div className="booking-breakdown">
              <div className="breakdown-row">
                <span>Rs. {pricePerNight} × {nights} nights</span>
                <span>Rs. {(pricePerNight * nights).toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Cleaning fee</span>
                <span>Rs. {cleaningFee.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Service fee (5%)</span>
                <span>Rs. {serviceFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="breakdown-row total">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Khalti payment info */}
            <div className="khalti-info">
              <img
                src="https://web.khalti.com/static/img/logo1.png"
                alt="Khalti"
                style={{ height: "28px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <p>You will be redirected to Khalti to complete payment securely.</p>
            </div>

            <div className="booking-notice">
              <p>Booking is <strong>confirmed immediately</strong> after payment.</p>
              <p>Host will be notified after your payment.</p>
              <p>Same dates will be blocked for other guests.</p>
            </div>

            <div className="booking-btn-group">
              <button
                className="booking-btn-secondary"
                onClick={() => setStep(1)}
                disabled={paymentLoading}
              >
                ← Back
              </button>
              <button
                className="booking-btn-khalti"
                onClick={handlePayNow}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Pay with Khalti"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;