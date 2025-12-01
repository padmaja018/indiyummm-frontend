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

  // Auto fade transition every 6 seconds
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

      <div className="about-container">

        {/* 🌿 Hero Banner */}
        <section className="about-hero">
          <h1>About Indiyummm</h1>
          <p>Pure • Traditional • Handmade with Love</p>
        </section>

        {/* 🌿 Brand Story */}
        <section className="about-section fade-in">
          <h2 className="section-title">Our Story</h2>
          <p>
            Indiyummm was born from a simple belief — that real taste comes from
            purity, tradition, and love. In today’s world filled with preservatives
            and artificial flavors, we bring you the authentic goodness of homemade
            chutneys and pickles crafted exactly the way our mothers and grandmothers
            made them.
          </p>
          <p>
            Every product is prepared in small batches using 100% natural,
            premium-quality ingredients sourced directly from farmers.
            No shortcuts. No chemicals. Only honest flavors that remind you of home.
          </p>
        </section>

        {/* 🌿 Founder Section */}
        <section className="about-section founder-section fade-in">
          <h2 className="section-title">Meet Our Founder</h2>

          <div className="founder-card">
            <img src="/founder.jpg" className="founder-photo" alt="Founder" />

            <div className="founder-info">
              <h3>Ashwini Kharat</h3>

              <p>
                My name is Ashwini. I am a homemaker who has always loved creating
                new recipes. For me, cooking is not just a daily responsibility —
                it is my passion. Traditional flavours, homemade taste, and pure
                quality are at the heart of everything I make.
              </p>

              <p>
                Indiyummm began from this love for cooking. I wanted everyone to
                enjoy fresh, natural, and delicious chutneys made with true homemade
                care. Nothing is stored for long — we prepare only fresh batches
                so that customers receive the authentic taste of our kitchen.
                Pickles are prepared 15 days earlier to allow perfect fermentation
                and flavour maturity.
              </p>

              <p>
                Through this small venture, my mission is simple — deliver handmade,
                preservative-free, wholesome chutneys and pickles that taste just
                like home.
              </p>
            </div>
          </div>
        </section>

        {/* 🌿 Why Choose Us */}
        <section className="about-section fade-in">
          <h2 className="section-title">Why Choose Indiyummm?</h2>

          <div className="why-grid">
            <div className="why-card">🌿 100% Natural Ingredients</div>
            <div className="why-card">🥥 Authentic Homemade Recipes</div>
            <div className="why-card">🔥 Hand-roasted Spices</div>
            <div className="why-card">🚫 No Preservatives or Chemicals</div>
            <div className="why-card">👩‍🌾 Supporting Local Farmers</div>
            <div className="why-card">❤️ Made with Love & Care</div>
          </div>
        </section>

        {/* 🌿 Process Section */}
        <section className="about-section fade-in">
          <h2 className="section-title">How We Make Our Chutneys</h2>

          <div className="process-box">
            <ol>
              <li>Fresh ingredients sourced directly from farmers.</li>
              <li>Ingredients are hand-cleaned & sun-dried naturally.</li>
              <li>Spices are roasted slowly for rich aroma.</li>
              <li>Everything is stone-ground in small batches.</li>
              <li>No chemicals or preservatives added — ever.</li>
              <li>Each batch is quality checked before packing.</li>
            </ol>
          </div>
        </section>

        {/* 🌿 Kitchen Gallery */}
        <section className="about-section fade-in">
          <h2 className="section-title">Inside Our Kitchen</h2>

          <div className="gallery-grid">
            <img src="/kitchen1.jpg" alt="Kitchen 1" />
            <img src="/kitchen2.jpg" alt="Kitchen 2" />
            <img src="/kitchen3.jpg" alt="Kitchen 3" />
            <img src="/kitchen4.jpg" alt="Kitchen 4" />
          </div>
        </section>

        {/* 🌿 Instagram Video Grid (Non-fade version you chose to keep) */}
        <section className="about-section fade-in">
          <h2 className="section-title">Follow Us On Instagram</h2>

          <div className="video-grid">
            {/* Video 1 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQY9WsNj-h7/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>

            {/* Video 2 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQXHk9JDIL2/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>

            {/* Video 3 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQUeKO_jLjR/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
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

  // Auto fade transition every 6 seconds
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

      <div className="about-container">

        {/* 🌿 Hero Banner */}
        <section className="about-hero">
          <h1>About Indiyummm</h1>
          <p>Pure • Traditional • Handmade with Love</p>
        </section>

        {/* 🌿 Brand Story */}
        <section className="about-section fade-in">
          <h2 className="section-title">Our Story</h2>
          <p>
            Indiyummm was born from a simple belief — that real taste comes from
            purity, tradition, and love. In today’s world filled with preservatives
            and artificial flavors, we bring you the authentic goodness of homemade
            chutneys and pickles crafted exactly the way our mothers and grandmothers
            made them.
          </p>
          <p>
            Every product is prepared in small batches using 100% natural,
            premium-quality ingredients sourced directly from farmers.
            No shortcuts. No chemicals. Only honest flavors that remind you of home.
          </p>
        </section>

        {/* 🌿 Founder Section */}
        <section className="about-section founder-section fade-in">
          <h2 className="section-title">Meet Our Founder</h2>

          <div className="founder-card">
            <img src="/founder.jpg" className="founder-photo" alt="Founder" />

            <div className="founder-info">
              <h3>Ashwini Kharat</h3>

              <p>
                My name is Ashwini. I am a homemaker who has always loved creating
                new recipes. For me, cooking is not just a daily responsibility —
                it is my passion. Traditional flavours, homemade taste, and pure
                quality are at the heart of everything I make.
              </p>

              <p>
                Indiyummm began from this love for cooking. I wanted everyone to
                enjoy fresh, natural, and delicious chutneys made with true homemade
                care. Nothing is stored for long — we prepare only fresh batches
                so that customers receive the authentic taste of our kitchen.
                Pickles are prepared 15 days earlier to allow perfect fermentation
                and flavour maturity.
              </p>

              <p>
                Through this small venture, my mission is simple — deliver handmade,
                preservative-free, wholesome chutneys and pickles that taste just
                like home.
              </p>
            </div>
          </div>
        </section>

        {/* 🌿 Why Choose Us */}
        <section className="about-section fade-in">
          <h2 className="section-title">Why Choose Indiyummm?</h2>

          <div className="why-grid">
            <div className="why-card">🌿 100% Natural Ingredients</div>
            <div className="why-card">🥥 Authentic Homemade Recipes</div>
            <div className="why-card">🔥 Hand-roasted Spices</div>
            <div className="why-card">🚫 No Preservatives or Chemicals</div>
            <div className="why-card">👩‍🌾 Supporting Local Farmers</div>
            <div className="why-card">❤️ Made with Love & Care</div>
          </div>
        </section>

        {/* 🌿 Process Section */}
        <section className="about-section fade-in">
          <h2 className="section-title">How We Make Our Chutneys</h2>

          <div className="process-box">
            <ol>
              <li>Fresh ingredients sourced directly from farmers.</li>
              <li>Ingredients are hand-cleaned & sun-dried naturally.</li>
              <li>Spices are roasted slowly for rich aroma.</li>
              <li>Everything is stone-ground in small batches.</li>
              <li>No chemicals or preservatives added — ever.</li>
              <li>Each batch is quality checked before packing.</li>
            </ol>
          </div>
        </section>

        {/* 🌿 Kitchen Gallery */}
        <section className="about-section fade-in">
          <h2 className="section-title">Inside Our Kitchen</h2>

          <div className="gallery-grid">
            <img src="/kitchen1.jpg" alt="Kitchen 1" />
            <img src="/kitchen2.jpg" alt="Kitchen 2" />
            <img src="/kitchen3.jpg" alt="Kitchen 3" />
            <img src="/kitchen4.jpg" alt="Kitchen 4" />
          </div>
        </section>

        {/* 🌿 Instagram Video Grid (Non-fade version you chose to keep) */}
        <section className="about-section fade-in">
          <h2 className="section-title">Follow Us On Instagram</h2>

          <div className="video-grid">
            {/* Video 1 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQY9WsNj-h7/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>

            {/* Video 2 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQXHk9JDIL2/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>

            {/* Video 3 */}
            <div className="video-wrapper">
              <iframe
                src="https://www.instagram.com/reel/DQUeKO_jLjR/embed"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
import React, { useEffect } from "react";
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



export default function About() {

  // Auto fade transition every 6 seconds
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
  

  return (
    <div className="about-container">

      {/* 🌿 Hero Banner */}
      <section className="about-hero">
        <h1>About Indiyummm</h1>
        <p>Pure • Traditional • Handmade with Love</p>
      </section>

      {/* 🌿 Brand Story */}
      <section className="about-section fade-in">
        <h2 className="section-title">Our Story</h2>
        <p>
          Indiyummm was born from a simple belief — that real taste comes from
          purity, tradition, and love. In today’s world filled with preservatives
          and artificial flavors, we bring you the authentic goodness of homemade
          chutneys and pickles crafted exactly the way our mothers and grandmothers
          made them.
        </p> 
        <p>
          Every product is prepared in small batches using 100% natural,
          premium-quality ingredients sourced directly from farmers.
          No shortcuts. No chemicals. Only honest flavors that remind you of home.
        </p>
      </section>

      {/* 🌿 Founder Section */}
      <section className="about-section founder-section fade-in">
        <h2 className="section-title">Meet Our Founder</h2>

        <div className="founder-card">
          <img src="/founder.jpg" className="founder-photo" alt="Founder" />

          <div className="founder-info">
            <h3>Ashwini Kharat</h3>

            <p>
              My name is Ashwini. I am a homemaker who has always loved creating
              new recipes. For me, cooking is not just a daily responsibility —
              it is my passion. Traditional flavours, homemade taste, and pure
              quality are at the heart of everything I make.
            </p>

            <p>
              Indiyummm began from this love for cooking. I wanted everyone to
              enjoy fresh, natural, and delicious chutneys made with true homemade
              care. Nothing is stored for long — we prepare only fresh batches
              so that customers receive the authentic taste of our kitchen.
              Pickles are prepared 15 days earlier to allow perfect fermentation
              and flavour maturity.
            </p>

            <p>
              Through this small venture, my mission is simple — deliver handmade,
              preservative-free, wholesome chutneys and pickles that taste just
              like home.
            </p>
          </div>
        </div>
      </section>

      {/* 🌿 Why Choose Us */}
      <section className="about-section fade-in">
        <h2 className="section-title">Why Choose Indiyummm?</h2>

        <div className="why-grid">
          <div className="why-card">🌿 100% Natural Ingredients</div>
          <div className="why-card">🥥 Authentic Homemade Recipes</div>
          <div className="why-card">🔥 Hand-roasted Spices</div>
          <div className="why-card">🚫 No Preservatives or Chemicals</div>
          <div className="why-card">👩‍🌾 Supporting Local Farmers</div>
          <div className="why-card">❤️ Made with Love & Care</div>
        </div>
      </section>

      {/* 🌿 Process Section */}
      <section className="about-section fade-in">
        <h2 className="section-title">How We Make Our Chutneys</h2>

        <div className="process-box">
          <ol>
            <li>Fresh ingredients sourced directly from farmers.</li>
            <li>Ingredients are hand-cleaned & sun-dried naturally.</li>
            <li>Spices are roasted slowly for rich aroma.</li>
            <li>Everything is stone-ground in small batches.</li>
            <li>No chemicals or preservatives added — ever.</li>
            <li>Each batch is quality checked before packing.</li>
          </ol>
        </div>
      </section>

      {/* 🌿 Kitchen Gallery */}
      <section className="about-section fade-in">
        <h2 className="section-title">Inside Our Kitchen</h2>

        <div className="gallery-grid">
          <img src="/kitchen1.jpg" alt="Kitchen 1" />
          <img src="/kitchen2.jpg" alt="Kitchen 2" />
          <img src="/kitchen3.jpg" alt="Kitchen 3" />
          <img src="/kitchen4.jpg" alt="Kitchen 4" />
        </div>
      </section>

      {/* 🌿 Instagram Video Grid (Non-fade version you chose to keep) */}
      <section className="about-section fade-in">
        <h2 className="section-title">Follow Us On Instagram</h2>

        <div className="video-grid">
          {/* Video 1 */}
          <div className="video-wrapper">
            <iframe
              src="https://www.instagram.com/reel/DQY9WsNj-h7/embed"
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>

          {/* Video 2 */}
          <div className="video-wrapper">
            <iframe
              src="https://www.instagram.com/reel/DQXHk9JDIL2/embed"
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>

          {/* Video 3 */}
          <div className="video-wrapper">
            <iframe
              src="https://www.instagram.com/reel/DQUeKO_jLjR/embed"
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      </section>

    </div>
  );
}
