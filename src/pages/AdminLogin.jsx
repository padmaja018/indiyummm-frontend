/* AdminLogin.jsx */
import React, { useState } from "react";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const ADMIN_EMAIL = "admin@indiyummm.com";
    const ADMIN_PASS = "Indi@1234";

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      localStorage.setItem("admin_token", "admin_logged_in");
      localStorage.setItem("admin_name", "Admin");
      window.location.href = "/admin/orders";
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "70px auto", padding: 20 }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
