import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/mainlogo.jpg";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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

  return (
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
        <button className="nav__hostBtn" type="button">
          Become A Host
        </button>

        <div className="nav__profile" ref={menuRef}>
          <button
            className="nav__profileBtn"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span className="nav__hamburger">☰</span>
            <span className="nav__user">👤</span>
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
  );
}
export default Navbar;
