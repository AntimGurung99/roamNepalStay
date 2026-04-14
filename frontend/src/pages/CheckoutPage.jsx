// // import { useState, useEffect } from "react";
// // import { useLocation, useNavigate, useParams } from "react-router-dom";
// // import { ChevronLeft, Star, CreditCard, Wallet, Banknote } from "lucide-react";
// // import api, { bookingsAPI, paymentsAPI } from "../api/axios";
// // import Navbar from "../components/Navbar";
// // import "../styles/CheckoutPage.css";

// // const CheckoutPage = () => {
// //   const { listingId } = useParams();
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { startDate, endDate, guests, specialRequests, listing, nights } = location.state || {};

// //   useEffect(() => {
// //     window.scrollTo(0, 0);
// //   }, []);

// //   const [paymentMethod, setPaymentMethod] = useState("khalti");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   if (!location.state) {
// //     return <div className="checkout-error">Invalid access. Please start booking from the property page.</div>;
// //   }

// //   const pricePerNight = Number(listing.price_per_night);
// //   const cleaningFee = Number(listing.cleaning_fee || 0);
// //   const serviceFee = (pricePerNight * nights * 0.05);
// //   const totalAmount = (pricePerNight * nights) + cleaningFee + serviceFee;

// //   const handleConfirmAndPay = async () => {
// //     try {
// //       setLoading(true);
// //       setError("");

// //       const payload = {
// //         listing: listing.id,
// //         check_in: startDate.split('T')[0],
// //         check_out: endDate.split('T')[0],
// //         guests_count: guests.adults + guests.children,
// //         special_requests: specialRequests,
// //         payment_method: paymentMethod,
// //       };

// //       const response = await bookingsAPI.createBooking(payload);
// //       const booking = response.data;

// //       if (paymentMethod === "cash_in_hand") {
// //         await paymentsAPI.selectCashInHand(booking.id);
// //         alert("Booking confirmed! Please pay at the property.");
// //         navigate("/my-bookings");
// //       } else if (paymentMethod === "khalti") {
// //         const payRes = await paymentsAPI.initiateKhaltiPayment(booking.id);
// //         window.location.href = payRes.data.payment_url;
// //       } else if (paymentMethod === "esewa") {
// //         const payRes = await paymentsAPI.initiateEsewaPayment(booking.id);
// //         const { form_url, fields } = payRes.data;
        
// //         const form = document.createElement("form");
// //         form.method = "POST";
// //         form.action = form_url;
// //         Object.keys(fields).forEach((key) => {
// //           const input = document.createElement("input");
// //           input.type = "hidden";
// //           input.name = key;
// //           input.value = fields[key];
// //           form.appendChild(input);
// //         });
// //         document.body.appendChild(form);
// //         form.submit();
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="checkout-page-container">
// //       <Navbar />
// //       <div className="checkout-main-content">
// //         <div className="checkout-header">
// //           <button className="back-btn-circle" onClick={() => navigate(-1)}>
// //             <ChevronLeft size={24} />
// //           </button>
// //           <h1>Confirm and pay</h1>
// //         </div>

// //         <div className="checkout-grid">
// //           {/* Left Column: Payment Details */}
// //           <div className="checkout-left">
// //             <section className="checkout-section">
// //               <h2>1. Select payment method</h2>
// //               <div className="payment-methods-list">
// //                 <label className={`payment-method-card ${paymentMethod === 'khalti' ? 'active' : ''}`}>
// //                   <input 
// //                     type="radio" 
// //                     name="payment" 
// //                     value="khalti" 
// //                     checked={paymentMethod === 'khalti'} 
// //                     onChange={(e) => setPaymentMethod(e.target.value)}
// //                   />
// //                   <div className="payment-icon-box khalti"><CreditCard size={20}/></div>
// //                   <div className="payment-text">
// //                     <p>Khalti</p>
// //                     <span>Secure mobile wallet payment</span>
// //                   </div>
// //                 </label>

// //                 <label className={`payment-method-card ${paymentMethod === 'esewa' ? 'active' : ''}`}>
// //                   <input 
// //                     type="radio" 
// //                     name="payment" 
// //                     value="esewa" 
// //                     checked={paymentMethod === 'esewa'} 
// //                     onChange={(e) => setPaymentMethod(e.target.value)}
// //                   />
// //                   <div className="payment-icon-box esewa"><Wallet size={20}/></div>
// //                   <div className="payment-text">
// //                     <p>eSewa</p>
// //                     <span>Popular digital wallet in Nepal</span>
// //                   </div>
// //                 </label>

// //                 <label className={`payment-method-card ${paymentMethod === 'cash_in_hand' ? 'active' : ''}`}>
// //                   <input 
// //                     type="radio" 
// //                     name="payment" 
// //                     value="cash_in_hand" 
// //                     checked={paymentMethod === 'cash_in_hand'} 
// //                     onChange={(e) => setPaymentMethod(e.target.value)}
// //                   />
// //                   <div className="payment-icon-box cash"><Banknote size={20}/></div>
// //                   <div className="payment-text">
// //                     <p>Cash in hand</p>
// //                     <span>Pay physically at the property</span>
// //                   </div>
// //                 </label>
// //               </div>
// //             </section>

// //             {specialRequests && (
// //                 <section className="checkout-section">
// //                     <h2>2. Special Requests</h2>
// //                     <p className="request-text-display">{specialRequests}</p>
// //                 </section>
// //             )}

// //             {error && <div className="checkout-error-msg">{error}</div>}

// //             <button 
// //               className="confirm-pay-btn" 
// //               onClick={handleConfirmAndPay}
// //               disabled={loading}
// //             >
// //               {loading ? "Processing..." : paymentMethod === 'cash_in_hand' ? "Confirm Booking" : "Confirm and Pay"}
// //             </button>
// //           </div>

// //           {/* Right Column: Summary Card */}
// //           <div className="checkout-right">
// //             <div className="summary-sticky-card">
// //               <div className="property-brief">
// //                  <img 
// //                     src={listing.images[0]?.startsWith('http') ? listing.images[0] : `http://127.0.0.1:8000${listing.images[0]}`} 
// //                     alt={listing.title} 
// //                  />
// //                  <div className="brief-info">
// //                     <p className="property-category">{listing.category}</p>
// //                     <h3>{listing.title}</h3>
// //                  </div>
// //               </div>

// //               <hr className="summary-divider" />

// //               <div className="reservation-details">
// //                  <div className="detail-row">
// //                     <div className="row-header">
// //                         <strong>Dates</strong>
// //                         <button className="change-btn" onClick={() => navigate(-1)}>Change</button>
// //                     </div>
// //                     <span>{new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}</span>
// //                  </div>
// //                  <div className="detail-row">
// //                     <div className="row-header">
// //                         <strong>Guests</strong>
// //                         <button className="change-btn" onClick={() => navigate(-1)}>Change</button>
// //                     </div>
// //                     <span>{guests.adults} adult{guests.adults > 1 ? 's' : ''}{guests.children > 0 ? `, ${guests.children} child` : ''}{guests.infants > 0 ? `, ${guests.infants} infant` : ''}</span>
// //                  </div>
// //               </div>

// //               <hr className="summary-divider" />

// //               <div className="price-breakdown-v2">
// //                  <h3>Price details</h3>
// //                  <div className="price-row">
// //                     <span>Rs. {pricePerNight.toLocaleString()} x {nights} nights</span>
// //                     <span>Rs. {(pricePerNight * nights).toLocaleString()}</span>
// //                  </div>
// //                  <div className="price-row">
// //                     <span>Cleaning fee</span>
// //                     <span>Rs. {cleaningFee.toLocaleString()}</span>
// //                  </div>
// //                  <div className="price-row">
// //                     <span>Service fee</span>
// //                     <span>Rs. {serviceFee.toLocaleString()}</span>
// //                  </div>
// //                  <div className="total-row-v2">
// //                     <span>Total (NPR)</span>
// //                     <span>Rs. {totalAmount.toLocaleString()}</span>
// //                  </div>
// //               </div>
              
// //               <div className="cancellation-policy-brief">
// //                   <strong>Free cancellation</strong>
// //                   <p>Cancel before {new Date(startDate).toLocaleDateString()} for a full refund.</p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CheckoutPage;
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {  ChevronLeft,Banknote } from "lucide-react";
// import Navbar from "../components/Navbar";
// import { bookingsAPI, paymentsAPI, platformSettingsAPI } from "../api/axios";
// import "../styles/CheckoutPage.css";
// const API_BASE = "http://127.0.0.1:8000";

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [paymentMethod, setPaymentMethod] = useState("khalti");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [serviceFeePercent, setServiceFeePercent] = useState(0);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   useEffect(() => {
//     fetchPlatformFee();
//   }, []);

//   const fetchPlatformFee = async () => {
//     try {
//       const res = await platformSettingsAPI.getPublicFee();
//       setServiceFeePercent(Number(res.data.service_fee_percent || 0));
//     } catch (err) {
//       console.error("Failed to fetch platform fee:", err);
//       setServiceFeePercent(0);
//     }
//   };

//   if (!location.state) {
//     return (
//       <div className="checkout-error">
//         Invalid access. Please start booking from the property page.
//       </div>
//     );
//   }

//   const {
//     listing,
//     startDate,
//     endDate,
//     guests,
//     nights,
//     specialRequests,
//   } = location.state;

//   const normalizeImageUrl = (img) => {
//   if (!img) return "";

//   let rawValue = "";

//   if (typeof img === "string") {
//     rawValue = img;
//   } else if (typeof img === "object") {
//     rawValue = img.image || img.url || "";
//   }

//   if (!rawValue) return "";

//   if (
//     rawValue.startsWith("http://") ||
//     rawValue.startsWith("https://") ||
//     rawValue.startsWith("blob:")
//   ) {
//     return rawValue;
//   }

//   return `${API_BASE}${rawValue}`;
// };

// const previewImage = useMemo(() => {
//   if (Array.isArray(listing?.images) && listing.images.length > 0) {
//     const normalized = normalizeImageUrl(listing.images[0]);
//     if (normalized) return normalized;
//   }

//   if (listing?.primary_image) {
//     const normalizedPrimary = normalizeImageUrl(listing.primary_image);
//     if (normalizedPrimary) return normalizedPrimary;
//   }

//   if (Array.isArray(listing?.all_images) && listing.all_images.length > 0) {
//     const normalizedFallback = normalizeImageUrl(listing.all_images[0]);
//     if (normalizedFallback) return normalizedFallback;
//   }

//     return "";
//   }, [listing]);

//   const pricePerNight = Number(listing?.price_per_night || 0);
//   const cleaningFee = Number(listing?.cleaning_fee || 0);

//   const roomSubtotal = useMemo(() => {
//     return pricePerNight * nights;
//   }, [pricePerNight, nights]);

//   const serviceFee = useMemo(() => {
//     return (roomSubtotal * serviceFeePercent) / 100;
//   }, [roomSubtotal, serviceFeePercent]);

//   const totalAmount = useMemo(() => {
//     return roomSubtotal + cleaningFee + serviceFee;
//   }, [roomSubtotal, cleaningFee, serviceFee]);

//   const handleConfirmAndPay = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const payload = {
//         listing: listing.id,
//         check_in: startDate,
//         check_out: endDate,
//         guests_count: guests.adults + guests.children,
//         special_requests: specialRequests || "",
//       };

//       const response = await bookingsAPI.createBooking(payload);
//       const booking = response.data;

//       if (paymentMethod === "cash_in_hand") {
//         await paymentsAPI.selectCashInHand(booking.id);
//         alert("Booking confirmed! Please pay at the property.");
//         navigate("/my-bookings");
//         return;
//       }

//       if (paymentMethod === "khalti") {
//         const payRes = await paymentsAPI.initiateKhaltiPayment(booking.id);

//         if (!payRes?.data?.payment_url) {
//           throw new Error("Khalti payment URL not received.");
//         }

//         window.location.href = payRes.data.payment_url;
//         return;
//       }

//       if (paymentMethod === "esewa") {
//         const payRes = await paymentsAPI.initiateEsewaPayment(booking.id);
//         const { form_url, fields } = payRes.data || {};

//         if (!form_url || !fields) {
//           throw new Error("eSewa form data not received.");
//         }

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
//         return;
//       }

//       setError("Invalid payment method selected.");
//     } catch (err) {
//       console.error("Booking/payment error:", err);

//       const data = err?.response?.data;

//       if (typeof data?.detail === "string") {
//         setError(data.detail);
//       } else if (data && typeof data === "object") {
//         const firstError = Object.values(data)[0];

//         if (Array.isArray(firstError)) {
//           setError(firstError[0]);
//         } else if (typeof firstError === "string") {
//           setError(firstError);
//         } else {
//           setError("Please check your booking details and try again.");
//         }
//       } else if (err?.message) {
//         setError(err.message);
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="checkout-page-container">
//       <Navbar />

//       <div className="checkout-main-content">
//         <div className="checkout-header">
//           <button
//             type="button"
//             className="back-btn-circle"
//             onClick={() => navigate(-1)}
//           >
//             <ChevronLeft size={24} />
//           </button>
//           <h1>Confirm and pay</h1>
//         </div>

//         <div className="checkout-grid">
//           <div className="checkout-left">
//             <section className="checkout-section">
//               <h2>1. Select payment method</h2>

//               <div className="payment-methods-list">
//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "khalti" ? "active" : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="khalti"
//                     checked={paymentMethod === "khalti"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-logo-box">
//                     <img src="../images/khalti.png" alt="Khalti" className="payment-logo-img" />
//                   </div>
//                   <div className="payment-text">
//                     <p>Khalti</p>
//                     <span>Secure mobile wallet payment</span>
//                   </div>
//                 </label>

//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "esewa" ? "active" : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="esewa"
//                     checked={paymentMethod === "esewa"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-logo-box">
//                     <img src="../images/Esewa_logo.webp" alt="eSewa" className="payment-logo-img" />
//                   </div>
//                   <div className="payment-text">
//                     <p>eSewa</p>
//                     <span>Popular digital wallet in Nepal</span>
//                   </div>
//                 </label>

//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "cash_in_hand" ? "active" : ""
//                   }`}
//                 >
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="cash_in_hand"
//                   checked={paymentMethod === "cash_in_hand"}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                 />
//                 <div className="payment-icon-box cash">
//                   <Banknote size={20} />
//                 </div>
//                 <div className="payment-text">
//                   <p>Cash in hand</p>
//                   <span>Pay physically at the property</span>
//                 </div>
//               </label>
//             </div>
//             </section>

//             {specialRequests && (
//               <section className="checkout-section">
//                 <h2>2. Special Requests</h2>
//                 <p className="request-text-display">{specialRequests}</p>
//               </section>
//             )}

//             {error && <div className="checkout-error-msg">{error}</div>}

//             <button
//               type="button"
//               className="confirm-pay-btn"
//               onClick={handleConfirmAndPay}
//               disabled={loading}
//             >
//               {loading
//                 ? "Processing..."
//                 : paymentMethod === "cash_in_hand"
//                 ? "Confirm Booking"
//                 : "Confirm and Pay"}
//             </button>
//           </div>

//           <div className="checkout-right">
//             <div className="summary-sticky-card">
//               <div className="property-brief">
//                 {previewImage ? (
//                     <img
//                       src={previewImage}
//                       alt={listing.title}
//                       onError={(e) => {
//                         e.currentTarget.style.display = "none";
//                       }}
//                     />
//                   ) : (
//                     <div className="checkout-image-placeholder">No photo</div>
//                   )}
//                 <div className="brief-info">
//                   <p className="property-category">{listing.category}</p>
//                   <h3>{listing.title}</h3>
//                 </div>
//               </div>

//               <hr className="summary-divider" />

//               <div className="reservation-details">
//                 <div className="detail-row">
//                   <div className="row-header">
//                     <strong>Dates</strong>
//                     <button
//                       type="button"
//                       className="change-btn"
//                       onClick={() => navigate(-1)}
//                     >
//                       Change
//                     </button>
//                   </div>
//                   <span>
//                     {new Date(startDate).toLocaleDateString()} –{" "}
//                     {new Date(endDate).toLocaleDateString()}
//                   </span>
//                 </div>

//                 <div className="detail-row">
//                   <div className="row-header">
//                     <strong>Guests</strong>
//                     <button
//                       type="button"
//                       className="change-btn"
//                       onClick={() => navigate(-1)}
//                     >
//                       Change
//                     </button>
//                   </div>
//                   <span>
//                     {guests.adults} adult{guests.adults > 1 ? "s" : ""}
//                     {guests.children > 0
//                       ? `, ${guests.children} child${guests.children > 1 ? "ren" : ""}`
//                       : ""}
//                     {guests.infants > 0
//                       ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`
//                       : ""}
//                   </span>
//                 </div>
//               </div>

//               <hr className="summary-divider" />

//               <div className="price-breakdown-v2">
//                 <h3>Price details</h3>

//                 <div className="price-row">
//                   <span>
//                     Rs. {pricePerNight.toLocaleString()} x {nights} nights
//                   </span>
//                   <span>Rs. {roomSubtotal.toLocaleString()}</span>
//                 </div>

//                 <div className="price-row">
//                   <span>Cleaning fee</span>
//                   <span>Rs. {cleaningFee.toLocaleString()}</span>
//                 </div>

//                 <div className="price-row">
//                   <span>Service fee ({serviceFeePercent}%)</span>
//                   <span>Rs. {serviceFee.toLocaleString()}</span>
//                 </div>

//                 <div className="total-row-v2">
//                   <span>Total (NPR)</span>
//                   <span>Rs. {totalAmount.toLocaleString()}</span>
//                 </div>
//               </div>

//               <div className="cancellation-policy-brief">
//                 <strong>Free cancellation</strong>
//                 <p>
//                   Cancel before {new Date(startDate).toLocaleDateString()} for a
//                   full refund.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;


// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { ChevronLeft, Banknote } from "lucide-react";
// import axios from "axios";
// import khaltiLogo from "../images/khalti.png";
// import esewaLogo from "../images/Esewa_logo.webp";
// import "../styles/CheckoutPage.css";
// import Navbar from "../components/Navbar";

// const API_BASE = "http://127.0.0.1:8000";

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { id } = useParams();

//   const [paymentMethod, setPaymentMethod] = useState("khalti");
//   const [loading, setLoading] = useState(false);
//   const [feeSettings, setFeeSettings] = useState({
//     fee_0_to_2000_percent: 0,
//     fee_2001_to_6000_percent: 0,
//     fee_6001_and_above_percent: 0,
//   });

//   const stateData = location.state || {};

//   const listing = stateData.listing || {};
//   const startDate = stateData.startDate || "";
//   const endDate = stateData.endDate || "";
//   const nights = Number(stateData.nights || 1);
//   const specialRequests = stateData.specialRequests || "";

//   const guests = stateData.guests || {
//     adults: 1,
//     children: 0,
//     infants: 0,
//     pets: 0,
//   };

//   const normalizeImageUrl = (img) => {
//     if (!img) return "";

//     let rawValue = "";

//     if (typeof img === "string") {
//       rawValue = img;
//     } else if (typeof img === "object") {
//       rawValue = img.image || img.url || img.src || "";
//     }

//     if (!rawValue) return "";

//     if (
//       rawValue.startsWith("http://") ||
//       rawValue.startsWith("https://") ||
//       rawValue.startsWith("blob:")
//     ) {
//       return rawValue;
//     }

//     return `${API_BASE}${rawValue}`;
//   };

//   const previewImage = useMemo(() => {
//     if (Array.isArray(listing?.images) && listing.images.length > 0) {
//       const normalized = normalizeImageUrl(listing.images[0]);
//       if (normalized) return normalized;
//     }

//     if (listing?.primary_image) {
//       const normalizedPrimary = normalizeImageUrl(listing.primary_image);
//       if (normalizedPrimary) return normalizedPrimary;
//     }

//     if (Array.isArray(listing?.all_images) && listing.all_images.length > 0) {
//       const normalizedFallback = normalizeImageUrl(listing.all_images[0]);
//       if (normalizedFallback) return normalizedFallback;
//     }

//     return "";
//   }, [listing]);

//   const safePricePerNight = Number(
//     listing?.price_per_night || listing?.price || 0
//   );

//   const cleaningFee = Number(listing?.cleaning_fee || 0);

//   const subtotal = safePricePerNight * nights;

//   const selectedServiceFeePercent = useMemo(() => {
//     if (safePricePerNight <= 2000) {
//       return feeSettings.fee_0_to_2000_percent;
//     }

//     if (safePricePerNight <= 6000) {
//       return feeSettings.fee_2001_to_6000_percent;
//     }

//     return feeSettings.fee_6001_and_above_percent;
//   }, [safePricePerNight, feeSettings]);

//   const serviceFee = useMemo(() => {
//     return Math.round((subtotal * selectedServiceFeePercent) / 100);
//   }, [subtotal, selectedServiceFeePercent]);

//   const total = subtotal + cleaningFee + serviceFee;

//   const totalGuestCount =
//     Number(guests?.adults || 0) +
//     Number(guests?.children || 0) +
//     Number(guests?.infants || 0);

//   const formatCurrency = (amount) => {
//     return `Rs. ${Number(amount || 0).toLocaleString()}`;
//   };

//   const formatGuestText = () => {
//     const parts = [];

//     if (guests?.adults) {
//       parts.push(`${guests.adults} adult${guests.adults > 1 ? "s" : ""}`);
//     }

//     if (guests?.children) {
//       parts.push(
//         `${guests.children} child${guests.children > 1 ? "ren" : ""}`
//       );
//     }

//     if (guests?.infants) {
//       parts.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
//     }

//     if (guests?.pets) {
//       parts.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);
//     }

//     return parts.length > 0 ? parts.join(", ") : "1 adult";
//   };

//   const fetchPlatformFee = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");

//       const res = await axios.get(`${API_BASE}/api/platform-settings/public-fee/`, {
//         headers: token
//           ? {
//               Authorization: `Bearer ${token}`,
//             }
//           : {},
//       });

//       setFeeSettings({
//         fee_0_to_2000_percent: Number(res.data.fee_0_to_2000_percent || 0),
//         fee_2001_to_6000_percent: Number(res.data.fee_2001_to_6000_percent || 0),
//         fee_6001_and_above_percent: Number(
//           res.data.fee_6001_and_above_percent || 0
//         ),
//       });
//     } catch (err) {
//       console.error("Failed to fetch platform fee:", err);
//       setFeeSettings({
//         fee_0_to_2000_percent: 0,
//         fee_2001_to_6000_percent: 0,
//         fee_6001_and_above_percent: 0,
//       });
//     }
//   };

//   useEffect(() => {
//     fetchPlatformFee();
//   }, []);

//   const handleConfirmBooking = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select valid booking dates.");
//       return;
//     }

//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       alert("Please login first.");
//       navigate("/login");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         listing: Number(id || listing?.id),
//         check_in: startDate,
//         check_out: endDate,
//         guests_count: totalGuestCount,
//         special_requests: specialRequests || "",
//       };

//       const response = await axios.post(`${API_BASE}/api/bookings/`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       alert("Booking created successfully!");

//       navigate("/my-bookings", {
//         state: {
//           bookingCreated: true,
//           booking: response.data,
//           selectedPaymentMethod: paymentMethod,
//         },
//       });
//     } catch (error) {
//       console.error("Booking error:", error);

//       const errorMessage =
//         error?.response?.data?.detail ||
//         error?.response?.data?.message ||
//         Object.values(error?.response?.data || {})?.[0]?.[0] ||
//         "Something went wrong while creating the booking.";

//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!listing || Object.keys(listing).length === 0) {
//     return (
//       <div className="checkout-page">
//         <div className="checkout-container">
//           <div className="checkout-left">
//             <button className="back-btn" onClick={() => navigate(-1)}>
//               <ChevronLeft size={20} />
//               Back
//             </button>

//             <h2 className="checkout-title">Checkout</h2>
//             <p>Booking data not found. Please go back and select dates again.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="checkout-page">
//         <div className="checkout-container">
//           <div className="checkout-left">
//             <button className="back-btn" onClick={() => navigate(-1)}>
//               <ChevronLeft size={20} />
//               Back
//             </button>

//             <h1 className="checkout-title">Confirm and pay</h1>

//             <div className="checkout-section">
//               <h2 className="checkout-section-title">1. Select payment method</h2>

//               <div className="payment-methods-list">
//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "khalti" ? "active" : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="khalti"
//                     checked={paymentMethod === "khalti"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-logo-box">
//                     <img
//                       src={khaltiLogo}
//                       alt="Khalti"
//                       className="payment-logo-img"
//                     />
//                   </div>
//                   <div className="payment-text">
//                     <p>Khalti</p>
//                     <span>Secure mobile wallet payment</span>
//                   </div>
//                 </label>

//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "esewa" ? "active" : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="esewa"
//                     checked={paymentMethod === "esewa"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-logo-box">
//                     <img
//                       src={esewaLogo}
//                       alt="eSewa"
//                       className="payment-logo-img"
//                     />
//                   </div>
//                   <div className="payment-text">
//                     <p>eSewa</p>
//                     <span>Popular digital wallet in Nepal</span>
//                   </div>
//                 </label>

//                 <label
//                   className={`payment-method-card ${
//                     paymentMethod === "cash_in_hand" ? "active" : ""
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="cash_in_hand"
//                     checked={paymentMethod === "cash_in_hand"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <div className="payment-icon-box cash">
//                     <Banknote size={22} />
//                   </div>
//                   <div className="payment-text">
//                     <p>Cash in hand</p>
//                     <span>Pay physically at the property</span>
//                   </div>
//                 </label>
//               </div>
//             </div>

//             <div className="checkout-section">
//               <button
//                 className="confirm-pay-btn"
//                 onClick={handleConfirmBooking}
//                 disabled={loading}
//               >
//                 {loading ? "Processing..." : "Confirm and Pay"}
//               </button>
//             </div>
//           </div>

//           <div className="checkout-right">
//             <div className="checkout-summary-card">
//               <div className="summary-listing-header">
//                 {previewImage ? (
//                   <img
//                     src={previewImage}
//                     alt={listing?.title || "Listing"}
//                     className="summary-listing-image"
//                     onError={(e) => {
//                       e.currentTarget.style.display = "none";
//                     }}
//                   />
//                 ) : (
//                   <div className="checkout-image-placeholder">No photo</div>
//                 )}

//                 <div className="summary-listing-info">
//                   <span className="listing-category">
//                     {listing?.property_type_display ||
//                       listing?.category_name ||
//                       listing?.category ||
//                       "Stay"}
//                   </span>
//                   <h3>{listing?.title || "Untitled listing"}</h3>
//                 </div>
//               </div>

//               <hr />

//               <div className="reservation-details">
//                 <div className="detail-row">
//                   <div className="row-header">
//                     <strong>Dates</strong>
//                   </div>
//                   <span>
//                     {startDate && endDate
//                       ? `${new Date(startDate).toLocaleDateString()} – ${new Date(
//                           endDate
//                         ).toLocaleDateString()}`
//                       : "Dates not selected"}
//                   </span>
//                 </div>

//                 <div className="detail-row">
//                   <div className="row-header">
//                     <strong>Guests</strong>
//                   </div>
//                   <span>{formatGuestText()}</span>
//                 </div>
//               </div>

//               <hr />

//               <div className="price-details">
//                 <h2>Price details</h2>

//                 <div className="price-row">
//                   <span>
//                     {formatCurrency(safePricePerNight)} x {nights} night
//                     {nights > 1 ? "s" : ""}
//                   </span>
//                   <span>{formatCurrency(subtotal)}</span>
//                 </div>

//                 <div className="price-row">
//                   <span>Cleaning fee</span>
//                   <span>{formatCurrency(cleaningFee)}</span>
//                 </div>

//                 <div className="price-row">
//                   <span>Service fee ({selectedServiceFeePercent}%)</span>
//                   <span>{formatCurrency(serviceFee)}</span>
//                 </div>

//                 <hr />

//                 <div className="price-row total">
//                   <span>Total (NPR)</span>
//                   <span>{formatCurrency(total)}</span>
//                 </div>
//               </div>

//               <div className="free-cancellation-box">
//                 <strong>Free cancellation</strong>
//                 <p>
//                   Cancel before{" "}
//                   {startDate
//                     ? new Date(startDate).toLocaleDateString()
//                     : "check-in date"}{" "}
//                   for a full refund.
//                 </p>
//               </div>

//               {specialRequests ? (
//                 <div className="special-requests-box">
//                   <strong>Special requests</strong>
//                   <p>{specialRequests}</p>
//                 </div>
//               ) : null}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CheckoutPage;



import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Banknote } from "lucide-react";
import { bookingsAPI, paymentsAPI, platformSettingsAPI } from "../api/axios";
import khaltiLogo from "../images/khalti.png";
import esewaLogo from "../images/Esewa_logo.webp";
import "../styles/CheckoutPage.css";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [loading, setLoading] = useState(false);
  const [feeSettings, setFeeSettings] = useState({
    fee_0_to_2000_percent: 0,
    fee_2001_to_6000_percent: 0,
    fee_6001_and_above_percent: 0,
  });

  const stateData = location.state || {};

  const listing = stateData.listing || {};
  const startDate = stateData.startDate || "";
  const endDate = stateData.endDate || "";
  const nights = Number(stateData.nights || 1);
  const specialRequests = stateData.specialRequests || "";

  const guests = stateData.guests || {
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  };

  const normalizeImageUrl = (img) => {
    if (!img) return "";

    let rawValue = "";

    if (typeof img === "string") {
      rawValue = img;
    } else if (typeof img === "object") {
      rawValue = img.image || img.url || img.src || "";
    }

    if (!rawValue) return "";

    if (
      rawValue.startsWith("http://") ||
      rawValue.startsWith("https://") ||
      rawValue.startsWith("blob:")
    ) {
      return rawValue;
    }

    return `${API_BASE}${rawValue}`;
  };

  const previewImage = useMemo(() => {
    if (Array.isArray(listing?.images) && listing.images.length > 0) {
      const firstImage =
        typeof listing.images[0] === "object"
          ? listing.images[0].image ||
            listing.images[0].url ||
            listing.images[0].src
          : listing.images[0];

      const normalized = normalizeImageUrl(firstImage);
      if (normalized) return normalized;
    }

    if (listing?.primary_image) {
      const normalizedPrimary = normalizeImageUrl(listing.primary_image);
      if (normalizedPrimary) return normalizedPrimary;
    }

    if (Array.isArray(listing?.all_images) && listing.all_images.length > 0) {
      const firstFallback =
        typeof listing.all_images[0] === "object"
          ? listing.all_images[0].image ||
            listing.all_images[0].url ||
            listing.all_images[0].src
          : listing.all_images[0];

      const normalizedFallback = normalizeImageUrl(firstFallback);
      if (normalizedFallback) return normalizedFallback;
    }

    return "";
  }, [listing]);

  const safePricePerNight = Number(listing?.price_per_night || listing?.price || 0);
  const cleaningFee = Number(listing?.cleaning_fee || 0);
  const subtotal = safePricePerNight * nights;

  const selectedServiceFeePercent = useMemo(() => {
    if (safePricePerNight <= 2000) {
      return Number(feeSettings.fee_0_to_2000_percent || 0);
    }
    if (safePricePerNight <= 6000) {
      return Number(feeSettings.fee_2001_to_6000_percent || 0);
    }
    return Number(feeSettings.fee_6001_and_above_percent || 0);
  }, [safePricePerNight, feeSettings]);

  const serviceFee = useMemo(() => {
    return Math.round((subtotal * selectedServiceFeePercent) / 100);
  }, [subtotal, selectedServiceFeePercent]);

  const total = subtotal + cleaningFee + serviceFee;

  const totalGuestCount =
    Number(guests?.adults || 0) +
    Number(guests?.children || 0) +
    Number(guests?.infants || 0);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatGuestText = () => {
    const parts = [];

    if (guests?.adults) {
      parts.push(`${guests.adults} adult${guests.adults > 1 ? "s" : ""}`);
    }

    if (guests?.children) {
      parts.push(`${guests.children} child${guests.children > 1 ? "ren" : ""}`);
    }

    if (guests?.infants) {
      parts.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
    }

    if (guests?.pets) {
      parts.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);
    }

    return parts.length > 0 ? parts.join(", ") : "1 adult";
  };

  const fetchPlatformFee = async () => {
    try {
      const res = await platformSettingsAPI.getPublicFee();

      setFeeSettings({
        fee_0_to_2000_percent: Number(res.data?.fee_0_to_2000_percent || 0),
        fee_2001_to_6000_percent: Number(res.data?.fee_2001_to_6000_percent || 0),
        fee_6001_and_above_percent: Number(res.data?.fee_6001_and_above_percent || 0),
      });
    } catch (err) {
      console.error("Failed to fetch platform fee:", err);

      setFeeSettings({
        fee_0_to_2000_percent: 0,
        fee_2001_to_6000_percent: 0,
        fee_6001_and_above_percent: 0,
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlatformFee();
  }, []);

  const handleConfirmBooking = async () => {
    if (!startDate || !endDate) {
      alert("Please select valid booking dates.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        listing: Number(id || listing?.id),
        check_in: startDate,
        check_out: endDate,
        guests_count: totalGuestCount,
        special_requests: specialRequests || "",
      };

      const response = await bookingsAPI.createBooking(payload);
      const booking = response.data;

      if (!booking?.id) {
        throw new Error("Booking ID not received.");
      }

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

      throw new Error("Invalid payment method selected.");
    } catch (error) {
      console.error("Booking/payment error:", error);

      const errorData = error?.response?.data;

      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        (typeof errorData === "object" &&
        errorData !== null &&
        Object.values(errorData)[0]
          ? Array.isArray(Object.values(errorData)[0])
            ? Object.values(errorData)[0][0]
            : Object.values(errorData)[0]
          : null) ||
        error?.message ||
        "Something went wrong while processing the booking.";

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!listing || Object.keys(listing).length === 0) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="checkout-container">
            <div className="checkout-left">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} />
                Back
              </button>

              <h2 className="checkout-title">Checkout</h2>
              <p>Booking data not found. Please go back and select dates again.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={20} />
              Back
            </button>

            <h1 className="checkout-title">Confirm and pay</h1>

            <div className="checkout-section">
              <h2 className="checkout-section-title">1. Select payment method</h2>

              <div className="payment-methods-list">
                <label
                  className={`payment-method-card ${paymentMethod === "khalti" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="khalti"
                    checked={paymentMethod === "khalti"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-logo-box">
                    <img src={khaltiLogo} alt="Khalti" className="payment-logo-img" />
                  </div>
                  <div className="payment-text">
                    <p>Khalti</p>
                    <span>Secure mobile wallet payment</span>
                  </div>
                </label>

                <label
                  className={`payment-method-card ${paymentMethod === "esewa" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={paymentMethod === "esewa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-logo-box">
                    <img src={esewaLogo} alt="eSewa" className="payment-logo-img" />
                  </div>
                  <div className="payment-text">
                    <p>eSewa</p>
                    <span>Popular digital wallet in Nepal</span>
                  </div>
                </label>

                <label
                  className={`payment-method-card ${paymentMethod === "cash_in_hand" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash_in_hand"
                    checked={paymentMethod === "cash_in_hand"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon-box cash">
                    <Banknote size={22} />
                  </div>
                  <div className="payment-text">
                    <p>Cash in hand</p>
                    <span>Pay physically at the property</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="checkout-section">
              <button
                className="confirm-pay-btn"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "cash_in_hand"
                  ? "Confirm Booking"
                  : "Confirm and Pay"}
              </button>
            </div>
          </div>

          <div className="checkout-right">
            <div className="checkout-summary-card">
              <div className="summary-listing-header">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={listing?.title || "Listing"}
                    className="summary-listing-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="checkout-image-placeholder">No photo</div>
                )}

                <div className="summary-listing-info">
                  <span className="listing-category">
                    {listing?.property_type_display ||
                      listing?.category_name ||
                      listing?.category ||
                      "Stay"}
                  </span>
                  <h3>{listing?.title || "Untitled listing"}</h3>
                </div>
              </div>

              <hr />

              <div className="reservation-details">
                <div className="detail-row">
                  <div className="row-header">
                    <strong>Dates</strong>
                  </div>
                  <span>
                    {startDate && endDate
                      ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
                      : "Dates not selected"}
                  </span>
                </div>

                <div className="detail-row">
                  <div className="row-header">
                    <strong>Guests</strong>
                  </div>
                  <span>{formatGuestText()}</span>
                </div>
              </div>

              <hr />

              <div className="price-details">
                <h2>Price details</h2>

                <div className="price-row">
                  <span>
                    {formatCurrency(safePricePerNight)} x {nights} night{nights > 1 ? "s" : ""}
                  </span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="price-row">
                  <span>Cleaning fee</span>
                  <span>{formatCurrency(cleaningFee)}</span>
                </div>

                <div className="price-row">
                  <span>Service fee ({selectedServiceFeePercent}%)</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>

                <hr />

                <div className="price-row total">
                  <span>Total (NPR)</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="free-cancellation-box">
                <strong>Free cancellation</strong>
                <p>
                  Cancel before{" "}
                  {startDate ? new Date(startDate).toLocaleDateString() : "check-in date"}{" "}
                  for a full refund.
                </p>
              </div>

              {specialRequests ? (
                <div className="special-requests-box">
                  <strong>Special requests</strong>
                  <p>{specialRequests}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;