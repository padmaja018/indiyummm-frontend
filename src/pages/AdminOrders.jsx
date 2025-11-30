import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const BACKEND = "https://indiyummm-backend.onrender.com";

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      window.location.href = "/admin/login";
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await fetch(`${BACKEND}/orders`);
    const data = await res.json();
    setOrders(data.reverse()); // newest first
  };

  const updateStatus = async (orderId, status) => {
    await fetch(`${BACKEND}/update-status/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  const setETA = async (orderId) => {
    const eta = prompt("Enter Estimated Delivery Date (YYYY-MM-DD)");
    if (!eta) return;

    await fetch(`${BACKEND}/update-status/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eta }),
    });

    loadOrders();
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    await fetch(`${BACKEND}/delete-order/${orderId}`, {
      method: "DELETE",
    });

    loadOrders();
  };

  return (
    <div style={{ padding: "40px", marginTop: "120px" }}>
      <h2>Admin Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((o, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#fffef3",
            }}
          >
            <p><strong>Order ID:</strong> {o.razorpay_order_id || o.receipt}</p>
            <p><strong>Status:</strong> {o.status}</p>
            <p><strong>Amount:</strong> ₹{o.amount}</p>
            <p><strong>Date:</strong> {new Date(o.created_at).toLocaleString()}</p>
            <p><strong>ETA:</strong> {o.eta ? new Date(o.eta).toLocaleDateString() : "Not set"}</p>
       <p>
        <strong>Payment Mode:</strong>{" "}
         {o.cod || (o.razorpay_order_id && o.razorpay_order_id.startsWith("cod_"))
         ? "Cash on Delivery"
         : "Razorpay Online Payment"}
         </p>

            <h4>Items:</h4>
            {o.cart && o.cart.length > 0 ? (
              o.cart.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 6 }}>
                  {item.name} — {item.packLabel} — Qty: {item.qty} — ₹{item.calculatedPrice}
                </div>
              ))
            ) : (
              <p>No items found</p>
            )}

            <h4>Customer:</h4>
            {o.customer ? (
              <div>
                {o.customer.name} <br />
                {o.customer.address} <br />
                {o.customer.pincode} <br />
                {o.customer.phone} <br />
                {o.customer.email} <br />
              </div>
            ) : (
              <p>No customer data found</p>
            )}

            {/* STATUS ACTION BUTTONS */}
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => updateStatus(o.razorpay_order_id || o.receipt, "packed")} className="admin-btn">
                Packed
              </button>
              <button onClick={() => updateStatus(o.razorpay_order_id || o.receipt, "paid")} className="admin-btn">
                Paid
              </button>
              <button onClick={() => updateStatus(o.razorpay_order_id || o.receipt, "dispatched")} className="admin-btn">
                Dispatched
              </button>
              <button onClick={() => updateStatus(o.razorpay_order_id || o.receipt, "out_for_delivery")} className="admin-btn">
                Out For Delivery
              </button>
              <button onClick={() => updateStatus(o.razorpay_order_id || o.receipt, "delivered")} className="admin-btn">
                Delivered
              </button>
              <button onClick={() => setETA(o.razorpay_order_id || o.receipt)} className="admin-btn">
                Set ETA
              </button>
              <button
                onClick={() => deleteOrder(o.razorpay_order_id || o.receipt)}
                style={{ background: "red", color: "white" }}
                className="admin-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
