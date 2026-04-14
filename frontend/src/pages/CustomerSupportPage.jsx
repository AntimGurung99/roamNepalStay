import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const CustomerSupportPage = () => {
  return (
    <>
     <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Customer Support</h1>
        <p className="footer-page-subtitle">
          Our support team is here to help you with bookings, payments,
          cancellations, and general questions.
        </p>

        <div className="footer-card-grid">
          <div className="footer-card">
            <h3>Email Support</h3>
            <p>support@roamnepalstay.com</p>
          </div>

          <div className="footer-card">
            <h3>Phone Support</h3>
            <p>+977-9800000000</p>
          </div>

          <div className="footer-card">
            <h3>Support Hours</h3>
            <p>Sunday - Friday, 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="footer-card">
          <h2>How We Can Help</h2>
          <ul className="footer-list">
            <li>Booking issues</li>
            <li>Payment questions</li>
            <li>Cancellation support</li>
            <li>Host and guest assistance</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};

export default CustomerSupportPage;