import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const CancellationPolicyPage = () => {
  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Cancellation Policy</h1>
        <p className="footer-page-subtitle">
          Our cancellation terms are designed to be fair for both guests and
          property owners.
        </p>

        <div className="footer-card">
          <h2>1. Free Cancellation</h2>
          <p>
            Some properties may allow free cancellation within a limited time
            period before check-in.
          </p>
        </div>

        <div className="footer-card">
          <h2>2. Late Cancellation</h2>
          <p>
            Cancellations made closer to the check-in date may be subject to
            partial or full charges.
          </p>
        </div>

        <div className="footer-card">
          <h2>3. Refund Processing</h2>
          <p>
            Eligible refunds will be processed according to the payment method
            and platform policy.
          </p>
        </div>

        <div className="footer-card">
          <h2>4. Non-Refundable Bookings</h2>
          <p>
            Certain discounted or promotional bookings may be marked as
            non-refundable.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default CancellationPolicyPage;