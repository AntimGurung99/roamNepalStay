import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const PartnersPage = () => {
  
 
  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Partners</h1>
        <p className="footer-page-subtitle">
          Join Roam Nepal Stay and grow your property business with us.
        </p>

        <div className="footer-card">
          <h2>Why Partner With Us?</h2>
          <ul className="footer-list">
            <li>Reach more travelers across Nepal</li>
            <li>Showcase your property on a trusted platform</li>
            <li>Get more bookings and visibility</li>
            <li>Easy listing and simple management</li>
          </ul>
        </div>

        <div className="footer-card">
          <h2>Who Can Partner?</h2>
          <p>
            We welcome hotels, apartments, homestays, resorts, guest houses,
            and other verified accommodation providers in Nepal.
          </p>
        </div>

        <div className="footer-card">
          <h2>Become a Partner</h2>
          <p>
            If you are interested in listing your property with us, please
            contact our team and we will guide you through the process.
          </p>
          <button className="footer-btn">Become a Partner</button>
        </div>
      </div>
    </div>
  </>
  );
};

export default PartnersPage;