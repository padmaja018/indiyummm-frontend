import React, { useState } from "react";
import { toast } from "react-toastify";


export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");


  const BACKEND = "https://indiyummm-backend.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("Logging in...");
    try {
      const res = await fetch(`"https://indiyummm-backend.onrender.com/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data?.success) {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_email", data.user.email);
        localStorage.setItem("customer_name", data.user.name);
        toast.success("Login successful!");

        //setMsg("Login successful, redirecting...");
        window.location.href = "/my-orders";
      } else {
       // setMsg(data.error || "Login failed");
       toast.error("Invalid email or password");

      }
    } catch (err) {
      console.error(err);
      setMsg("Login error");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20, background: "#fffaf0", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", color: "#4A7C59" }}>Customer Login</h2>
      <form onSubmit={handleLogin}>
        <input required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" style={input}/>
        <input required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" style={input}/>
        <button type="submit" style={btn}>Login</button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

const input = { width: "100%", padding: 12, marginBottom: 10, borderRadius: 6, border: "1px solid #ddd" };
const btn = { width: "100%", padding: 12, background: "#4A7C59", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
