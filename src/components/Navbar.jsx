import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const customerName = localStorage.getItem("customer_name") || "";

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    localStorage.removeItem("customer_email");

    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">Indiyummm</Link>
        </div>

        {/* Hamburger for mobile */}
        <div
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </div>

        {/* Desktop Menu */}
        <ul className="nav-links desktop-only">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dry-chutneys">Dry Chutneys</Link></li>
          <li><Link to="/pickles">Pickles</Link></li>
          <li><Link to="/about">About</Link></li>

          {token ? (
            <>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li className="nav-user">Hi, {customerName}</li>
              <li><span className="logout-btn" onClick={logout}>Logout</span></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </>
          )}
        </ul>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <ul className="nav-links mobile-menu">
            <li onClick={() => setMobileMenuOpen(false)}><Link to="/">Home</Link></li>
            <li onClick={() => setMobileMenuOpen(false)}><Link to="/dry-chutneys">Dry Chutneys</Link></li>
            <li onClick={() => setMobileMenuOpen(false)}><Link to="/pickles">Pickles</Link></li>
            <li onClick={() => setMobileMenuOpen(false)}><Link to="/about">About</Link></li>

            {token ? (
              <>
                <li onClick={() => setMobileMenuOpen(false)}><Link to="/my-orders">My Orders</Link></li>
                <li className="nav-user">Hi, {customerName}</li>
                <li><span className="logout-btn" onClick={logout}>Logout</span></li>
              </>
            ) : (
              <>
                <li onClick={() => setMobileMenuOpen(false)}><Link to="/login">Login</Link></li>
                <li onClick={() => setMobileMenuOpen(false)}><Link to="/signup">Signup</Link></li>
              </>
            )}
          </ul>
        )}
      </nav>
    </>
  );
}
