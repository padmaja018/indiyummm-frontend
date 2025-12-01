import React, { useEffect, useState } from "react";
import "./About.css";
import { Link, useNavigate } from "react-router-dom";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const customerName = localStorage.getItem("customer_name");

  // logout
  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    localStorage.removeItem("customer_email");
    navigate("/login");
  };

  // navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ABOUT PAGE AUTO FADE (your original code)
  useEffect(() => {
    const images = document.querySelectorAll(".about-img");
    let current = 0;

    const fadeImages = () => {
      images.forEach((img, index) => {
        img.style.opacity = index === current ? 1 : 0;
      });
      current = (current + 1) % images.length;
    };

    fadeImages();
    const interval = setInterval(fadeImages, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* HEADER (copied from Home.jsx) */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h1 className="logo">Indiyummm</h1>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/">Home</Link>
          <a href="#chutneys">Dry Chutneys</a>
          <a href="#pickles">Pickles</a>
          <Link to="/about">About</Link>

          {token ? (
            <>
              <Link to="/my-orders">My Orders</Link>
              <span className="username">Hi, {customerName}</span>
              <span className="logout-btn" onClick={logout}>Logout</span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>

        {/* Mobile Icons */}
        <div className="mobile-icons">
          <button
            className="menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <a href="#chutneys" onClick={() => setMobileMenuOpen(false)}>Dry Chutneys</a>
          <a href="#pickles" onClick={() => setMobileMenuOpen(false)}>Pickles</a>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>

          {token ? (
            <>
              <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              <span className="username">Hi, {customerName}</span>
              <span className="logout-btn" onClick={logout}>Logout</span>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      )}

      {/* YOUR ABOUT PAGE CONTENT (unchanged) */}
      <div className="about-container">
        <div className="about-left">
          <img
            src="https://images.pexels.com/photos/3218467/pexels-photo-3218467.jpeg"
            className="about-img"
            alt="img1"
          />
          <img
            src="https://images.pexels.com/photos/928182/pexels-photo-928182.jpeg"
            className="about-img"
            alt="img2"
          />
        </div>

        <div className="about-right">
          <h2>About Indiyummm</h2>
          <p>
            Welcome to Indiyummm! We take pride in offering 100% natural and
            homemade dry chutneys, pickles, and masalas made from the finest
            quality ingredients.
          </p>
          <p>
            Our journey started with the passion for traditional Indian flavors
            prepared in the most hygienic and authentic way. With no added
            chemicals or preservatives, we ensure purity and freshness in every
            product.
          </p>
          <p>
            At Indiyummm, customer satisfaction is our priority. We bring the
            taste of homemade recipes to your doorstep with love and care.
          </p>
        </div>
      </div>
    </>
  );
}
