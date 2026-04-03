// import { useState, useEffect } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { ChevronLeft, Star, CreditCard, Wallet, Banknote } from "lucide-react";
// import api, { bookingsAPI, paymentsAPI } from "../api/axios";
// import Navbar from "../components/Navbar";
// import "../styles/CheckoutPage.css";

// const CheckoutPage = () => {
//   const { listingId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { startDate, endDate, guests, specialRequests, listing, nights } = location.state || {};

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const [paymentMethod, setPaymentMethod] = useState("khalti");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   if (!location.state) {
//     return <div className="checkout-error">Invalid access. Please start booking from the property page.</div>;
//   }

//   const pricePerNight = Number(listing.price_per_night);
//   const cleaningFee = Number(listing.cleaning_fee || 0);
//   const serviceFee = (pricePerNight * nights * 0.05);
//   const totalAmount = (pricePerNight * nights) + cleaningFee + serviceFee;

//   const handleConfirmAndPay = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const payload = {
//         listing: listing.id,
//         check_in: startDate.split('T')[0],
//         check_out: endDate.split('T')[0],
//         guests_count: guests.adults + guests.children,
//         special_requests: specialRequests,
//         payment_method: paymentMethod,
//       };

//       const response = await bookingsAPI.createBooking(payload);
//       const booking = response.data;

//       if (paymentMethod === "cash_in_hand") {
//         await paymentsAPI.selectCashInHand(booking.id);
//         alert("Booking confirmed! Please pay at the property.");
//         navigate("/my-bookings");
//       } else if (paymentMethod === "khalti") {
//         const payRes = await paymentsAPI.initiateKhaltiPayment(booking.id);
//         window.location.href = payRes.data.payment_url;
//       } else if (paymentMethod === "esewa") {
//         const payRes = await paymentsAPI.initiateEsewaPayment(booking.id);
//         const { form_url, fields } = payRes.data;
        
//         const form = document.createElement("form");
//         form.method = "POST";
//         form.action = form_url;
//         Object.keys(fields).forEach((key) => {
//           const input = document.createElement("input");
//           input.type = "hidden";
//           input.name = key;
//           input.value = fields[key];
//           form.appendChild(input);
//         });
//         document.body.appendChild(form);
//         form.submit();
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="checkout-page-container">
//       <Navbar />
//       <div className="checkout-main-content">
//         <div className="checkout-header">
//           <button className="back-btn-circle" onClick={() => navigate(-1)}>
//             <ChevronLeft size={24} />
//           </button>
//           <h1>Confirm and pay</h1>
//         </div>

//         <div className="checkout-grid">
//           {/* Left Column: Payment Details */}
//           <div className="checkout-left">
//             <section className="checkout-section">
//               <h2>1. Select payment method</h2>
//               <div className="payment-methods-list">
//                 <label className={`payment-method-card ${paymentMethod === 'khalti' ? 'active' : ''}`}>
//                   <input 
//                     type="radio" 
//                     name="payment" 
//                     value="khalti" 
//                     checked={paymentMethod === 'khalti'} 
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-icon-box khalti"><CreditCard size={20}/></div>
//                   <div className="payment-text">
//                     <p>Khalti</p>
//                     <span>Secure mobile wallet payment</span>
//                   </div>
//                 </label>

//                 <label className={`payment-method-card ${paymentMethod === 'esewa' ? 'active' : ''}`}>
//                   <input 
//                     type="radio" 
//                     name="payment" 
//                     value="esewa" 
//                     checked={paymentMethod === 'esewa'} 
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-icon-box esewa"><Wallet size={20}/></div>
//                   <div className="payment-text">
//                     <p>eSewa</p>
//                     <span>Popular digital wallet in Nepal</span>
//                   </div>
//                 </label>

//                 <label className={`payment-method-card ${paymentMethod === 'cash_in_hand' ? 'active' : ''}`}>
//                   <input 
//                     type="radio" 
//                     name="payment" 
//                     value="cash_in_hand" 
//                     checked={paymentMethod === 'cash_in_hand'} 
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-icon-box cash"><Banknote size={20}/></div>
//                   <div className="payment-text">
//                     <p>Cash in hand</p>
//                     <span>Pay physically at the property</span>
//                   </div>
//                 </label>
//               </div>
//             </section>

//             {specialRequests && (
//                 <section className="checkout-section">
//                     <h2>2. Special Requests</h2>
//                     <p className="request-text-display">{specialRequests}</p>
//                 </section>
//             )}

//             {error && <div className="checkout-error-msg">{error}</div>}

//             <button 
//               className="confirm-pay-btn" 
//               onClick={handleConfirmAndPay}
//               disabled={loading}
//             >
//               {loading ? "Processing..." : paymentMethod === 'cash_in_hand' ? "Confirm Booking" : "Confirm and Pay"}
//             </button>
//           </div>

//           {/* Right Column: Summary Card */}
//           <div className="checkout-right">
//             <div className="summary-sticky-card">
//               <div className="property-brief">
//                  <img 
//                     src={listing.images[0]?.startsWith('http') ? listing.images[0] : `http://127.0.0.1:8000${listing.images[0]}`} 
//                     alt={listing.title} 
//                  />
//                  <div className="brief-info">
//                     <p className="property-category">{listing.category}</p>
//                     <h3>{listing.title}</h3>
//                  </div>
//               </div>

//               <hr className="summary-divider" />

//               <div className="reservation-details">
//                  <div className="detail-row">
//                     <div className="row-header">
//                         <strong>Dates</strong>
//                         <button className="change-btn" onClick={() => navigate(-1)}>Change</button>
//                     </div>
//                     <span>{new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}</span>
//                  </div>
//                  <div className="detail-row">
//                     <div className="row-header">
//                         <strong>Guests</strong>
//                         <button className="change-btn" onClick={() => navigate(-1)}>Change</button>
//                     </div>
//                     <span>{guests.adults} adult{guests.adults > 1 ? 's' : ''}{guests.children > 0 ? `, ${guests.children} child` : ''}{guests.infants > 0 ? `, ${guests.infants} infant` : ''}</span>
//                  </div>
//               </div>

//               <hr className="summary-divider" />

//               <div className="price-breakdown-v2">
//                  <h3>Price details</h3>
//                  <div className="price-row">
//                     <span>Rs. {pricePerNight.toLocaleString()} x {nights} nights</span>
//                     <span>Rs. {(pricePerNight * nights).toLocaleString()}</span>
//                  </div>
//                  <div className="price-row">
//                     <span>Cleaning fee</span>
//                     <span>Rs. {cleaningFee.toLocaleString()}</span>
//                  </div>
//                  <div className="price-row">
//                     <span>Service fee</span>
//                     <span>Rs. {serviceFee.toLocaleString()}</span>
//                  </div>
//                  <div className="total-row-v2">
//                     <span>Total (NPR)</span>
//                     <span>Rs. {totalAmount.toLocaleString()}</span>
//                  </div>
//               </div>
              
//               <div className="cancellation-policy-brief">
//                   <strong>Free cancellation</strong>
//                   <p>Cancel before {new Date(startDate).toLocaleDateString()} for a full refund.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Wallet, Banknote } from "lucide-react";
import Navbar from "../components/Navbar";
import { bookingsAPI, paymentsAPI, platformSettingsAPI } from "../api/axios";
import "../styles/CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceFeePercent, setServiceFeePercent] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchPlatformFee();
  }, []);

  const fetchPlatformFee = async () => {
    try {
      const res = await platformSettingsAPI.getPublicFee();
      setServiceFeePercent(Number(res.data.service_fee_percent || 0));
    } catch (err) {
      console.error("Failed to fetch platform fee:", err);
      setServiceFeePercent(0);
    }
  };

  if (!location.state) {
    return (
      <div className="checkout-error">
        Invalid access. Please start booking from the property page.
      </div>
    );
  }

  const {
    listing,
    startDate,
    endDate,
    guests,
    nights,
    specialRequests,
  } = location.state;

  const pricePerNight = Number(listing?.price_per_night || 0);
  const cleaningFee = Number(listing?.cleaning_fee || 0);

  const roomSubtotal = useMemo(() => {
    return pricePerNight * nights;
  }, [pricePerNight, nights]);

  const serviceFee = useMemo(() => {
    return (roomSubtotal * serviceFeePercent) / 100;
  }, [roomSubtotal, serviceFeePercent]);

  const totalAmount = useMemo(() => {
    return roomSubtotal + cleaningFee + serviceFee;
  }, [roomSubtotal, cleaningFee, serviceFee]);

  const handleConfirmAndPay = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        listing: listing.id,
        check_in: startDate,
        check_out: endDate,
        guests_count: guests.adults + guests.children,
        special_requests: specialRequests || "",
      };

      const response = await bookingsAPI.createBooking(payload);
      const booking = response.data;

      if (paymentMethod === "cash_in_hand") {
        await paymentsAPI.selectCashInHand(booking.id);
        alert("Booking confirmed! Please pay at the property.");
        navigate("/my-bookings");
        return;
      }

      if (paymentMethod === "khalti") {
        const payRes = await paymentsAPI.initiateKhaltiPayment(booking.id);

        if (!payRes?.data?.payment_url) {
          throw new Error("Khalti payment URL not received.");
        }

        window.location.href = payRes.data.payment_url;
        return;
      }

      if (paymentMethod === "esewa") {
        const payRes = await paymentsAPI.initiateEsewaPayment(booking.id);
        const { form_url, fields } = payRes.data || {};

        if (!form_url || !fields) {
          throw new Error("eSewa form data not received.");
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = form_url;

        Object.keys(fields).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      setError("Invalid payment method selected.");
    } catch (err) {
      console.error("Booking/payment error:", err);

      const data = err?.response?.data;

      if (typeof data?.detail === "string") {
        setError(data.detail);
      } else if (data && typeof data === "object") {
        const firstError = Object.values(data)[0];

        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else if (typeof firstError === "string") {
          setError(firstError);
        } else {
          setError("Please check your booking details and try again.");
        }
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <Navbar />

      <div className="checkout-main-content">
        <div className="checkout-header">
          <button
            type="button"
            className="back-btn-circle"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={24} />
          </button>
          <h1>Confirm and pay</h1>
        </div>

        <div className="checkout-grid">
          <div className="checkout-left">
            <section className="checkout-section">
              <h2>1. Select payment method</h2>

              <div className="payment-methods-list">
                <label
                  className={`payment-method-card ${
                    paymentMethod === "khalti" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="khalti"
                    checked={paymentMethod === "khalti"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon-box khalti">
                    <CreditCard size={20} />
                  </div>
                  <div className="payment-text">
                    <p>Khalti</p>
                    <span>Secure mobile wallet payment</span>
                  </div>
                </label>

                <label
                  className={`payment-method-card ${
                    paymentMethod === "esewa" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={paymentMethod === "esewa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon-box esewa">
                    <Wallet size={20} />
                  </div>
                  <div className="payment-text">
                    <p>eSewa</p>
                    <span>Popular digital wallet in Nepal</span>
                  </div>
                </label>

                <label
                  className={`payment-method-card ${
                    paymentMethod === "cash_in_hand" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash_in_hand"
                    checked={paymentMethod === "cash_in_hand"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon-box cash">
                    <Banknote size={20} />
                  </div>
                  <div className="payment-text">
                    <p>Cash in hand</p>
                    <span>Pay physically at the property</span>
                  </div>
                </label>
              </div>
            </section>

            {specialRequests && (
              <section className="checkout-section">
                <h2>2. Special Requests</h2>
                <p className="request-text-display">{specialRequests}</p>
              </section>
            )}

            {error && <div className="checkout-error-msg">{error}</div>}

            <button
              type="button"
              className="confirm-pay-btn"
              onClick={handleConfirmAndPay}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "cash_in_hand"
                ? "Confirm Booking"
                : "Confirm and Pay"}
            </button>
          </div>

          <div className="checkout-right">
            <div className="summary-sticky-card">
              <div className="property-brief">
                <img
                  src={
                    listing?.images?.[0]?.startsWith("http")
                      ? listing.images[0]
                      : `http://127.0.0.1:8000${listing?.images?.[0] || ""}`
                  }
                  alt={listing.title}
                />
                <div className="brief-info">
                  <p className="property-category">{listing.category}</p>
                  <h3>{listing.title}</h3>
                </div>
              </div>

              <hr className="summary-divider" />

              <div className="reservation-details">
                <div className="detail-row">
                  <div className="row-header">
                    <strong>Dates</strong>
                    <button
                      type="button"
                      className="change-btn"
                      onClick={() => navigate(-1)}
                    >
                      Change
                    </button>
                  </div>
                  <span>
                    {new Date(startDate).toLocaleDateString()} –{" "}
                    {new Date(endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-row">
                  <div className="row-header">
                    <strong>Guests</strong>
                    <button
                      type="button"
                      className="change-btn"
                      onClick={() => navigate(-1)}
                    >
                      Change
                    </button>
                  </div>
                  <span>
                    {guests.adults} adult{guests.adults > 1 ? "s" : ""}
                    {guests.children > 0
                      ? `, ${guests.children} child${guests.children > 1 ? "ren" : ""}`
                      : ""}
                    {guests.infants > 0
                      ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </div>
              </div>

              <hr className="summary-divider" />

              <div className="price-breakdown-v2">
                <h3>Price details</h3>

                <div className="price-row">
                  <span>
                    Rs. {pricePerNight.toLocaleString()} x {nights} nights
                  </span>
                  <span>Rs. {roomSubtotal.toLocaleString()}</span>
                </div>

                <div className="price-row">
                  <span>Cleaning fee</span>
                  <span>Rs. {cleaningFee.toLocaleString()}</span>
                </div>

                <div className="price-row">
                  <span>Service fee ({serviceFeePercent}%)</span>
                  <span>Rs. {serviceFee.toLocaleString()}</span>
                </div>

                <div className="total-row-v2">
                  <span>Total (NPR)</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="cancellation-policy-brief">
                <strong>Free cancellation</strong>
                <p>
                  Cancel before {new Date(startDate).toLocaleDateString()} for a
                  full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;