import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { toast } from "react-toastify";

function RegisterPage() {
  const navigate = useNavigate();

  const [Form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    city: "",
    country: "",
    date_of_birth: "",
    accepted_terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Form.password !== Form.confirm_password) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    const payload = {
      email: Form.email.trim().toLowerCase(),
      first_name: Form.first_name.trim(),
      last_name: Form.last_name.trim(),
      password: Form.password,
      confirm_password: Form.confirm_password,
      phone_number: Form.phone_number || null,
      city: Form.city.trim(),
      country: Form.country.trim() || null,
      date_of_birth: Form.date_of_birth || null,
      accepted_terms: Form.accepted_terms,
    };

    try {
      setLoading(true);

      const resp = await api.post("/auth/register/", payload);

      if (resp.data?.otp_sent === false) {
        setError(resp.data?.detail || resp.data?.details || "OTP could not be sent.");
        return;
      }

      toast.success(
        resp.data?.detail ||
          resp.data?.details ||
          "Registration successful! Please verify OTP."
      );

      navigate("/verify-otp", {
        state: { email: payload.email },
      });
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      console.log("REGISTER RESPONSE:", err?.response);
      console.log("REGISTER DATA:", err?.response?.data);

      const data = err?.response?.data;

      const msg =
        data?.detail ||
        data?.details ||
        data?.email?.[0] ||
        data?.first_name?.[0] ||
        data?.last_name?.[0] ||
        data?.password?.[0] ||
        data?.confirm_password?.[0] ||
        data?.phone_number?.[0] ||
        data?.date_of_birth?.[0] ||
        data?.accepted_terms?.[0] ||
        err?.message ||
        "Registration failed. Please try again.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="top-register-page">
      <div className="overlay">
        <div className="register-form-container card--wide">
          <div className="quote">
            <p>Create your account and start exploring places across Nepal.</p>
          </div>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={onSubmit} className="register-form">
            <div className="grid">
              <div className="input-field-one">
                <input
                  className="input"
                  name="first_name"
                  value={Form.first_name}
                  onChange={onChange}
                  placeholder="First Name"
                  required
                />

                <input
                  className="input"
                  name="last_name"
                  value={Form.last_name}
                  onChange={onChange}
                  placeholder="Last Name"
                  required
                />
              </div>

              <input
                className="input"
                name="email"
                type="email"
                value={Form.email}
                onChange={onChange}
                placeholder="Enter your email"
                required
              />

              <input
                className="input"
                name="phone_number"
                value={Form.phone_number}
                onChange={onChange}
                placeholder="Phone Number"
                maxLength={10}
              />

              <div className="input-field-two">
                <input
                  className="input"
                  name="city"
                  value={Form.city}
                  onChange={onChange}
                  placeholder="City"
                  required
                />

                <input
                  className="input"
                  name="country"
                  value={Form.country}
                  onChange={onChange}
                  placeholder="Country"
                />
              </div>

              <input
                className="input"
                name="date_of_birth"
                type="date"
                value={Form.date_of_birth}
                onChange={onChange}
                placeholder="Date of Birth (Optional)"
              />

              <input
                className="input"
                type="password"
                name="password"
                value={Form.password}
                onChange={onChange}
                placeholder="Password"
                required
              />

              <input
                className="input"
                type="password"
                name="confirm_password"
                value={Form.confirm_password}
                onChange={onChange}
                placeholder="Confirm Password"
                required
              />
            </div>

            <label className="register-terms">
              <input
                type="checkbox"
                name="accepted_terms"
                checked={Form.accepted_terms}
                onChange={onChange}
              />
              <span>I agree to the Terms and Conditions</span>
            </label>

            <button disabled={loading} type="submit" className="register-btn">
              {loading ? "Creating..." : "REGISTER"}
            </button>

            <p className="register-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;