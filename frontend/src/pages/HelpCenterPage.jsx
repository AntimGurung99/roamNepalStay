import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const HelpCenterPage = () => {
  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Help Center</h1>
        <p className="footer-page-subtitle">
          Find quick help for booking, payments, cancellations, and account
          support.
        </p>

        <div className="footer-card-grid">
          <div className="footer-card">
            <h3>Booking Help</h3>
            <p>Learn how to search, choose, and book a stay easily.</p>
          </div>

          <div className="footer-card">
            <h3>Payment Help</h3>
            <p>Get support for payment methods and payment confirmation.</p>
          </div>

          <div className="footer-card">
            <h3>Cancellation Help</h3>
            <p>Understand cancellation steps and refund conditions.</p>
          </div>

          <div className="footer-card">
            <h3>Account Help</h3>
            <p>Need help with login, profile, or account settings? Start here.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HelpCenterPage;