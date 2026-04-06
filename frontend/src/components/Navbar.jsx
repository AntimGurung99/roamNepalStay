import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Navbar.css";
import logo from "../assets/mainlogo.jpg";
import HostApplicationModal from "./HostApplicationModal";
import CreateListingModal from "./CreateListingModal";
import ProfileIcon from "../pages/ProfileIcon";
import { RxHamburgerMenu } from "react-icons/rx";
import NotificationBell from "./NotificationBell";

function Navbar({ searchTerm, setSearchTerm }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        refreshUserData();
      } catch (error) {
        console.error("User parse error:", error);
      }
    }

    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const refreshUserData = async () => {
    try {
      const response = await api.get("/auth/profile/");
      const latestUser = response.data;
      localStorage.setItem("user", JSON.stringify(latestUser));
      setUser(latestUser);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn("Session expired");
        handleLogout();
      } else {
        console.error("Failed to refresh user", error);
      }
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshUserData();
    window.addEventListener("wishlistUpdate", handleUpdate);

    return () => window.removeEventListener("wishlistUpdate", handleUpdate);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);
    setOpen(false);

    navigate("/login");
  };

  const handleBecomeHost = () => {
    if (!user) {
      alert("Please login first to become a host.");
      navigate("/login");
      return;
    }
    setIsHostModalOpen(true);
  };

  const handleAddListing = () => {
    setIsListingModalOpen(true);
  };

  return (
    <>
      <header className="nav">
        {/* LEFT */}
        <div className="nav__left">
          <Link to="/" className="nav__brand">
            <img src={logo} alt="Roam Nepal Stay" className="nav__logo" />
            <span className="nav__logoText">Roam Nepal Stay</span>
          </Link>
        </div>

        {/* CENTER */}
        <div className="nav__center">
          <div className="nav__search">
            <input
              type="text"
              placeholder="Search by title, city, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
            <button type="button">Search</button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="nav__right">
          <Link to="/explore-map" className="nav__exploreMap">
            <i
              className="bi bi-geo-alt-fill"
              style={{ marginRight: "6px" }}
            ></i>
            Explore Map
          </Link>

          {/* HOST BUTTON */}
          {user?.is_host ? (
            <button
              className="nav__hostBtn"
              type="button"
              onClick={handleAddListing}
            >
              Add Listing
            </button>
          ) : user?.host_application_status === "pending" ? (
            <button
              className="nav__hostBtn nav__hostBtn--pending"
              type="button"
              disabled
            >
              Pending Review
            </button>
          ) : user?.host_application_status === "needs_more_info" ? (
            <button
              className="nav__hostBtn nav__hostBtn--warning"
              type="button"
              onClick={handleBecomeHost}
            >
              Action Required
            </button>
          ) : user?.host_application_status === "rejected" ? (
            <button
              className="nav__hostBtn nav__hostBtn--danger"
              type="button"
              onClick={handleBecomeHost}
            >
              Re-apply
            </button>
          ) : (
            <button
              className="nav__hostBtn"
              type="button"
              onClick={handleBecomeHost}
            >
              Become A Host
            </button>
          )}

          {/* NOTIFICATION BELL */}
          {/* {user && <NotificationBell />} */}
          {user && (
            <NotificationBell
              scope="guest"
              title="Guest Notifications"
              viewAllPath="/notifications"
            />
          )}

          {/* PROFILE ICON */}
          {user && (
            <div
              className="nav__profileIcon"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <ProfileIcon user={user} />
            </div>
          )}

          {/* MENU */}
          <div className="nav__profile" ref={menuRef}>
            <button
              className="nav__profileBtn"
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span className="nav__hamburger">
                <RxHamburgerMenu />
              </span>
            </button>

            {open && (
              <div className="nav__dropdown">
                {user ? (
                  <>
                    <div className="nav__userGreeting">
                      Hello, {user.first_name || user.email}
                    </div>

                    {user.is_host && (
                      <button
                        className="nav__dropItem"
                        onClick={() => go("/my-properties")}
                      >
                        My Properties
                      </button>
                    )}

                    <button
                      className="nav__dropItem"
                      onClick={() => go("/my-bookings")}
                    >
                      My Bookings
                    </button>

                    {user.is_host && (
                      <button
                        className="nav__dropItem"
                        onClick={() => go("/host/dashboard")}
                      >
                        Host Dashboard
                      </button>
                    )}

                    <button
                      className="nav__dropItem"
                      onClick={() => go("/wishlist")}
                    >
                      Wishlist {user.wishlist_count > 0 && `(${user.wishlist_count})`}
                    </button>

                    {(user.is_staff || user.is_superuser) && (
                      <button
                        className="nav__dropItem"
                        onClick={() => go("/admin")}
                      >
                        Admin Dashboard
                      </button>
                    )}

                    <button className="nav__dropItem" onClick={handleLogout}>
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="nav__dropItem nav__dropItem--accent"
                      onClick={() => go("/login")}
                    >
                      Log In
                    </button>

                    <button
                      className="nav__dropItem nav__dropItem--accent"
                      onClick={() => go("/register")}
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <HostApplicationModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onSuccess={() => {
          setIsHostModalOpen(false);
          refreshUserData();
        }}
      />

      <CreateListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />
    </>
  );
}

export default Navbar;