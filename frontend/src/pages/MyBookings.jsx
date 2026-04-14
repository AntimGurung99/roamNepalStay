import { useEffect, useState, memo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Wallet,
  Banknote,
  Download,
  XCircle,
  Star,
  Home,
} from "lucide-react";
import { bookingsAPI, paymentsAPI, reviewsAPI } from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/MyBookings.css";
import Navbar from "../components/Navbar.jsx";

// Helper Functions Moved Outside
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

const normalizeValue = (value) => String(value || "").toLowerCase().trim();

const isPaidBooking = (b) => normalizeValue(b.payment_status) === "paid";
const isCancelledBooking = (b) => normalizeValue(b.status) === "cancelled";
const isCompletedBooking = (b) => normalizeValue(b.status) === "completed";
const isCashBooking = (b) =>
  normalizeValue(b.payment_method) === "cash_in_hand";

const canPay = (b) =>
  !isPaidBooking(b) &&
  !isCancelledBooking(b) &&
  !isCompletedBooking(b) &&
  !isCashBooking(b);

const canCancel = (b) => !isCancelledBooking(b) && !isCompletedBooking(b);

const getPaymentMethodLabel = (method) => {
  const normalized = normalizeValue(method);

  if (!normalized) return "Not selected";
  if (normalized === "cash_in_hand") return "Cash in Hand";
  if (normalized === "esewa") return "eSewa";
  if (normalized === "khalti") return "Khalti";

  return String(method || "").replace(/_/g, " ");
};

const getStatusClass = (status) => {
  const normalized = normalizeValue(status);

  if (normalized === "pending") return "booking-pending";
  if (normalized === "confirmed") return "booking-confirmed";
  if (normalized === "completed") return "booking-completed";
  if (normalized === "cancelled") return "booking-cancelled";

  return "booking-pending";
};

const getPaymentStatusClass = (status) => {
  const normalized = normalizeValue(status);

  if (normalized === "paid") return "payment-paid";
  return "payment-unpaid";
};

// --- Review Form Component ---
// This isolates the rating/comment state so typing doesn't re-render the entire list.
const ReviewForm = ({ bookingId, onCancel, onSubmit, actionLoadingId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleLocalSubmit = () => {
    onSubmit(bookingId, { rating, comment });
  };

  return (
    <div className="inline-review-form">
      <h4>Write a Review</h4>

      <div className="review-inputs">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={2}>2 Stars</option>
          <option value={1}>1 Star</option>
        </select>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your experience..."
          rows="4"
        />
      </div>

      <div className="review-form-actions">
        <button
          className="submit-rev"
          onClick={handleLocalSubmit}
          disabled={!comment.trim() || actionLoadingId === bookingId}
        >
          {actionLoadingId === bookingId ? "Submitting..." : "Submit Review"}
        </button>

        <button
          className="cancel-rev"
          onClick={onCancel}
          disabled={actionLoadingId === bookingId}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// --- Individual Booking Card Component ---
const BookingCard = memo(({ 
  b, 
  actionLoadingId, 
  handlers, 
  reviewBookingId, 
  setReviewBookingId 
}) => {
  return (
    <div className="booking-card-horizontal" key={b.id}>
      <div className="booking-col-image">
        <img
          src={b.listing_image || "https://via.placeholder.com/300"}
          alt={b.listing_title}
        />
      </div>

      <div className="booking-col-details">
        <div className="details-header">
          <h2>{b.listing_title}</h2>
          <p className="location-text">
            <MapPin size={16} />
            {b.listing_city}
          </p>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <Calendar size={15} />
            <span>
              {formatDate(b.check_in)} - {formatDate(b.check_out)}
            </span>
          </div>

          <div className="detail-item">
            <Users size={15} />
            <span>{b.guests_count} guests</span>
          </div>
        </div>

        <div className="monetary-details">
          <div className="monetary-row total">
            <span>Total</span>
            <span>Rs. {b.total_amount}</span>
          </div>

          <div className="monetary-row secondary">
            <span>Cleaning Fee: Rs. {b.cleaning_fee}</span>
            <span>Service Fee: Rs. {b.service_fee}</span>
          </div>
        </div>

        {b.special_requests && (
          <div className="special-requests-box">
            <strong>Special Requests</strong>
            <p>{b.special_requests}</p>
          </div>
        )}
      </div>

      <div className="booking-col-actions">
        <div>
          <div className="status-badge-container">
            <span className={`status-badge ${getStatusClass(b.status)}`}>
              Booking: {b.status}
            </span>

            <span
              className={`status-badge ${getPaymentStatusClass(
                b.payment_status
              )}`}
            >
              Payment: {b.payment_status}
            </span>
          </div>

          <div
            className={`method-info-styled method-${normalizeValue(
              b.payment_method
            )}`}
          >
            <strong>Method:</strong> {getPaymentMethodLabel(b.payment_method)}
          </div>

          {isPaidBooking(b) ? (
            <div className="payment-options-inline payment-completed-box">
              <p>Payment Completed Via</p>
              <div className="payment-completed-method">
                {getPaymentMethodLabel(b.payment_method)}
              </div>
            </div>
          ) : isCashBooking(b) ? (
            <div className="payment-options-inline payment-pending-box">
              <p>Pay At Property</p>
              <div className="payment-completed-method">Cash in Hand</div>
            </div>
          ) : canPay(b) ? (
            <div className="payment-options-inline">
              <p>Complete Payment Via</p>

              <div className="payment-btn-group">
                <button
                  onClick={() => handlers.handleKhalti(b.id)}
                  className="pay-btn-brand khalti"
                  disabled={actionLoadingId === b.id}
                >
                  <CreditCard size={16} />
                  {actionLoadingId === b.id ? "Processing..." : "Khalti"}
                </button>

                <button
                  onClick={() => handlers.handleEsewa(b.id)}
                  className="pay-btn-brand esewa"
                  disabled={actionLoadingId === b.id}
                >
                  <Wallet size={16} />
                  {actionLoadingId === b.id ? "Processing..." : "eSewa"}
                </button>

                <button
                  onClick={() => handlers.handleCash(b.id)}
                  className="pay-btn-brand cash"
                  disabled={actionLoadingId === b.id}
                >
                  <Banknote size={16} />
                  {actionLoadingId === b.id ? "Processing..." : "Cash"}
                </button>
              </div>
            </div>
          ) : null}

          {b.can_review && (
            <button
              className="review-trigger-btn"
              onClick={() => setReviewBookingId(b.id)}
              disabled={actionLoadingId === b.id}
            >
              <Star size={16} />
              Leave Review
            </button>
          )}

          {b.has_review && (
            <div className="review-submitted-msg">
              Review already submitted
            </div>
          )}
        </div>

        <div className="main-action-footer">
          {canCancel(b) && (
            <button
              onClick={() => handlers.handleCancelBooking(b.id)}
              className="action-btn-link delete"
              disabled={actionLoadingId === b.id}
            >
              <XCircle size={16} />
              {actionLoadingId === b.id ? "Processing..." : "Cancel Booking"}
            </button>
          )}

          <button
            onClick={() => handlers.handleDownloadReceipt(b.id)}
            className="action-btn-link"
            disabled={actionLoadingId === b.id}
          >
            <Download size={16} />
            {actionLoadingId === b.id ? "Processing..." : "Download Receipt"}
          </button>
        </div>

        {reviewBookingId === b.id && (
          <ReviewForm 
            bookingId={b.id}
            actionLoadingId={actionLoadingId}
            onCancel={() => setReviewBookingId(null)}
            onSubmit={handlers.handleSubmitReview}
          />
        )}
      </div>
    </div>
  );
});

// --- Main MyBookings Component ---
const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError("");
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const handleKhalti = async (id) => {
    try {
      setActionLoadingId(id);
      const res = await paymentsAPI.initiateKhaltiPayment(id);
      window.location.href = res.data.payment_url;
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to start Khalti payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEsewa = async (id) => {
    try {
      setActionLoadingId(id);
      const res = await paymentsAPI.initiateEsewaPayment(id);
      const { form_url, fields } = res.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = form_url;

      Object.keys(fields).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to start eSewa payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCash = async (id) => {
    try {
      setActionLoadingId(id);
      await paymentsAPI.selectCashInHand(id);
      alert("Cash in Hand selected successfully.");
      fetchBookings(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to select Cash in Hand.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      setActionLoadingId(id);
      await bookingsAPI.cancelBooking(id);
      alert("Booking cancelled successfully.");
      fetchBookings(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to cancel booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadReceipt = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await bookingsAPI.downloadReceipt(id);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `booking_receipt_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to download receipt.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmitReview = async (bookingId, { rating, comment }) => {
    try {
      setActionLoadingId(bookingId);

      await reviewsAPI.createReview(bookingId, {
        rating,
        comment,
      });

      alert("Review submitted successfully.");
      setReviewBookingId(null);
      fetchBookings(true);
    } catch (err) {
      console.error(err);

      const errorData = err?.response?.data;

      if (typeof errorData === "string") {
        alert(errorData);
      } else if (errorData?.detail) {
        alert(errorData.detail);
      } else if (errorData?.non_field_errors?.[0]) {
        alert(errorData.non_field_errors[0]);
      } else {
        alert("Failed to submit review.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlers = {
    handleKhalti,
    handleEsewa,
    handleCash,
    handleCancelBooking,
    handleDownloadReceipt,
    handleSubmitReview,
  };

  if (loading) return <div className="center">Loading...</div>;

  return (
    <>
        <Navbar />
    <div className="bookings-page">
      <div className="bookings-header-flex">
        <h1 className="page-title">My Bookings</h1>

        <button
          className="back-home-link"
          onClick={() => navigate("/")}
          type="button"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {bookings.length === 0 ? (
        <div className="empty-box">
          <p>No bookings yet</p>
          <button onClick={() => navigate("/")}>Explore</button>
        </div>
      ) : (
        bookings.map((b) => (
          <BookingCard 
            key={b.id}
            b={b}
            actionLoadingId={actionLoadingId}
            handlers={handlers}
            reviewBookingId={reviewBookingId}
            setReviewBookingId={setReviewBookingId}
          />
        ))
      )}
    </div>
    </>
  );
};

export default MyBookings;