import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import '../styles/PaymentSuccess.css';
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx");
      const bookingId = localStorage.getItem("pending_booking_id");

      console.log("pidx:", pidx);
      console.log("bookingId:", bookingId);

      if (!pidx || !bookingId) {
        setStatus("error");
        setError("Missing payment details.");
        return;
      }

      try {
        const res = await api.post("/bookings/verify-payment/", {
          pidx,
          booking_id: parseInt(bookingId),
        });

        setBooking(res.data.booking);
        setStatus("success");

        localStorage.removeItem("pending_booking_id");
        localStorage.removeItem("pending_booking_pidx");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setError(
          err?.response?.data?.error || "Payment verification failed."
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="container">
      <div className="card">

        {status === "verifying" && (
          <>
            <div className="icon"></div>
            <h2>Verifying Payment...</h2>
            <p className="sub-text">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && booking && (
          <>
            <div className="success-icon"></div>
            <h2 className="success-text">Payment Successful!</h2>
            <p className="sub-text">
              Your booking is confirmed. The host has been notified.
            </p>

            <div className="details-box">
              {[
                ["Booking ID", `#${booking?.id}`],
                ["Property", booking?.listing_title],
                ["Check-in", booking?.check_in],
                ["Check-out", booking?.check_out],
                [
                  "Total Paid",
                  `Rs. ${Number(booking?.total_amount || 0).toFixed(2)}`,
                ],
                ["Status", "Confirmed & Paid"],
              ].map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="label">{label}</span>
                  <span className="value">{value}</span>
                </div>
              ))}
            </div>

            <button className="button" onClick={() => navigate("/home")}>
              Back to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="icon">❌</div>
            <h2 className="error-text">Payment Failed</h2>
            <p className="sub-text">{error}</p>
            <button className="button" onClick={() => navigate("/home")}>
              Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;