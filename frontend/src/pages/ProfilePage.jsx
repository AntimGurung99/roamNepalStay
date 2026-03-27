import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});


  // jaba edit user lay click garxah current user data copy garxa into formdata maa
  const handleEditClick = () =>{
    setFormData ({
         first_name: user.first_name || "",
         last_name : user.last_name || "",
         phone_number: user.phone_number || "",
         city: user.city || "",
         country: user.country || "",
         date_of_birth: user.date_of_birth || "",
    });
    setIsEditing(true);

  };
 
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  };



   const handleSave = async () => {
    try {
      const res = await api.patch("/auth/profile/",formData);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.details || "Failed to update profile.");
    }
   };
   
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        refreshUserData();
      } catch (err) {
        console.error("Failed to parse user:", err);
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const refreshUserData = async () => {
    try {
      const res = await api.get("/auth/profile/");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = () => {
    const first = user?.first_name?.[0] || "";
    const last = user?.last_name?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await api.patch("/auth/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("wishlistUpdate"));// navbar lai vanxa ki user ko data chnage vayo tesilay reload profile picture
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.profile_image?.[0] ||
          "Failed to upload photo."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <Navbar />

      <main className="profile-content">
        <button
          className="profile-back-btn"
          onClick={() => navigate("/home")}
          type="button"
        >
          ← Back to Home
        </button>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-photo-wrapper">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="profile-photo"
                />
              ) : (
                <div className="profile-avatar">{getInitials()}</div>
              )}

              <button
                type="button"
                className="upload-photo-btn"
                onClick={handlePhotoClick}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                hidden
              />
            </div>

            <h1>
              {user.first_name || "First Name"} {user.last_name || "Last Name"}
            </h1>
            <p className="profile-email">{user.email || "No email found"}</p>
          </div>

          {error && <p className="profile-error">{error}</p>}

          <div className="profile-details">
            <div className="detail-item">
              <label>First Name</label>
              {isEditing ? (
                <input
                 name ="first_name"
                value= {formData.first_name}
                onChange={handleChange}
                className="profile-input"
              />
              ) :(

              <span>{user.first_name || "Not provided"}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Last Name</label>
               {isEditing ? (
                <input
                 name ="last_name"
                value= {formData.last_name}
                onChange={handleChange}
                className="profile-input"
              />
              ) :(
              <span>{user.last_name || "Not provided"}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Email</label>
              <span>{user.email || "Not provided"}</span>
            </div>

            <div className="detail-item">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                 name ="phone_number"
                value= {formData.phone_number || ""}
                onChange={handleChange}
                className="profile-input"
              />
              ) :(
              <span>{user.phone_number || "Not provided"}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                 type="date"
                 name ="date_of_birth"
                 value= {formData.date_of_birth}
                 onChange={handleChange}
                 className="profile-input"
              />
              ) :(
              <span>{formatDate(user.date_of_birth)}</span>
              )}
            </div>

            <div className="detail-item">
              <label>City</label>
              {isEditing ? (
                <input
                 name ="city"
                value= {formData.city}
                onChange={handleChange}
                className="profile-input"
              />
              ) :(
              <span>{user.city || "Not provided"}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Country</label>
              {isEditing ? (
                <input
                 name ="country"
                value= {formData.country}
                onChange={handleChange}
                className="profile-input"
              />
              ) :(
              <span>{user.country || "Not provided"}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Account Type</label>
              <span>{user.is_host ? "Host" : "Guest"}</span>
            </div>

            {!user.is_host && (
              <div className="detail-item">
                <label>Host Status</label>
                <span
                  className={`status-badge status-${
                    user.host_application_status || "none"
                  }`}
                >
                  {user.host_application_status === "pending"
                    ? "Pending"
                    : user.host_application_status === "approved"
                    ? "Approved"
                    : user.host_application_status === "rejected"
                    ? "Rejected"
                    : "Not Applied"}
                </span>
              </div>
            )}

            <div className="detail-item">
              <label>Status</label>
              <span className="status-badge active">Active</span>
            </div>
          </div>
          {isEditing ?  (
            <div className="profile-btn-group">
              <button className="save-profile-btn" onClick={handleSave}>Save Change</button>
            
            <button className="cancel-profile-btn" onClick={() => setIsEditing(false)}>Cancel</button>

          </div>
          ):(
            <button className="edit-profile-btn" onClick={handleEditClick}>Edit Profile</button>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;