import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import { paymentsAPI } from "../api/axios";
import "../styles/PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const isEsewaRoute = location.pathname.includes(
          "/booking/payment-success/esewa/"
        );

        const provider = isEsewaRoute
          ? "esewa"
          : searchParams.get("provider");

        if (provider === "khalti") {
          const pidx = searchParams.get("pidx");
          const purchaseOrderId =
            searchParams.get("purchase_order_id") ||
            searchParams.get("booking_id");
          const statusParam = searchParams.get("status");

          if (!pidx || !purchaseOrderId) {
            throw new Error("Missing Khalti payment information.");
          }

          if (statusParam && statusParam !== "Completed") {
            throw new Error(`Khalti returned status: ${statusParam}`);
          }

          await paymentsAPI.verifyKhaltiPayment({
            pidx,
            booking_id: purchaseOrderId,
          });

          setMessage("Khalti payment verified successfully.");
        } else if (provider === "esewa") {
          const esewaBookingId =
            bookingId || searchParams.get("booking_id");

          if (!esewaBookingId) {
            throw new Error("Missing eSewa booking ID.");
          }

          await paymentsAPI.verifyEsewaPayment({
            booking_id: esewaBookingId,
          });

          setMessage("eSewa payment verified successfully.");
        } else {
          throw new Error("Unknown payment provider.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);

        const data = err?.response?.data;

        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else if (data && typeof data === "object") {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else if (typeof firstError === "string") {
            setError(firstError);
          } else {
            setError("Payment verification failed.");
          }
        } else if (err?.message) {
          setError(err.message);
        } else {
          setError("Payment verification failed.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, bookingId, location.pathname]);

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        {loading ? (
          <>
            <Loader2 className="payment-spinner" size={60} />
            <h1 className="payment-title">Verifying Payment</h1>
            <p className="payment-message">{message}</p>
          </>
        ) : error ? (
          <>
            <div className="payment-error-icon">!</div>
            <h1 className="payment-title payment-title-error">
              Payment Verification Failed
            </h1>
            <p className="payment-message">{error}</p>

            <div className="payment-button-group">
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="payment-btn payment-btn-primary"
              >
                Go to My Bookings
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="payment-btn payment-btn-secondary"
              >
                Go to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <CheckCircle className="payment-success-icon" size={64} />
            <h1 className="payment-title payment-title-success">
              Payment Successful
            </h1>
            <p className="payment-message">{message}</p>

            <div className="payment-button-group">
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="payment-btn payment-btn-primary"
              >
                Go to My Bookings
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="payment-btn payment-btn-secondary"
              >
                Go to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;