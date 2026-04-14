import React from "react";
import "../styles/LegalPages.css";
import Navbar from "../components/Navbar";

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar/>
    <div className="legal-page">
      <div className="legal-card">
        <h1>Refund Policy</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>1. Booking Cancellation</h2>
          <p>
            Refund eligibility depends on the cancellation timing, listing
            policy, and payment status.
          </p>
        </section>

        <section>
          <h2>2. Guest Cancellations</h2>
          <p>
            Guests may receive a full, partial, or no refund depending on how
            early the cancellation is made before check-in.
          </p>
        </section>

        <section>
          <h2>3. Host Cancellations</h2>
          <p>
            If a host cancels a confirmed booking, guests will generally receive
            a full refund.
          </p>
        </section>

        <section>
          <h2>4. Payment Processing Time</h2>
          <p>
            Approved refunds may take several business days to appear depending
            on the payment provider.
          </p>
        </section>

        <section>
          <h2>5. Non-Refundable Situations</h2>
          <p>
            Refunds may not be available for no-shows, policy violations, or
            cancellations made too close to check-in where the listing policy
            does not allow it.
          </p>
        </section>

        <section>
          <h2>6. Contact Support</h2>
          <p>
            If you believe there was a payment error or booking issue, please
            contact RoamNepalStay support for review.
          </p>
        </section>
      </div>
    </div>
    </>
  );
}