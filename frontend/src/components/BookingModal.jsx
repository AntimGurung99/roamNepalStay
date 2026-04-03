import { useEffect, useMemo, useState } from "react";
import { X, ChevronDown, Plus, Minus } from "lucide-react";
import { listingsAPI } from "../api/axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/BookingModal.css";

const BookingModal = ({ listing, isOpen, onClose }) => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState("");

  const maxGuests = Number(listing?.max_guests) || 10;
  const totalGuests = guests.adults + guests.children;

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  useEffect(() => {
    if (isOpen && listing?.id) {
      fetchBookedDates();
    }
  }, [isOpen, listing?.id]);

  const fetchBookedDates = async () => {
    try {
      const response = await listingsAPI.getBookedDates(listing.id);

      const dates = response.data.map((b) => ({
        start: new Date(b.check_in),
        end: new Date(b.check_out),
      }));

      setBookedDates(dates);
    } catch (err) {
      console.error("Error fetching booked dates:", err);
    }
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);

    return bookedDates.some((range) => {
      const start = new Date(range.start).setHours(0, 0, 0, 0);
      const end = new Date(range.end).setHours(0, 0, 0, 0);
      // d < end because checkout day is available for check-in
      return d >= start && d < end;
    });
  };



  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setError("");
  };

  const handleGuestChange = (type, action) => {
    setGuests((prev) => {
      const currentVal = prev[type];
      const newVal = action === "plus" ? currentVal + 1 : currentVal - 1;

      if (type === "adults" && newVal < 1) return prev;
      if (newVal < 0) return prev;

      const currentMainGuests = prev.adults + prev.children;
      const nextMainGuests =
        type === "adults" || type === "children"
          ? currentMainGuests + (action === "plus" ? 1 : -1)
          : currentMainGuests;

      if (
        (type === "adults" || type === "children") &&
        nextMainGuests > maxGuests
      ) {
        return prev;
      }

      return { ...prev, [type]: newVal };
    });
  };

  const handleBooking = () => {
    if (!startDate || !endDate) {
      setError("Please select a date range.");
      return;
    }

    if (nights < 1) {
      setError("Stay must be at least 1 night.");
      return;
    }

    if (totalGuests > maxGuests) {
      setError(`This place allows a maximum of ${maxGuests} guests.`);
      return;
    }

    setError("");

    navigate(`/checkout/${listing.id}`, {
      state: {
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        guests,
        specialRequests,
        listing,
        nights,
      },
    });

    onClose();
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div
        className="booking-modal extended"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="booking-modal-header">
          <h2>How long do you want to stay?</h2>
          <button onClick={onClose} className="booking-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="booking-modal-scrollable">
          <div className="calendar-section-premium">
            <div className="date-summary-header">
              <div className={`date-input-field ${!startDate ? "active" : ""}`}>
                <label>CHECK-IN</label>
                <span>
                  {startDate
                    ? startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Add date"}
                </span>
              </div>

              <div
                className={`date-input-field ${
                  startDate && !endDate ? "active" : ""
                }`}
              >
                <label>CHECKOUT</label>
                <span>
                  {endDate
                    ? endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Add date"}
                </span>
              </div>
            </div>

            <div className="compact-calendar-wrapper">
              <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                monthsShown={2}
                minDate={new Date()}
                filterDate={(date) => !isDateBooked(date)}
                dayClassName={(date) =>
                  isDateBooked(date) ? "booked-day-unavailable" : undefined
                }
              />

            </div>
          </div>

          {startDate && endDate && nights > 0 && (
            <div className="stay-info-preview">
              <h3>
                Rs. {Number(listing.price_per_night).toLocaleString()} x {nights}{" "}
                nights
              </h3>
              <p className="total-preview">
                Total price: Rs.{" "}
                {(Number(listing.price_per_night) * nights).toLocaleString()}
              </p>
              <div className="date-text-rows">
                <div className="date-text-row">
                  Start Date:{" "}
                  {startDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="date-text-row">
                  End Date:{" "}
                  {endDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="guest-and-requests">
            <div className="guest-selector-container">
              <label className="bold-label">GUESTS</label>
              <div
                className="guest-dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGuestPicker(!showGuestPicker);
                }}
              >
                <span>
                  {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                  {guests.infants > 0
                    ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`
                    : ""}
                </span>
                <ChevronDown size={18} />
              </div>

              {showGuestPicker && (
                <div
                  className="guest-picker-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="guest-type-row">
                    <div>
                      <strong>Adults</strong>
                      <span>Age 13+</span>
                    </div>
                    <div className="counter-controls">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("adults", "minus")}
                        disabled={guests.adults <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{guests.adults}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("adults", "plus")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="guest-type-row">
                    <div>
                      <strong>Children</strong>
                      <span>Ages 2-12</span>
                    </div>
                    <div className="counter-controls">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("children", "minus")}
                        disabled={guests.children <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{guests.children}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("children", "plus")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="guest-type-row">
                    <div>
                      <strong>Infants</strong>
                      <span>Under 2</span>
                    </div>
                    <div className="counter-controls">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("infants", "minus")}
                        disabled={guests.infants <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{guests.infants}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("infants", "plus")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="guest-type-row">
                    <div>
                      <strong>Pets</strong>
                      <span>Bringing service animal?</span>
                    </div>
                    <div className="counter-controls">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("pets", "minus")}
                        disabled={guests.pets <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{guests.pets}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("pets", "plus")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="guest-limit-info">
                    This place has a maximum of {maxGuests} guests, not including
                    infants. Pets are not allowed unless specified.
                  </p>

                  <button
                    type="button"
                    className="guest-picker-close"
                    onClick={() => setShowGuestPicker(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            <div className="special-requests-container">
              <label className="bold-label">SPECIAL REQUESTS</label>
              <textarea
                placeholder="Any special requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="booking-error-message">{error}</div>}

          <div className="booking-footer-v2">
            <button
              type="button"
              className="booking-submit-btn"
              onClick={handleBooking}
            >
              BOOKING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;