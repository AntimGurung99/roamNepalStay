import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../api/axios";
import "../styles/login.css";

function LoginPage(){
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email:"",
    password:""});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const onChange= (e) =>{
    const {name, value} = e.target;
    setForm((prev) => ({...prev, 
      [name]: value
    }))
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrors({email: "Email is required."})
      return;

    }
    if (!form.password){
      setErrors({password: "Password is required."})
      return;
    }

    try {
      setLoading(true);

      const resp = await api.post ("/auth/login",{
        email: cleanEmail,
        password: form.password,
      });

      const data = resp.data;
      localStorage.setItem("access", data.access);
      localStorage.setItem("refesh", data.refresh);
      localStorage.setItem("user",JSON.stringify(data.user));

      if (data.user?.is_staff || data.user?.is_superuser){
        navigate("/admin");
      }
      else {
        navigate("/");
      }
    } catch(err){
      const data = err?.response?.data;
      if (data?.email){
        setErrors({
          email: Array.isArray(data.email) ?data.email[0] : data.email
        });
      } else if (data?.password){
        setErrors ({
          password: Array.isArray(data.password) ? data.password[0] : data.password, 
        });
      }else {
        setErrors({
          general: 
          data?.detail ||
          data?.details ||
          "Login failed. Please try again.",
        });
      }
    } finally{
      setLoading(false);
    }
  };
  return (
    <div className="login-full-container">
      <form className="login-card" onSubmit={onSubmit}>
        <h2 className="login-title"> Log In</h2>

        {errors.general && <p className="error-text">{errors.general}</p>}
        <input
        type="email"
        name="email"
        placeholder="Enter you Email"
        value={form.email}
        onChange={onChange}
        />

        {errors.email && <small className="error-text">{errors.email}</small>}

        <input
        type="password"
        name= "password"
        placeholder="password"
        value={form.password}
        onChange={onChange}
        />

        {errors.password && <small className="error-text">{errors.password}</small>}
       
       <button type="submit" className="login-btn" disabled = {loading}>
        {loading ? "Logging in.....": "LOG IN"}
       </button>

       <p className="login-footer">
        Don't have an account? <Link to="/register">Register Here</Link>
       </p>
      </form>
      </div>
  );
}
export default LoginPage;