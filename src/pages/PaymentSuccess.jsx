import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId");
  const amount = query.get("amount");
  const message = query.get("waMessage");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWA = () => {
    if (!message) {
      alert("WhatsApp message missing.");
      return;
    }
    window.open(
      `https://wa.me/919518501138?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="success-wrapper">
      <Confetti numberOfPieces={300} recycle={false} />

      <div className="success-card">
        <div className="success-icon">✔</div>

        <h1>Payment Successful 🎉</h1>

        <p className="success-amount">
          Your payment of <strong>₹{amount}</strong> has been received.
        </p>

        <p className="success-orderId">
          <strong>Order ID:</strong> {orderId}
        </p>

        <button className="wa-button" onClick={handleWA}>
          Send Order on WhatsApp
        </button>

        <button className="continue-btn" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
