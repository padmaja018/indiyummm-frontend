import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import "./PaymentSuccess.css";


export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId") || "N/A";
  const amount = query.get("amount") || "N/A";
  const method = query.get("method") || "paid"; // default to paid

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="success-wrapper">
      <Confetti numberOfPieces={150} recycle={false} />

      <div className="success-card">
        <div className="success-icon">✔</div>

        {method === "cod" ? (
          <>
            <h1>Order Placed Successfully 🎉</h1>
            <p className="success-amount">
              Your COD order has been placed.  
              You will pay <strong>₹{amount}</strong> on delivery.
            </p>
          </>
        ) : (
          <>
            <h1>Payment Successful 🎉</h1>
            <p className="success-amount">
              Your payment of <strong>₹{amount}</strong> has been received.
            </p>
          </>
        )}

        <p className="success-orderId"><strong>Order ID:</strong> {orderId}</p>

        <button className="continue-btn" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
