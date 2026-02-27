import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/mainlogo.jpg";
import HostApplicationModal from "./HostApplicationModal";
import CreateListingModal from "./CreateListingModal";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // REFRESH LOGIC:
        // Even if we have a user in localStorage, we fetch the latest profile from the server.
        // This is crucial for knowing if an admin has approved a host application or changed permissions.
        refreshUserData();
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Fetch latest user data from backend
  const refreshUserData = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const latestUser = await response.json();
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      } else if (response.status === 401) {
        // Token expired or invalid - clear it
        console.warn("Session expired. Logging out.");
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshUserData();
    window.addEventListener('wishlistUpdate', handleUpdate);
    return () => window.removeEventListener('wishlistUpdate', handleUpdate);
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
      {!isListingModalOpen && !isHostModalOpen && (
        <header className="nav">
          <div className="nav__left">
            <Link to="/" className="nav__brand">
              <img src={logo} alt="Roam Nepal Stay" className="nav__logo" />
              <span className="nav__logoText">Roam Nepal Stay</span>
            </Link>
          </div>

          <div className="nav__center">
            <div className="nav__search">
              <input placeholder="Search..." />
              <button type="button" aria-label="Search">
                Search
              </button>
            </div>
          </div>

          <div className="nav__right">
            {/* Host/Listing logic: If user is already a host, show "Add Listing" button */}
            {user?.is_host ? (
              <button 
                className="nav__hostBtn" 
                type="button"
                onClick={handleAddListing}
              >
                Add Listing
              </button>
            ) : user?.host_application_status === 'pending' ? (
              /* If application is submitted but not yet approved by admin */
              <button 
                className="nav__hostBtn nav__hostBtn--pending" 
                type="button"
                disabled
                title="Your application is being reviewed by our team"
              >
                Pending Review
              </button>
            ) : (
              /* If user is not a host and hasn't applied, show "Become A Host" button */
              <button 
                className="nav__hostBtn" 
                type="button"
                onClick={handleBecomeHost}
              >
                Become A Host
              </button>
            )}

            <div className="nav__profile" ref={menuRef}>
              <button
                className="nav__profileBtn"
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                <span className="nav__hamburger">MENU</span>
                {/* <span className="nav__user">P</span> */}
              </button>

              {open && (
                <div className="nav__dropdown">
                  {user ? (
                    <>
                      <div className="nav__userGreeting">
                        Hello, {user.first_name || user.email}
                      </div>
                      <button className="nav__dropItem" onClick={() => go("/profile")}>
                        Profile
                      </button>
                      {user.is_host && (
                        <button className="nav__dropItem" onClick={() => go("/my-properties")}>
                          My Properties
                        </button>
                      )}
                      <button className="nav__dropItem" onClick={() => go("/wishlist")}>
                        Wishlist {user.wishlist_count > 0 && `(${user.wishlist_count})`}
                      </button>
                      {(user.is_staff || user.is_superuser) && (
                        <button className="nav__dropItem" onClick={() => go("/admin")}>
                          Admin Dashboard
                        </button>
                      )}
                      <button className="nav__dropItem" onClick={handleLogout}>
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="nav__dropItem" onClick={() => go("/login")}>
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
      )}

      <HostApplicationModal 
        isOpen={isHostModalOpen} 
        onClose={() => setIsHostModalOpen(false)} 
      />
      <CreateListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />
    </>
  );
}
export default Navbar;
