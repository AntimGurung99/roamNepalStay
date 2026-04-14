import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const BookingPolicyPage = () => {
  return (
    <>
     <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Booking Policy</h1>
        <p className="footer-page-subtitle">
          Please read our booking terms carefully before making a reservation.
        </p>

        <div className="footer-card">
          <h2>1. Booking Confirmation</h2>
          <p>
            A booking is confirmed only after successful payment and confirmation
            from the platform or host.
          </p>
        </div>

        <div className="footer-card">
          <h2>2. Guest Responsibility</h2>
          <p>
            Guests must provide accurate booking details and follow house rules
            set by the property.
          </p>
        </div>

        <div className="footer-card">
          <h2>3. Check-In and Check-Out</h2>
          <p>
            Check-in and check-out times vary by property. Guests should review
            the listing details before booking.
          </p>
        </div>

        <div className="footer-card">
          <h2>4. Payment Terms</h2>
          <p>
            Full or partial payment may be required depending on the property
            and booking type.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookingPolicyPage;