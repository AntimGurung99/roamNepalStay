import {useState} from "react";
import api from "../api/axios";
import {Link, useNavigate} from "react-router-dom";
import "../styles/register.css";

function RegisterPage(){
  const navigate = useNavigate();
  const [Form, setForm] = useState({
    email:"",
    first_name:"",
    last_name:"",
    password:"",
    confirm_password:"",
    phone_number:"",
    city:"",
    country:"",
    date_of_birth:"",
    accepted_terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    const onChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm({
        ...Form,
        [name]: type === "checkbox" ? checked : value,
      });
    };
  
    const onSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if(Form.password !== Form.confirm_password){
        setError ("Password do not match. please try again.");
        return;
      }
      const payload = {
        email:Form.email,
        first_name:Form.first_name,
        last_name:Form.last_name,
        password:Form.password,
        phone_number:Form.phone_number || null,
        city:Form.city,
        country:Form.country || null,
        date_of_birth:Form.date_of_birth || null,
        accepted_terms:Form.accepted_terms,
      };
      try {
        setLoading(true);
        await api.post("/auth/register/", payload);
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } catch (err){
        const msg = err?.response?.data?.details ||
        (typeof err?.response?.data === "string" ? err.response.data : null) || "Registration failed. Please try again.";
          setError(msg); 
      } finally {
        setLoading(false);
      }
    };
  
    return(
      <div className="top-register-page">
        
          <div className="overlay">
          
        <div className="register-form-container card--wide">
          <div className="quote">
            <p>Create your account and start exploring places across Nepal.</p>
          </div>

          {error && (<div className="register-error">{error}</div>)}

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
         value={Form.email} 
         onChange={onChange} 
         placeholder="Enter your email" 
         required/>
        

       
        <input 
        className="input"
        name="phone_number"
         value={Form.phone_number}
         onChange={onChange} 
        placeholder=" Phone Number" 
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
            value={Form.date_of_birth} 
            onChange={onChange} type="date" 
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

        <button disabled={loading} type="submit" className="register-btn">{loading ? "Creating...":"Register"}</button>

        <p className="register-footer">Already have an account? <Link to="/login">Login</Link></p>
        </form> 
      </div>
      </div>
      </div>
    
    );
  }

export default RegisterPage;
