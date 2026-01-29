import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/mainlogo.jpg";



 function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
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

  return (
    <header className="nav">
      <div className="nav__left">
        {/* <Link to="/" className="nav__brand">
          {logo}
          <div className="nav__logoBox">
            <span className="nav__logoText">Roam Nepal Stay</span>
          </div>
        </Link> */}
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
              <button className="nav__dropItem" onClick={() => go("/login")}>
                Log In
              </button>
              <button className="nav__dropItem nav__dropItem--accent" onClick={() => go("/register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default Navbar;