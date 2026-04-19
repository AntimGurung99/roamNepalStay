// import { useState } from "react";
// import api from "../api/axios";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/register.css";
// import { toast } from "react-toastify";

// function RegisterPage() {
//   const navigate = useNavigate();

//   const [Form, setForm] = useState({
//     email: "",
//     first_name: "",
//     last_name: "",
//     password: "",
//     confirm_password: "",
//     phone_number: "",
//     city: "",
//     country: "",
//     date_of_birth: "",
//     accepted_terms: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const onChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (Form.password !== Form.confirm_password) {
//       setError("Passwords do not match. Please try again.");
//       return;
//     }

//     const payload = {
//       email: Form.email.trim().toLowerCase(),
//       first_name: Form.first_name.trim(),
//       last_name: Form.last_name.trim(),
//       password: Form.password,
//       confirm_password: Form.confirm_password,
//       phone_number: Form.phone_number || null,
//       city: Form.city.trim(),
//       country: Form.country.trim() || null,
//       date_of_birth: Form.date_of_birth || null,
//       accepted_terms: Form.accepted_terms,
//     };

//     try {
//       setLoading(true);

//       const resp = await api.post("/auth/register/", payload);

//       if (resp.data?.otp_sent === false) {
//         setError(resp.data?.detail || resp.data?.details || "OTP could not be sent.");
//         return;
//       }

//       toast.success(
//         resp.data?.detail ||
//           resp.data?.details ||
//           "Registration successful! Please verify OTP."
//       );

//       navigate("/verify-otp", {
//         state: { email: payload.email },
//       });
//     } catch (err) {
//       console.log("REGISTER ERROR:", err);
//       console.log("REGISTER RESPONSE:", err?.response);
//       console.log("REGISTER DATA:", err?.response?.data);

//       const data = err?.response?.data;

//       const msg =
//         data?.detail ||
//         data?.details ||
//         data?.email?.[0] ||
//         data?.first_name?.[0] ||
//         data?.last_name?.[0] ||
//         data?.password?.[0] ||
//         data?.confirm_password?.[0] ||
//         data?.phone_number?.[0] ||
//         data?.date_of_birth?.[0] ||
//         data?.accepted_terms?.[0] ||
//         err?.message ||
//         "Registration failed. Please try again.";

//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="top-register-page">
//       <div className="overlay">
//         <div className="register-form-container card--wide">
//           <div className="quote">
//             <p>Create your account and start exploring places across Nepal.</p>
//           </div>

//           {error && <div className="register-error">{error}</div>}

//           <form onSubmit={onSubmit} className="register-form">
//             <div className="grid">
//               <div className="input-field-one">
//                 <input
//                   className="input"
//                   name="first_name"
//                   value={Form.first_name}
//                   onChange={onChange}
//                   placeholder="First Name"
//                   required
//                 />

//                 <input
//                   className="input"
//                   name="last_name"
//                   value={Form.last_name}
//                   onChange={onChange}
//                   placeholder="Last Name"
//                   required
//                 />
//               </div>

//               <input
//                 className="input"
//                 name="email"
//                 type="email"
//                 value={Form.email}
//                 onChange={onChange}
//                 placeholder="Enter your email"
//                 required
//               />

//               <input
//                 className="input"
//                 name="phone_number"
//                 value={Form.phone_number}
//                 onChange={onChange}
//                 placeholder="Phone Number"
//                 maxLength={10}
//               />

//               <div className="input-field-two">
//                 <input
//                   className="input"
//                   name="city"
//                   value={Form.city}
//                   onChange={onChange}
//                   placeholder="City"
//                   required
//                 />

//                 <input
//                   className="input"
//                   name="country"
//                   value={Form.country}
//                   onChange={onChange}
//                   placeholder="Country"
//                 />
//               </div>

//               <input
//                 className="input"
//                 name="date_of_birth"
//                 type="date"
//                 value={Form.date_of_birth}
//                 onChange={onChange}
//                 placeholder="Date of Birth (Optional)"
//               />

//               <input
//                 className="input"
//                 type="password"
//                 name="password"
//                 value={Form.password}
//                 onChange={onChange}
//                 placeholder="Password"
//                 required
//               />

//               <input
//                 className="input"
//                 type="password"
//                 name="confirm_password"
//                 value={Form.confirm_password}
//                 onChange={onChange}
//                 placeholder="Confirm Password"
//                 required
//               />
//             </div>

//             <label className="register-terms">
//               <input
//                 type="checkbox"
//                 name="accepted_terms"
//                 checked={Form.accepted_terms}
//                 onChange={onChange}
//               />
//               <span>I agree to the Terms and Conditions</span>
//             </label>

//             <button disabled={loading} type="submit" className="register-btn">
//               {loading ? "Creating..." : "REGISTER"}
//             </button>

//             <p className="register-footer">
//               Already have an account? <Link to="/login">Login</Link>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RegisterPage;


import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  const setTemporaryError = (message) => {
    setError(message);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = value;

    if (name === "phone_number") {
      newValue = value.replace(/\D/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : newValue,
    }));
  };

  const validateForm = () => {
    const trimmedEmail = Form.email.trim().toLowerCase();
    const trimmedPhone = Form.phone_number.trim();

    // Must be a valid email and contain at least one letter before @
    const emailRegex =
      /^(?=[^@]*[A-Za-z])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const phoneRegex = /^\d{10}$/;

    // At least 8 chars, at least one letter, at least one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!Form.first_name.trim()) {
      setTemporaryError("First name is required.");
      return false;
    }

    if (!Form.last_name.trim()) {
      setTemporaryError("Last name is required.");
      return false;
    }

    if (!trimmedEmail) {
      setTemporaryError("Email is required.");
      return false;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setTemporaryError(
        "Please enter a valid email address. Email must contain at least one letter before @."
      );
      return false;
    }

    if (!trimmedPhone) {
      setTemporaryError("Phone number is required.");
      return false;
    }

    if (!phoneRegex.test(trimmedPhone)) {
      setTemporaryError("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!Form.city.trim()) {
      setTemporaryError("City is required.");
      return false;
    }

    if (!Form.password) {
      setTemporaryError("Password is required.");
      return false;
    }

    if (!passwordRegex.test(Form.password)) {
      setTemporaryError(
        "Password must be at least 8 characters and include both letters and numbers."
      );
      return false;
    }

    if (!Form.confirm_password) {
      setTemporaryError("Confirm password is required.");
      return false;
    }

    if (Form.password !== Form.confirm_password) {
      setTemporaryError("Passwords do not match.");
      return false;
    }

    if (!Form.accepted_terms) {
      setTemporaryError("You must agree to the Terms and Conditions.");
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const payload = {
      email: Form.email.trim().toLowerCase(),
      first_name: Form.first_name.trim(),
      last_name: Form.last_name.trim(),
      password: Form.password,
      confirm_password: Form.confirm_password,
      phone_number: Form.phone_number.trim(),
      city: Form.city.trim(),
      country: Form.country.trim() || null,
      date_of_birth: Form.date_of_birth || null,
      accepted_terms: Form.accepted_terms,
    };

    try {
      setLoading(true);

      const resp = await api.post("/auth/register/", payload);

      if (resp.data?.otp_sent === false) {
        setTemporaryError(
          resp.data?.detail || resp.data?.details || "OTP could not be sent."
        );
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

      let msg =
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

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("email") &&
        msg.toLowerCase().includes("exist")
      ) {
        msg = "Email already exists.";
      }

      setTemporaryError(msg);
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
                />

                <input
                  className="input"
                  name="last_name"
                  value={Form.last_name}
                  onChange={onChange}
                  placeholder="Last Name"
                />
              </div>

              <input
                className="input"
                name="email"
                type="email"
                value={Form.email}
                onChange={onChange}
                placeholder="Enter your email"
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
                placeholder="Date of Birth"
              />

              <div className="password-wrapper">
                <input
                  className="input password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={Form.password}
                  onChange={onChange}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              <div className="password-wrapper">
                <input
                  className="input password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={Form.confirm_password}
                  onChange={onChange}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
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