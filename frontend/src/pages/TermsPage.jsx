import React from "react";
import "../styles/LegalPages.css";
import Navbar from "../components/Navbar";

export default function TermsPage() {
  return (
    <>
     <Navbar/>
    <div className="legal-page">
      <div className="legal-card">
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using RoamNepalStay, you agree to follow these terms and use the
            platform responsibly.
          </p>
        </section>

        <section>
          <h2>2. Bookings</h2>
          <p>
            All bookings are subject to listing availability, host approval when
            applicable, and successful payment confirmation.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>
            Users must provide correct booking details, valid contact
            information, and follow property rules during their stay.
          </p>
        </section>

        <section>
          <h2>4. Host Responsibilities</h2>
          <p>
            Hosts must provide accurate property information, fair pricing, and
            maintain a safe stay experience for guests.
          </p>
        </section>

        <section>
          <h2>5. Payments</h2>
          <p>
            Payments made through the platform must be completed using supported
            payment methods. Fraudulent or suspicious payments may be cancelled.
          </p>
        </section>

        <section>
          <h2>6. Account Usage</h2>
          <p>
            You are responsible for keeping your account information secure and
            for activities under your account.
          </p>
        </section>

        <section>
          <h2>7. Changes to Terms</h2>
          <p>
            RoamNepalStay may update these terms when needed. Continued use of
            the website means you accept the updated version.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}