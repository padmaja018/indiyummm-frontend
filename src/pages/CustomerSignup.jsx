import React, { useState } from "react";


export default function CustomerSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");


  const BACKEND = "https://indiyummm-backend.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Please wait...");
    try {
      const res = await fetch(`${BACKEND}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data?.success) {
        // save token and email in localStorage for session
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_email", data.user.email);
        localStorage.setItem("customer_name", data.user.name);
        setMsg("Registration successful! Redirecting to My Orders...");
        window.location.href = "/my-orders";
      } else {
        setMsg(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setMsg("Failed to register");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20, background: "#fffaf0", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", color: "#4A7C59" }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={input}/>
        <input required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" style={input}/>
        <input required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" style={input}/>
        <button type="submit" style={btn}>Create Account</button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

const input = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 6, border: "1px solid #ddd" };
const btn = { width: "100%", padding: 12, background: "#4A7C59", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
