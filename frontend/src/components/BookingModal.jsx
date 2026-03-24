import React, {useState} from "react";
import api from "../api/axios";
import "../styles/BookingModal.css";


const BookingModal = ({ isOpen, onClose, listing }) => {
   const [step, setStep] = useState(1);
   const [ checkIn, setCheckIn] = useState("");
   const [checkOut,setCheckOut] = useState("");
   const [ guestsCount, setGuestsCount] = useState(1);
   const [specialRequests, setSpecialRequests] = useState("");
   const [booking, setBooking] = useState(null);
   const [loading, setLoading] = useState("");
   const [error, setError] = useState("");


   if (!isOpen || !listing) return null;

   //Calculate nights and total
   const calculateNights = () => {
      if (!checkIn || !checkOut) return 0;
      const diff = new Date(checkOut) - new Date(checkIn);
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 *24)));
   };
    
   const nights = calculateNights();
   const pricePerNight = parseFloat(listing.price_per_night || 0);
   const cleaningFee = parseFloat(listing.cleaning_fee || 0);
   const serviceFee = Math.round(pricePerNight * nights * 0.05 * 100) / 100;
   const total = pricePerNight * nights + cleaningFee + serviceFee;


   // today's date for min date
   const today = new Date().toISOString().split("T")[0];

   const handleNext = () => {
      setError("");
      if (step === 1){
         if (!checkIn || !checkOut){
            setError("Please select check-in and check-out dates.");
            return;
         }
         if (nights <= 0){
            setError("Check-out must be after check-in.");
            return;
         }
         if (guestsCount < 1 || guestsCount > listing.max_guests){
            setError(`Guests must be between 1 and ${listing.max_guests}.`);
            return;
         }
         setStep(2);
      }

   };
   const handleConfirmBooking = async () => {
      setLoading(true);
      setError("");
      try {
         const res = await api.post ("/bookings/", {
            listing: listing.id,
            check_in: checkIn,
            checkOut: checkOut,
            guests_count: guestsCount,
            special_requests: specialRequests,

         });
         setBooking(res.data);
         setStep(3);

      } catch (err) {
         setError(
            err?.response?.data?.check_in?.[0] ||
            err?.response?.data?.detail ||
            "Failed to create booking. Please try again."
         );
      } finally {
         setLoading(false)
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

return(
   <div className="booking-modal-overlay" onClick={handleClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
         <div className="booking-modal-header">
            <h2>
                  {step === 1 && "Select Dates & Guests"}
                  {step === 2 && "Review Your Booking"}
                  {step === 3 && "Booking Confirmed!"}
            </h2>
            <button className="booking-close-btn" onClick={handleClose}>✕</button>
         </div>

         {/* Step Indicator */}
        <div className="booking-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`booking-step ${step >= s ? "active" : ""}`}>
              <div className="step-circle">{s}</div>
              <span>{s === 1 ? "Dates" : s === 2 ? "Review" : "Done"}</span>
            </div>
          ))}
        </div>
         {/* Error */}
        {error && <div className="booking-error">{error}</div>}

         {/* Step 1 — Dates & Guests */}
        {step === 1 && (
          <div className="booking-step-content">
            <div className="booking-listing-info">
              <img
                src={listing.primary_image?.startsWith("http")
                  ? listing.primary_image
                  : `http://127.0.0.1:8000${listing.primary_image}`}
                alt={listing.title}
                className="booking-listing-img"
                onError={(e) => { e.target.style.display = "none"; }}
              />
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
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Price Breakdown */}
        {step === 2 && (
          <div className="booking-step-content">
            <div className="booking-summary">
              <h3>{listing.title}</h3>
              <p>{checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""} · {guestsCount} guest{guestsCount > 1 ? "s" : ""}</p>
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

            <div className="booking-notice">
              <p> Your booking will be <strong>pending</strong> until the host accepts.</p>
              <p> You will only pay <strong>after host accepts</strong>.</p>
            </div>

            <div className="booking-btn-group">
              <button className="booking-btn-secondary" onClick={() => setStep(1)}>
                 Back
              </button>
              <button
                className="booking-btn-primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && booking && (
          <div className="booking-step-content booking-success">
            <div className="success-icon"></div>
            <h3>Booking Request Sent!</h3>
            <p>Your booking for <strong>{listing.title}</strong> has been submitted.</p>

            <div className="booking-breakdown">
              <div className="breakdown-row">
                <span>Booking ID</span>
                <span>{booking.id}</span>
              </div>
              <div className="breakdown-row">
                <span>Check-in</span>
                <span>{booking.check_in}</span>
              </div>
              <div className="breakdown-row">
                <span>Check-out</span>
                <span>{booking.check_out}</span>
              </div>
              <div className="breakdown-row">
                <span>Total Amount</span>
                <span>Rs. {parseFloat(booking.total_amount).toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Status</span>
                <span className="status-pending"> Pending host approval</span>
              </div>
            </div>

            <p className="booking-next-step">
              The host will review your request. Once accepted, you can proceed to payment via Khalti.
            </p>

            <button className="booking-btn-primary" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;












 

