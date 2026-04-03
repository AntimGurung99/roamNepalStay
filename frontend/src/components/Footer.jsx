import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="rns-footer">
      <div className="rns-footer-top">
        <div className="rns-footer-brand">
          <h2>RoamNepalStay</h2>
          <p>
            Discover cozy stays, local experiences, and unforgettable journeys
            across Nepal.
          </p>

          <div className="rns-contact">
            <span>Kathmandu, Nepal</span>
            <span>+977 98XXXXXXXX</span>
            <span>hello@roamnepalstay.com</span>
          </div>
        </div>

        <div className="rns-footer-links">
          <div className="rns-footer-col">
            <h3>Destinations</h3>
            <a href="/destinations/kathmandu">Kathmandu</a>
            <a href="/destinations/pokhara">Pokhara</a>
            <a href="/destinations/chitwan">Chitwan</a>
            <a href="/destinations/mustang">Mustang</a>
            <a href="/destinations/lumbini">Lumbini</a>
          </div>

          <div className="rns-footer-col">
            <h3>Stays</h3>
            <a href="/stays/hotels">Hotels</a>
            <a href="/stays/homestays">Homestays</a>
            <a href="/stays/resorts">Resorts</a>
            <a href="/stays/budget">Budget Rooms</a>
            <a href="/stays/luxury">Luxury Retreats</a>
          </div>

          <div className="rns-footer-col">
            <h3>Company</h3>
            <a href="/about">About Us</a>
            <a href="/blog">Travel Blog</a>
            <a href="/partners">Partners</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="rns-footer-col">
            <h3>Support</h3>
            <a href="/help-center">Help Center</a>
            <a href="/faq">FAQs</a>
            <a href="/booking-policy">Booking Policy</a>
            <a href="/cancellation-policy">Cancellation Policy</a>
            <a href="/support">Customer Support</a>
          </div>
        </div>
      </div>

      <div className="rns-footer-middle">
        <div className="rns-newsletter">
          <h3>Get travel updates</h3>
          <p>Find stay deals, destination tips, and special offers from Nepal.</p>
          <form className="rns-newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="rns-socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>

      <div className="rns-footer-bottom">
        <p>© {new Date().getFullYear()} RoamNepalStay. All rights reserved.</p>
        <div className="rns-bottom-links">
          <a href="/terms">Terms of Use</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/refund-policy">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}
