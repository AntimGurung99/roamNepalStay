import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateEmail = location.state?.email || "";

  const [form, setForm] = useState({
    email: stateEmail,
    otp: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, email: stateEmail }));
  }, [stateEmail]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      setForm((prev) => ({
        ...prev,
        otp: value.replace(/\D/g, "").slice(0, 6),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      email: form.email.trim().toLowerCase(),
      otp: form.otp.trim(),
      password: form.password,
      confirm_password: form.confirm_password,
    };

    if (!payload.email) {
      setError("Email is required.");
      return;
    }

    if (payload.otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (payload.password !== payload.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const resp = await api.post("/auth/reset-password/", payload);

      toast.success(resp.data?.detail || "Password reset successful.");
      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.password?.[0] ||
          err?.response?.data?.confirm_password?.[0] ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={onSubmit}>
        <h2 className="login-title">Reset Password</h2>

        {error && <div className="login-error-box">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />

        <input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={form.otp}
          onChange={onChange}
          inputMode="numeric"
          maxLength={6}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="New password"
          value={form.password}
          onChange={onChange}
          required
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm new password"
          value={form.confirm_password}
          onChange={onChange}
          required
        />

        <button disabled={loading} type="submit" className="login-btn">
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="login-footer">
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}