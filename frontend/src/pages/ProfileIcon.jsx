import { useState } from "react";
import "../styles/ProfileIcon.css";

function ProfileIcon({ user }) {
  const [imgError, setImgError] = useState(false);

  // Field is profile_image (not profile_picture)
  const rawUrl = user?.profile_image || null;

  // Build full URL: if it's already absolute (starts with http), use as-is;
  // otherwise prepend the backend base URL for relative /media/... paths
  const imageUrl =
    rawUrl && !imgError
      ? rawUrl.startsWith("http")
        ? rawUrl
        : `http://127.0.0.1:8000${rawUrl}`
      : null;

  const initial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase();

  return (
    <div className="profileIconContainer">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="profile"
          className="profileImage"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="profileInitial">{initial}</div>
      )}
    </div>
  );
}

export default ProfileIcon;