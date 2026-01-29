import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { toast } from "react-toastify";

const API_BASE = "http://127.0.0.1:8000";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validateClient = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    if (form.password !== form.confirm_password)
      e.confirm_password = "Passwords do not match";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setErrors({});

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    try {
      setLoading(true);

      const resp = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        
        if (data && typeof data === "object") {
          const flat = {};
          for (const key of Object.keys(data)) {
            flat[key] = Array.isArray(data[key]) ? data[key][0] : String(data[key]);
          }
          setErrors(flat);

          
          toast.error("Registration failed. Please check the form.");
        } else {
          setErrors({ general: "Registration failed. Please try again." });
          toast.error("Registration failed. Please try again.");
        }
        return;
      }

      toast.success("Registration successfull..", {
        position: "top-right",
        autoClose: 4000,
      });

      
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setErrors({ general: "Network error. Is the backend running on port 8000?" });
      toast.error("Network error. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={onSubmit}>
        <h2 className="register-title">Register</h2>

        {errors.general && <p className="error-text">{errors.general}</p>}
        {errors.name && <p className="error-text">{errors.name}</p>}

        <div className="register-form">
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={onChange}
          />
          {errors.first_name && <small className="error-text">{errors.first_name}</small>}

          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={onChange}
          />
          {errors.last_name && <small className="error-text">{errors.last_name}</small>}

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

          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={onChange}
          />
          {errors.confirm_password && (
            <small className="error-text">{errors.confirm_password}</small>
          )}

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "REGISTER"}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
