import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const CareersPage = () => {
  return (
    <>
       <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Careers</h1>
        <p className="footer-page-subtitle">
          Be part of our journey to make travel and stays in Nepal easier and
          better.
        </p>

        <div className="footer-card">
          <h2>Work With Us</h2>
          <p>
            At Roam Nepal Stay, we believe in innovation, teamwork, and creating
            better experiences for travelers and hosts.
          </p>
        </div>

        <div className="footer-card">
          <h2>Current Openings</h2>
          <p>We do not have any open positions right now.</p>
          <p>
            Please check back later or send your CV to{" "}
            <strong>careers@roamnepalstay.com</strong>.
          </p>
        </div>

        <div className="footer-card">
          <h2>Why Join Us?</h2>
          <ul className="footer-list">
            <li>Work on meaningful travel technology</li>
            <li>Be part of a growing platform</li>
            <li>Friendly and collaborative environment</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};

export default CareersPage;