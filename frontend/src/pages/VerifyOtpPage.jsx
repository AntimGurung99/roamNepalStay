import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/verifyotp.css"
import {toast} from "react-toastify";


function VerifyOtpPage () {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = location.state?.email || "";

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState ("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");



  useEffect(() => {
    setEmail(stateEmail); // state mah jun email aauxa tyo email mah update hunxa plus yedi users lay page refresh garxa page state gayo vanay panu type garna sakxa
  }, [stateEmail] )

const onVerify = async (e) => {
  e.preventDefault();
  setError("");

  const cleanEmail = (email || "") .trim().toLowerCase();
  const cleanOtp = (otp || "").trim();

  if (!cleanEmail){
    setError("Email is required.");
    return
  }
  if (cleanOtp.length !== 6) {
    setError("OTP must be 6 digits.");
    return
  }

  try{
    setLoading(true);
    await api.post("/auth/verify-otp/",{
      email: cleanEmail,
      otp : cleanOtp,
    });

    toast.success("Email verified successfully. Please Login.")
    navigate("/login", {state: {email: cleanEmail}});
  } catch (err){
    const msg = 
    err?.response?.data?.detail ||
    err?.response?.data?.details ||
    "OTP verification failed. Please try again.";

    setError(msg);
  } finally {
    setLoading(false);
  }
};
const onResend = async () => {
  setError("");
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail){
    setError("Email is required to resend OTP.");
    return;
  }
  try {
    setResending(true);
    await api.post("/auth/resend-otp/", {email: cleanEmail});
    toast.success("OTP resent. Please check your email.");
  } catch (err){
    const msg = 
    err?.response?.data?.detail ||
    err?.response?.data?.details ||
    "Could not resend OTP. Please try again.";

    setError(msg);
  } finally{
    setResending(false);
  }
};

return (
  < div className="top-verify-page">
    <div className="verify-overlay">
      <div className="verify-form-container">
        <div className="verify-header">
          <h1>Verify your Email</h1>
          <p>Enter the 6-digit OTP sent to your email.</p>
        </div>
        {error && <div className="verify-error">{error}</div>}
        <form onSubmit={onVerify} className="verify-form">
          <div className="grid">
            <input
            className="verify-input"
            name="email"
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            readOnly
            required
            />

            <input
            className="verify-input"
            name="otp"
            value = {otp}
            onChange={(e) => {
              const numbers = e.target.value.replace(/\D/g,"").slice(0,6);
              setOtp(numbers);
            }}
            placeholder="Enter 6-digit OTP."
            inputMode="numeric"
            maxLength = {6}
            required
            />
            </div>
            <button disabled={loading} type="submit" className="verify-btn">{loading ? "Verifying....": "Verify OTP"}
            </button>
            <button
              type="button"
              className="resend-btn"
              onClick = {onResend}
              disabled= {resending}
              style = {{marginTop:10, background: "#0a3323"}}>
                {resending ? "Resending...":"Resend OTP"}
            </button>
            <p className="verify-footer" style={{marginTop:12}}>
              Back to <Link to="/login">Login</Link>
            </p>
            </form>
            </div>
            </div>
            </div>

);
}
export default VerifyOtpPage;