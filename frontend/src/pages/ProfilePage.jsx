import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone_number: user?.phone_number || "",
      city: user?.city || "",
      country: user?.country || "",
      date_of_birth: user?.date_of_birth || "",
    });
    setIsEditing(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setError("");

      const res = await api.patch("/auth/profile/", formData);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditing(false);
      window.dispatchEvent(new Event("wishlistUpdate"));
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.details ||
          "Failed to update profile."
      );
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

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Not provided";

    return date.toLocaleDateString("en-GB");
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
      const imageData = new FormData();
      imageData.append("profile_image", file);

      const res = await api.patch("/auth/profile/", imageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("wishlistUpdate"));
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
          Back to Home
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

            <div className="profile-header-info">
              <h1>
                {user.first_name || "First Name"} {user.last_name || "Last Name"}
              </h1>
              <p className="profile-email">{user.email || "No email found"}</p>
            </div>
          </div>

          {error && <p className="profile-error">{error}</p>}

          <div className="profile-details">
            <div className="profile-row">
              <div className="profile-label">First Name</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  user.first_name || "Not provided"
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Last Name</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  user.last_name || "Not provided"
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Email</div>
              <div className="profile-value">
                {user.email || "Not provided"}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Phone Number</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  user.phone_number || "Not provided"
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Date of Birth</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  formatDate(user.date_of_birth)
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">City</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  user.city || "Not provided"
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Country</div>
              <div className="profile-value">
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  user.country || "Not provided"
                )}
              </div>
            </div>

            <div className="profile-row">
              <div className="profile-label">Account Type</div>
              <div className="profile-value">
                {user.is_host ? "Host" : "Guest"}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="profile-btn-group">
              <button
                className="save-profile-btn"
                onClick={handleSave}
                type="button"
              >
                Save Changes
              </button>

              <button
                className="cancel-profile-btn"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="edit-profile-btn"
              onClick={handleEditClick}
              type="button"
            >
              Edit Profile
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;