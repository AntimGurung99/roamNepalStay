import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const resp = await api.post("/auth/forgot-password/", {
        email: cleanEmail,
      });

      toast.success(
        resp.data?.detail || "If the account exists, OTP has been sent."
      );

      navigate("/reset-password", {
        state: { email: cleanEmail },
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not process forgot password request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={onSubmit}>
        <h2 className="login-title">Forgot Password</h2>

        {error && <div className="login-error-box">{error}</div>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button disabled={loading} type="submit" className="login-btn">
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="login-footer">
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}