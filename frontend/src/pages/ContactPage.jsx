import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const ContactPage = () => {
  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Contact Us</h1>
        <p className="footer-page-subtitle">
          We would love to hear from you. Reach out to us for questions,
          support, or partnership inquiries.
        </p>

        <div className="footer-card-grid">
          <div className="footer-card">
            <h3>Email</h3>
            <p>support@roamnepalstay.com</p>
          </div>

          <div className="footer-card">
            <h3>Phone</h3>
            <p>+977-9800000000</p>
          </div>

          <div className="footer-card">
            <h3>Address</h3>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>

        <div className="footer-card">
          <h2>Office Hours</h2>
          <p>Sunday - Friday</p>
          <p>9:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactPage;