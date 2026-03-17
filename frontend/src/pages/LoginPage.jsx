import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({ general: "" });

    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrors({ general: "Email is required." });
      return;
    }

    if (!form.password) {
      setErrors({ general: "Password is required." });
      return;
    }

    try {
      setLoading(true);

      const resp = await api.post("/auth/login/", {
        email: cleanEmail,
        password: form.password,
      });

      const data = resp.data;
      const user = data.user;

      // Save JWT tokens and user in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigation logic
      if (user.is_superuser || user.is_staff) {
        // Admin dashboard
        navigate("/admin");
      } else if (user.is_email_verified) {
        // Verified normal user
        navigate("/");
      } else {
        // Unverified user
        navigate("/verify-otp");
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("LOGIN RESPONSE:", err?.response);
      console.log("LOGIN DATA:", err?.response?.data);

      const data = err?.response?.data;
    
      setErrors({
        general:
          data?.detail ||
          data?.details ||
          data?.message ||
          data?.email?.[0] ||
          data?.password?.[0] ||
          err?.message ||
          "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={onSubmit}>
        <h2 className="login-title">Log In</h2>

        <div className="error-box">{errors.general}</div>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={onChange}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        <button disabled={loading} type="submit" className="login-btn">
          {loading ? "Logging in..." : "LOG IN"}
        </button>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register Here</Link>
        </p>
      </form>
    </div>
  );
}