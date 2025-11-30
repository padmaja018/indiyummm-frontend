import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Reviews from "./components/Reviews";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyOrders from "./pages/MyOrders";

import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";

import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignup from "./pages/CustomerSignup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import "./App.css";

export default function App() {
  const isAdmin = localStorage.getItem("admin_token");
  const isCustomer = localStorage.getItem("customer_token");

  // Detect if we are inside /admin route
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <Router>
      <div className="app">

        {/* NAVBAR */}
        <header className="navbar">
          <h1 className="logo">Indiyummm</h1>

          <nav className="desktop-nav">

            {/* ---------------- ADMIN NAVIGATION ---------------- */}
            {isAdminRoute ? (
              isAdmin ? (
                <>
                  <span style={{ color: "#4A7C59", marginRight: 15 }}>
                    Admin Panel
                  </span>

                  <Link to="/admin/orders">Orders</Link>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem("admin_token");
                      localStorage.removeItem("admin_name");
                      window.location.href = "/admin/login";
                    }}
                    style={{ marginLeft: 15 }}
                  >
                    Logout
                  </a>
                </>
              ) : (
                <></>
              )
            ) : (
              /* ---------------- CUSTOMER / PUBLIC NAVIGATION ---------------- */
              <>
                <Link to="/my-orders">My Orders</Link>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>

                {/* CUSTOMER LOGGED IN */}
                {isCustomer ? (
                  <>
                    <span style={{ color: "#4A7C59", marginLeft: 10 }}>
                      Hi, {localStorage.getItem("customer_name") || "Customer"}
                    </span>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.removeItem("customer_token");
                        localStorage.removeItem("customer_name");
                        localStorage.removeItem("customer_email");
                        window.location.href = "/";
                      }}
                      style={{ marginLeft: 10 }}
                    >
                      Logout
                    </a>
                  </>
                ) : (
                  /* CUSTOMER NOT LOGGED IN → show Login + Signup */
                  <>
                    <Link to="/customer/login" style={{ marginLeft: 10 }}>
                      Login
                    </Link>
                    <Link to="/customer/signup">Sign up</Link>
                  </>
                )}
              </>
            )}

          </nav>
        </header>

        {/* PAGE CONTENT WITH SPACING (navbar overlap fix) */}
        <div style={{ marginTop: isAdminRoute ? "120px" : "0px" }}>

          <Routes>
            {/* PUBLIC / CUSTOMER ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/about" element={<About />} />

            {/* CUSTOMER AUTH ROUTES */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>

        </div>

        <footer>
          <p>
            © 2025 Indiyummm. All Rights Reserved managed and designed by digital
            launch studio25.
          </p>
        </footer>
        <ToastContainer position="top-center" autoClose={2000} />

      </div>
    </Router>
  );
}
