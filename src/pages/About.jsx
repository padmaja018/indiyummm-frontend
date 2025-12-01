import React, { useEffect, useState } from "react";
import "./About.css";
import { Link, useNavigate } from "react-router-dom";

export default function About() {

  // ⭐ REQUIRED STATES FOR NAVBAR (same as Home.jsx)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("customer_token");
  const customerName = localStorage.getItem("customer_name");

  // ⭐ Logout
  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    localStorage.removeItem("customer_email");
    navigate("/login");
  };

  // ⭐ NAVBAR SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭐ YOUR EXISTING VIDEO FADE CODE
  useEffect(() => {
    let index = 0;
    const videos = document.querySelectorAll(".fade-video");

    if (videos.length === 0) return;

    videos.forEach((v, i) => v.classList.toggle("active", i === 0));

    const changeVideo = () => {
      videos.forEach((v) => v.classList.remove("active"));
      index = (index + 1) % videos.length;
      videos[index].classList.add("active");
    };

    const interval = setInterval(changeVideo, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ⭐⭐ ADD FULL NAVBAR FROM HOME.JSX HERE ⭐⭐ */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h1 className="logo">Indiyummm</h1>

        {/* Desktop Menu */}
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

      {/* ⭐⭐ MOBILE MENU FOR ABOUT PAGE ⭐⭐ */}
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

      {/* ⭐⭐ YOUR ABOUT CONTENT STARTS HERE (UNCHANGED) ⭐⭐ */}

      <div className="about-container">
        <section className="about-hero">
          <h1>About Indiyummm</h1>
          <p>Pure • Traditional • Handmade with Love</p>
        </section>

        <section className="about-section fade-in">
          <h2 className="section-title">Our Story</h2>
          <p>
            Indiyummm was born from a simple belief — that real taste comes from
            purity, tradition, and love.
          </p>
          <p>
            Every product is prepared in small batches using 100% natural ingredients.
          </p>
        </section>

        {/* ⭐ ALL YOUR EXISTING ABOUT CONTENT BELOW (NO CHANGES) ⭐ */}

        <section className="about-section founder-section fade-in">
          <h2 className="section-title">Meet Our Founder</h2>

          <div className="founder-card">
            <img src="/founder.jpg" className="founder-photo" alt="Founder" />

            <div className="founder-info">
              <h3>Ashwini Kharat</h3>
              <p>My name is Ashwini...</p>
              <p>Indiyummm began from this love for cooking...</p>
              <p>My mission is simple — deliver pure chutneys...</p>
            </div>
          </div>
        </section>

        <section className="about-section fade-in">
          <h2 className="section-title">Why Choose Us?</h2>

          <div className="why-grid">
            <div className="why-card">🌿 100% Natural Ingredients</div>
            <div className="why-card">🥥 Homemade Taste</div>
            <div className="why-card">🔥 Hand-roasted Spices</div>
            <div className="why-card">🚫 No Preservatives</div>
            <div className="why-card">👩‍🌾 Supporting Farmers</div>
            <div className="why-card">❤️ Made with Love</div>
          </div>
        </section>

        <section className="about-section fade-in">
          <h2 className="section-title">Follow Us On Instagram</h2>

          <div className="video-grid">
            <div className="video-wrapper">
              <iframe src="https://www.instagram.com/reel/DQY9WsNj-h7/embed" allowFullScreen></iframe>
            </div>

            <div className="video-wrapper">
              <iframe src="https://www.instagram.com/reel/DQXHk9JDIL2/embed" allowFullScreen></iframe>
            </div>

            <div className="video-wrapper">
              <iframe src="https://www.instagram.com/reel/DQUeKO_jLjR/embed" allowFullScreen></iframe>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
