import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.email.trim()) return setErrors({ email: "Email is required" });
    if (!form.password) return setErrors({ password: "Password is required" });

    try {
      setLoading(true);

      const resp = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setErrors({ general: data?.detail || "Login failed" });
        return;
      }

      // Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch {
      setErrors({ general: "Network error. Is backend running?" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={onSubmit}>
        <h2 className="login-title">LOG IN</h2>

        {errors.general && <p className="error-text">{errors.general}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
        />
        {errors.email && <small className="error-text">{errors.email}</small>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
        />
        {errors.password && <small className="error-text">{errors.password}</small>}

        <button disabled={loading} type="submit" className="login-btn">
          {loading ? "Logging in..." : "LOG IN"}
        </button>

        <p className="login-footer">
          Don’t have an account? <Link to="/register">Register Here</Link>
        </p>
      </form>
    </div>
  );
}
