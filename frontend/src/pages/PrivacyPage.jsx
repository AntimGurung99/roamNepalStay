import React from "react";
import "../styles/LegalPages.css";
import Navbar from "../components/Navbar";

export default function PrivacyPage() {
  return (
    <>
     <Navbar/>
    <div className="legal-page">
      <div className="legal-card">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We may collect your name, email, phone number, booking details, and
            payment-related information needed to provide our services.
          </p>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>
            Your data is used to manage bookings, improve the website, provide
            customer support, and send important updates.
          </p>
        </section>

        <section>
          <h2>3. Data Protection</h2>
          <p>
            We take reasonable steps to protect your information, but no online
            system can guarantee complete security.
          </p>
        </section>

        <section>
          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share data with
            hosts, payment providers, or legal authorities when necessary.
          </p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>
            Our website may use cookies and similar technologies to improve user
            experience and website performance.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You may request updates or corrections to your personal information
            by contacting us.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}