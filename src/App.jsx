import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Reviews from "./components/Reviews";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        {/* Navbar */}
        <header className="navbar">
          <h1 className="logo">Indiyummm</h1>
          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            
            <Link to="/about">About</Link>
          </nav>
        </header>

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
         
          <Route path="/about" element={<About />} />
        </Routes>

        {/* Footer */}
        <footer>
          <p>© 2025 Indiyummm. All Rights Reserved managed and designed by digital launch studio25.</p>
        </footer>
      </div>
    </Router>
  );
}
