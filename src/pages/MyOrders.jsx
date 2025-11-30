import React, { useEffect, useState } from "react";

export default function MyOrders() {
  const BACKEND = "http://localhost:5000";

  const [phone, setPhone] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const savedEmail = localStorage.getItem("customer_email");
  if (!savedEmail) {
    setPhone(null); // or setEmail null
    setLoading(false);
    return;
  }
  setPhone(savedEmail); // reuse phone state to display
  fetch(`${BACKEND}/my-orders/email/${encodeURIComponent(savedEmail)}`)
    .then(res => res.json())
    .then(data => setOrders(data || []))
    .finally(() => setLoading(false));
}, []);


  if (loading)
    return (
      <p style={{ padding: 25, fontSize: 20, textAlign: "center" }}>
        Loading your orders…
      </p>
    );

  if (!phone)
    return (
      <div style={{ padding: 20 }}>
        <h2 style={styles.heading}>My Orders</h2>
        <p>No phone number found. Please place an order first.</p>
      </div>
    );

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Orders</h2>

      <div style={styles.phoneBox}>
        <strong>Your Phone:</strong> {phone}
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.razorpay_order_id || order.receipt} style={styles.card}>
            <h3 style={styles.orderId}>
              Order ID: {order.razorpay_order_id || order.receipt}
            </h3>

            <div style={styles.row}>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Amount:</strong> ₹{order.amount}</p>
            </div>

            <p>
              <strong>Placed on:</strong>
              {" "}{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
            </p>

            <p>
              <strong>Estimated Delivery:</strong>{" "}
              {order.eta ? new Date(order.eta).toLocaleDateString() : "Not set"}
            </p>

            {/* Tracking Timeline */}
            <div style={styles.timelineBox}>
              {["created", "paid", "packed", "dispatched", "out_for_delivery", "delivered"].map(
                (step, index) => (
                  <div key={index} style={styles.timelineStep}>
                    <div
                      style={{
                        ...styles.timelineDot,
                        backgroundColor:
                          step === order.status || index <= getStepIndex(order.status)
                            ? "#4A7C59"
                            : "#ccc",
                      }}
                    ></div>
                    <p
                      style={{
                        ...styles.timelineLabel,
                        color:
                          step === order.status || index <= getStepIndex(order.status)
                            ? "#4A7C59"
                            : "#aaa",
                      }}
                    >
                      {formatStep(step)}
                    </p>
                  </div>
                )
              )}
            </div>

            <h4 style={styles.itemsTitle}>Items:</h4>

            {order.cart && order.cart.length > 0 ? (
              <ul style={styles.itemsList}>
                {order.cart.map((item, i) => (
                  <li key={i} style={styles.itemCard}>
                    <div>
                      <strong>{item.name}</strong> — {item.packLabel}
                    </div>
                    <div style={{ fontSize: 14 }}>
                      Qty: {item.qty} kg <br />
                      Price: ₹{item.calculatedPrice}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#555" }}>No items found</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Helper Functions
function formatStep(step) {
  const map = {
    created: "Order Placed",
    paid: "Paid",
    packed: "Packed",
    dispatched: "Dispatched",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };
  return map[step] || step;
}

function getStepIndex(status) {
  const steps = ["created", "paid", "packed", "dispatched", "out_for_delivery", "delivered"];
  return steps.indexOf(status);
}

// Styles
const styles = {
  page: {
    padding: "20px",
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },

  heading: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 28,
    color: "#3b5c3b",
  },

  phoneBox: {
    background: "#fff8e0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: "5px solid #4A7C59",
  },

  card: {
    background: "#fff9ec",
    padding: 20,
    borderRadius: 14,
    marginBottom: 25,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },

  orderId: {
    marginBottom: 10,
    fontSize: 20,
    color: "#4A7C59",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
  },

  itemsTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
  },

  itemsList: {
    listStyle: "none",
    padding: 0,
  },

  itemCard: {
    background: "#ffffff",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 8,
    borderLeft: "4px solid #4A7C59",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  timelineBox: {
    display: "flex",
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
    overflowX: "auto",
  },

  timelineStep: {
    textAlign: "center",
  },

  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    margin: "0 auto",
  },

  timelineLabel: {
    fontSize: 12,
    marginTop: 5,
  },
};
