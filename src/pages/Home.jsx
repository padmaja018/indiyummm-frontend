// App.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import "../App.css";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviews, setReviews] = useState({}); // { productName: [reviews] }
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentSummaryOpen, setPaymentSummaryOpen] = useState(false);


  // DELIVERY state: null = unknown / pincode required; 0 = free; number = rupees
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(null);

  // UPI & payment modal
  const UPI_ID = "aghogare1@okaxis";
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderPaid, setOrderPaid] = useState(false);

  // Recipient WhatsApp number for orders (international format, no +)
  const whatsappNumber = "919518501138";

  // ---------------- products ----------------
  const chutneys = [
    { name: "Coconut Chutney", price: 680, img: "/coconut-chutney.jpg", desc: "A traditional blend of coconut and spices, handcrafted for a rich, earthy taste.", tag: "bestseller" },
    { name: "Garlic Chutney", price: 650, img: "/garlic-chutney.jpg", desc: "Fiery and aromatic dry garlic chutney made with 100% natural ingredients.", tag: "new" },
    { name: "Shegdana Chutney", price: 660, img: "/shegdana-chutney.jpg", desc: "Nutty and flavorful, made from roasted peanuts and mild spices." },
    { name: "Javas Chutney", price: 660, img:"/javas-chutney.jpg", desc: "Wholesome flaxseed chutney, rich in omega-3 and traditional taste", tag: "bestseller"},
    { name: "Karala Chutney", price: 660, img:"/Karala-chutney.jpg", desc: "Bitter gourd (karala) blended with traditional spices for a unique and healthy taste" },
    { name: "Sesame Chutney", price: 660, img:"/sesame-chutney.jpg", desc: "Nutty sesame delight with a balanced mix of spices and health benefits.", tag: "new"},
  ];

  const pickles = [
    { name: "Chilli Pickle", price: 350, img: "/chilli-pickle.jpg", desc: "Spicy and tangy green chilli pickle — perfect for those who love heat!", tag: "bestseller" },
    { name: "Lemon Pickle", price: 350, img: "/lemon-pickle.jpg", desc: "Classic lemon pickle, bursting with citrus flavor and homemade goodness.", tag: "new" },
  ];

  // ---------------- reviews form state ----------------
  const initialFormState = {};
  [...chutneys, ...pickles].forEach(p => {
    initialFormState[p.name] = { name: "", rating: 5, text: "" };
  });
  const [reviewForm, setReviewForm] = useState(initialFormState);

  // Load reviews from backend (if available)
  useEffect(() => {
    fetch("https://indiyummm-backend.onrender.com/reviews")
      .then(res => res.json())
      .then(data => setReviews(data || {}))
      .catch(err => console.error("Error loading reviews:", err));
  }, []);

  // Navbar scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- helpers ----------------
  const roundKg = (n) => Math.round(n * 100) / 100; // 2 decimals for kg
  const calcPriceForKg = (pricePerKg, kg) => Math.round(pricePerKg * kg);
  const formatRupee = (v) => `₹${Math.round(v)}`;

  // ----- Cart functions (qty in KG) -----
  const addToCart = (product, packKg, packLabel) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name && item.packLabel === packLabel);
      const calculatedPrice = calcPriceForKg(product.price, packKg);
      if (existing) {
        return prev.map(item =>
          item.name === product.name && item.packLabel === packLabel
            ? { ...item, qty: roundKg(item.qty + packKg), calculatedPrice: calcPriceForKg(product.price, roundKg(item.qty + packKg)) }
            : item
        );
      }
      return [...prev, {
        name: product.name,
        img: product.img,
        pricePerKg: product.price,
        qty: roundKg(packKg),
        packLabel,
        calculatedPrice,
      }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (product) => setCart(cart.filter(item => !(item.name === product.name && item.packLabel === product.packLabel)));

  const updateQty = (product, qtyKg) => {
    if (qtyKg <= 0.0001) {
      removeFromCart(product);
    } else {
      setCart(cart.map(item =>
        item.name === product.name && item.packLabel === product.packLabel
          ? { ...item, qty: roundKg(qtyKg), calculatedPrice: calcPriceForKg(item.pricePerKg, roundKg(qtyKg)) }
          : item
      ));
    }
  };

  // totals (safe math if deliveryCharge null)
  const subtotal = cart.reduce((sum, item) => sum + (item.calculatedPrice ?? (item.qty * item.pricePerKg)), 0);
  const safeDelivery = (typeof deliveryCharge === "number") ? deliveryCharge : 0;
  const totalPrice = subtotal + (cart.length > 0 ? safeDelivery : 0);

  // Determine modal amount for payment: if ordering from cart use totalPrice, else if ordering single product use selectedProduct price + delivery
  const modalAmount = (cart.length > 0)
    ? totalPrice
    : (selectedProduct
        ? (calcPriceForKg(selectedProduct.price, selectedProduct.packKg) + (typeof deliveryCharge === "number" ? deliveryCharge : 0))
        : 0
      );

  const totalKg = cart.reduce((sum, item) => sum + item.qty, 0);

  // ---------------- Pincode / Delivery logic ----------------
  // Rule:
  // - 411xxx => FREE (Pune)
  // - 40,41,42,43,44 => Maharashtra => ₹39
  // - others => ₹59
  // - missing / invalid / missing name/address => deliveryCharge = null (force user to fill)
  const checkDelivery = (pin, nameVal = customerName, addrVal = customerAddress) => {
    const s = String(pin || "").trim();
    if (!nameVal || !addrVal) {
      setDeliveryCharge(null);
      return;
    }
    if (s.length !== 6) {
      setDeliveryCharge(null);
      return;
    }
    const first3 = s.substring(0, 3);
    const first2 = s.substring(0, 2);

    if (first3 === "411") {
      setDeliveryCharge(0); // FREE Pune
      return;
    }

    const mhStarts = ["40", "41", "42", "43", "44"];
    const isMaharashtra = mhStarts.includes(first2);

    setDeliveryCharge(isMaharashtra ? 70 : 160);
  };

  // Old simpler message kept for floating whatsapp link
  const getCartMessage = () => {
    if (cart.length === 0) return "Hello Indiyummm 👋, I’d like to know more about your products!";
    let message = "Hello Indiyummm 👋, I would like to order:\n";
    cart.forEach(item => {
      message += `- ${item.name} (${item.packLabel}) x ${item.qty} = ${formatRupee(item.calculatedPrice)}\n`;
    });
    if (deliveryCharge === null) {
      message += `\nDelivery: Pincode / details not entered\nTotal: ${formatRupee(subtotal)} (Delivery pending)\n`;
    } else {
      message += `\nTotal: ${formatRupee(modalAmount)}`;
    }
    return message;
  };

  // ===== WhatsApp auto-fill: full cart order =====
  const handleWhatsAppOrder = () => {
  if (cart.length === 0) {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Indiyummm 👋, I would like to know about your products.")}`, "_blank");
    return;
  }

  // If missing details → OPEN POPUP instead of alert()
  if (!customerName || !customerAddress || String(pincode).length !== 6) {
    setDetailsModalOpen(true);
    return;
  }

  // If details are complete → open payment modal
  setOrderPlaced(true);
  setPaymentSummaryOpen(true);
};

  // When user confirms "Mark as Paid" we still send WA order so seller has details
  const confirmPaidAndSendWA = (paid = true) => {
    setOrderPaid(paid);
    // Build WA message including customer details
    let message = "🛍️ *Indiyummm Order Details*\n\n";
    let runningSubtotal = 0;
    cart.forEach((item, idx) => {
      message += `${idx + 1}) *${item.name}* — ${item.packLabel}\n`;
      message += `Qty: ${item.qty} kg\n`;
      message += `Price: ${formatRupee(item.calculatedPrice)}\n\n`;
      runningSubtotal += item.calculatedPrice;
    });

    message += "--------------------\n";
    message += `Subtotal: ${formatRupee(runningSubtotal)}\n`;
    message += `Delivery Charges: ${formatRupee(deliveryCharge)}\n`;
    message += `*Total Payable: ${formatRupee(runningSubtotal + deliveryCharge)}*\n`;
    message += "--------------------\n\n";
    message += `Name: ${customerName}\n`;
    message += `Address: ${customerAddress}\n`;
    message += `Pincode: ${pincode}\n\n`;
    message += `Payment: ${paid ? "Paid via UPI" : "Not paid (COD)"}\n\n`;
    message += "📞 Contact: +91 9404955707\n";
    message += "📧 Email: indiyumm23@gmail.com\n";

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");

    // close payment modal after sending WA
    setPaymentModalOpen(false);
    // Optionally clear cart or leave it for reference; here we'll clear cart
    setCart([]);
    setOrderPlaced(false);
  };

  // WhatsApp order for single product
  const handleWhatsAppOrderSingle = (product) => {
    if (!product) return;

    if (!customerName || !customerAddress || String(pincode).length !== 6) {
      setDetailsModalOpen(true);
      return;
    }

    setSelectedProduct(product);
    setOrderPlaced(true);
    setPaymentSummaryOpen(true);
  };

  // copy UPI ID helper
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("UPI ID copied to clipboard");
    } catch (e) {
      alert("Copy failed — please copy manually: " + text);
    }
  };

  const handleSmoothScroll = (e, id) => {
    e && e.preventDefault();
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // Submit review
  const submitReview = (productName) => {
    const form = reviewForm[productName];
    if (!form || !form.name || !form.text) return;

    const newReview = {
      productName,
      name: form.name,
      rating: form.rating,
      text: form.text
    };

    fetch("https://indiyummm-backend.onrender.com/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview)
    })
    .then(res => res.json())
    .then(saved => {
      setReviews(prev => {
        const updated = { ...prev };
        if (!updated[productName]) updated[productName] = [];
        updated[productName].push(saved);
        return updated;
      });
      setReviewForm(prev => ({ ...prev, [productName]: { name: "", rating: 5, text: "" } }));
    })
    .catch(err => console.error("Error submitting review:", err));
  };

  // re-run delivery whenever name / address / pincode changes
  useEffect(() => {
    checkDelivery(pincode, customerName, customerAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode, customerName, customerAddress]);

  return (
    <div className="app">
      {/* Navbar */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h1 className="logo">Indiyummm</h1>
        <nav className="desktop-nav">
          <a href="#home" onClick={(e)=>handleSmoothScroll(e,'#home')}>Home</a>
          <a href="#chutneys" onClick={(e)=>handleSmoothScroll(e,'#chutneys')}>Dry Chutneys</a>
          <a href="#pickles" onClick={(e)=>handleSmoothScroll(e,'#pickles')}>Pickles</a>
          <a href="#about" onClick={(e)=>handleSmoothScroll(e,'#about')}>About</a>
        </nav>

        <div className="nav-right">
          <div className="cart-icon" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="icon" />
            <span className="cart-count">{totalKg > 0 ? `${roundKg(totalKg)}kg` : null}</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className={mobileMenuOpen ? "line rotate1" : "line"}></span>
            <span className={mobileMenuOpen ? "line hide" : "line"}></span>
            <span className={mobileMenuOpen ? "line rotate2" : "line"}></span>
          </button>
        </div>
      </header>

{mobileMenuOpen && (
  <div className="mobile-nav">
    <a href="#home" onClick={(e)=>handleSmoothScroll(e,'#home')}>Home</a>
    <a href="#chutneys" onClick={(e)=>handleSmoothScroll(e,'#chutneys')}>Dry Chutneys</a>
    <a href="#pickles" onClick={(e)=>handleSmoothScroll(e,'#pickles')}>Pickles</a>
    <a href="#about" onClick={(e)=>handleSmoothScroll(e,'#about')}>About</a>
  </div>
)}


      {/* Hero Section */}
      <section id="home" className="hero">
        <motion.div className="hero-bg" initial={{ scale: 1 }} animate={{ scale: 1.08 }} transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}></motion.div>
        <div className="hero-overlay"></div>
        <motion.div className="hero-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>Taste the <span>Tradition</span></motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
            Discover 100% organic dry chutneys and pickles made with love, natural ingredients, and zero preservatives.
          </motion.p>
          <motion.button className="hero-btn" onClick={(e) => handleSmoothScroll(e, "#chutneys")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Shop Now</motion.button>
        </motion.div>
      </section>

      {/* Product Sections */}
      <ProductSection
        id="chutneys"
        title="Our Signature Dry Chutneys"
        products={chutneys}
        onOrder={(product, packKg, packLabel) => setSelectedProduct({ ...product, packKg, packLabel })}
        addToCart={(product, packKg, packLabel) => addToCart(product, packKg, packLabel)}
        color="#4A7C59"
        reviews={reviews}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        submitReview={submitReview}
      />
      <ProductSection
        id="pickles"
        title="Our Authentic Pickles"
        products={pickles}
        onOrder={(product, packKg, packLabel) => setSelectedProduct({ ...product, packKg, packLabel })}
        addToCart={(product, packKg, packLabel) => addToCart(product, packKg, packLabel)}
        color="#FF7F50"
        reviews={reviews}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        submitReview={submitReview}
      />

      {/* Product Modal & Cart Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}><X /></button>
              <img src={selectedProduct.img} alt={selectedProduct.name} className="modal-img" />
              <h3>{selectedProduct.name}</h3>
              <p>{selectedProduct.desc}</p>
              <p><strong>Selected pack:</strong> {selectedProduct.packLabel} ({selectedProduct.packKg} kg)</p>
              <p><strong>Price:</strong> {formatRupee(calcPriceForKg(selectedProduct.price, selectedProduct.packKg))}</p>

              <div className="modal-buttons">
                <button className="btn-add" onClick={() => { addToCart(selectedProduct, selectedProduct.packKg, selectedProduct.packLabel); setSelectedProduct(null); }}>Add to Cart</button>

                <button className="btn-whatsapp" onClick={() => handleWhatsAppOrderSingle(selectedProduct)}>Place Order</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {cartOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button className="modal-close" onClick={() => setCartOpen(false)}><X /></button>
              <h3>Your Cart</h3>

              {cart.length === 0 ? <p>Your cart is empty.</p> : (
                <div className="cart-items">
                  {cart.map((item, idx) => (
                    <div key={`${item.name}-${item.packLabel}-${idx}`} className="cart-item">
                      <img src={item.img} alt={item.name} />
                      <div className="cart-info">
                        <h4>{item.name} <span style={{ fontSize: "0.85rem", color: "#666" }}>({item.packLabel})</span></h4>
                        <p>{formatRupee(item.pricePerKg)} per kg</p>
                        <p><strong>{item.qty} kg</strong> = {formatRupee(item.calculatedPrice)}</p>
                        <div className="cart-controls">
                          <button onClick={() => updateQty(item, roundKg(item.qty - 0.1))}>-</button>
                          <span>{item.qty} kg</span>
                          <button onClick={() => updateQty(item, roundKg(item.qty + 0.1))}>+</button>
                          <button onClick={() => removeFromCart(item)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))} 
                  <h4>Subtotal: {formatRupee(subtotal)}</h4>
                  <p>Delivery: {deliveryCharge === null ? "—" : formatRupee(deliveryCharge)}</p>
                  <h4>Total: {deliveryCharge === null ? `${formatRupee(subtotal)} (delivery pending)` : formatRupee(modalAmount)}</h4>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn-whatsapp w-full" onClick={handleWhatsAppOrder}>Place Order</button>
                    <button className="btn-add" onClick={() => { setCart([]); setCartOpen(false); }}>Clear</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Customer Details Modal */}
<AnimatePresence>
  {detailsModalOpen && (
    <motion.div className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="modal"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button className="modal-close" onClick={() => setDetailsModalOpen(false)}>
          <X />
        </button>

        <h3>Enter Your Details</h3>

        <input
          type="text"
          placeholder="Your Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Full Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
        />
        <input
          type="text"
          maxLength={6}
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(val);
          }}
        />

        <button
          className="btn-whatsapp"
          style={{ marginTop: 10 }}
          onClick={() => {
            if (!customerName || !customerAddress || pincode.length !== 6) {
              alert("Please enter valid details.");
              return;
            }
            setDetailsModalOpen(false);
            setOrderPlaced(true);
            setPaymentSummaryOpen(true);
          }}
        >
          Continue to Payment
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      
      {/* Payment Summary Modal */}
      <AnimatePresence>
        {paymentSummaryOpen && (
          <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal" initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} style={{maxHeight:"80vh",overflowY:"auto"}}>
              <button className="modal-close" onClick={()=>setPaymentSummaryOpen(false)}><X/></button>
              <h3>Order Summary</h3>
              
<div>
  {cart.length > 0 ? (
    cart.map((item, idx) => (
      <div key={idx} style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}>
        <p><strong>{item.name}</strong> ({item.packLabel})</p>
        <p>{item.qty} kg — ₹{item.calculatedPrice}</p>
      </div>
    ))
  ) : (
    selectedProduct && (
      <div style={{ borderBottom: "1px solid #ddd", padding: "8px 0" }}>
        <p><strong>{selectedProduct.name}</strong> ({selectedProduct.packLabel})</p>
        <p>{selectedProduct.packKg} kg — ₹{calcPriceForKg(selectedProduct.price, selectedProduct.packKg)}</p>
      </div>
    )
  )}
</div>

<div style={{ marginTop: 10 }}>
  <p>
    Subtotal: ₹
    {cart.length > 0
      ? subtotal
      : selectedProduct
      ? calcPriceForKg(selectedProduct.price, selectedProduct.packKg)
      : 0}
  </p>

  <p>Delivery: ₹{deliveryCharge}</p>

  <h4>
    Total: ₹
    {cart.length > 0
      ? totalPrice
      : selectedProduct
      ? calcPriceForKg(selectedProduct.price, selectedProduct.packKg) + (deliveryCharge || 0)
      : 0}
  </h4>
</div>

              <div style={{marginTop:10}}>
                <p><strong>Name:</strong> {customerName}</p>
                <p><strong>Address:</strong> {customerAddress}</p>
                <p><strong>Pincode:</strong> {pincode}</p>
              </div>
              <button className="btn-whatsapp" onClick={()=>{setPaymentSummaryOpen(false); setPaymentModalOpen(true);}} style={{marginTop:15}}>
                Continue to Payment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Payment Modal (UPI) - opens after Place Order */}
      <AnimatePresence>
        {paymentModalOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="payment-modal" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <button className="modal-close" onClick={() => setPaymentModalOpen(false)}><X /></button>
              <h3>Complete Payment</h3>

              
<div className="payment-body">

  {/* QR SCAN & PAY */}
  <div className="qr-block" style={{ textAlign: "center" }}>
    <p style={{ marginBottom: 6, fontWeight: "bold" }}>Or Scan & Pay using UPI</p>

    <img 
      src={`https://api.qrserver.com/v1/create-qr-code/?size=230x230&data=upi://pay?pa=${UPI_ID}&pn=Indiyummm&am=${modalAmount}&cu=INR`} 
      alt="Dynamic QR" 
      style={{ width: 230, height: 230, borderRadius: 10 }}
    />
  </div>

  {/* PAYMENT DETAILS */}
  <div className="payment-details">
    <p><strong>UPI ID:</strong> {UPI_ID} 
      <button className="copy-btn" onClick={() => copyToClipboard(UPI_ID)}>Copy</button>
    </p>

    <p><strong>Amount:</strong> ₹{modalAmount}</p>

    {/* RAZORPAY BUTTON */}
    <button
      className="btn-pay-now"
      style={{ backgroundColor: "#0F9D58", color: "#fff" }}
      onClick={() => {
        const amt = modalAmount * 100;
        const opt = {
          key: "rzp_live_RjEUaiYidPpkZD",
          amount: amt,
          currency: "INR",
          name: "Indiyummm",
          description: "Order Payment",
          handler: (resp) =>
            confirmPaidAndSendWA(true, resp.razorpay_payment_id || "")
        };
        new window.Razorpay(opt).open();
      }}
    >
      Pay Securely (Razorpay)
    </button>

    {/* COD */}
    <button 
      className="btn-pay-now" 
      style={{ backgroundColor: "#444", color: "#fff" }}
      onClick={() => confirmPaidAndSendWA(false)}
    >
      Cash on Delivery (COD)
    </button>

    {/* MARK AS PAID */}
    <button
      className="btn-mark-paid"
      style={{ backgroundColor: "#0A66C2", color: "#fff" }}
      onClick={() => confirmPaidAndSendWA(true)}
    >
      Mark as Paid
    </button>

    {/* GO BACK */}
    <button className="btn-back" onClick={() => setPaymentModalOpen(false)}>
      Go Back
    </button>

    <p className="small-muted" style={{ marginTop: 12 }}>
      After payment, tap <strong>Mark as Paid</strong> so we get your order immediately.
    </p>
  </div>

</div>


                <div className="payment-details">
                  <p><strong>UPI ID:</strong> {UPI_ID} <button className="copy-btn" onClick={() => copyToClipboard(UPI_ID)}>Copy</button></p>
                  <p><strong>Amount:</strong> {formatRupee(modalAmount)}</p>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      className="btn-pay-now"
                      onClick={() => {
    const amount = (typeof modalAmount === "number") ? modalAmount : 0;

const gpayLink = `intent://pay?pa=${UPI_ID}&pn=Indiyummm&am=${amount}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`;

window.location.href = gpayLink;

}}
                    >
                      Pay Now
                    </button>

                    <button className="btn-mark-paid" onClick={() => confirmPaidAndSendWA(true)}>
                      Mark as Paid
                    </button>

                    <button className="btn-back" onClick={() => setPaymentModalOpen(false)}>Go Back</button>
                  </div>

                  <p className="small-muted" style={{ marginTop: 12 }}>
                    After payment, tap <strong>Mark as Paid</strong> so we get your order immediately.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(getCartMessage())}`} target="_blank" rel="noopener noreferrer" className="floating-whatsapp">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </a>

      {/* About Section */}
      <section id="about" className="about">
        <h3>About Indiyummm</h3>
        <p>Indiyummm brings you the authentic flavors of India — freshly made chutneys, masalas, and pickles crafted from 100% organic, natural ingredients. We believe in purity, tradition, and taste that connects you to home.</p>
        <div className="contact-info">
          <p><strong>📞 Contact:</strong> +91 9404955707</p>
          <p><strong>📧 Email:</strong> indiyumm23@gmail.com</p>
          <p><strong>📸 Follow us:</strong> <a href="https://instagram.com/indiyummm" target="_blank" rel="noreferrer">@indiyummm</a></p>
        </div>
      </section>
    </div>
  );
}

// ----------------- ProductSection Component -----------------
function ProductSection({ id, title, products, onOrder, addToCart, color, reviews, reviewForm, setReviewForm, submitReview }) {
  // store selected pack per product: '100g' | '200g' | '500g' | '1kg'
  const [selectedPack, setSelectedPack] = useState(() => {
    const init = {};
    products.forEach(p => init[p.name] = "1kg");
    return init;
  });

  const packOptions = [
    { label: "100g", kg: 0.1 },
    { label: "200g", kg: 0.2 },
    { label: "500g", kg: 0.5 },
    { label: "1kg", kg: 1 }
  ];

  const getKgFor = (label) => (packOptions.find(o => o.label === label) || packOptions[3]).kg;

  const priceFor = (pricePerKg, kg) => Math.round(pricePerKg * kg);

  return (
    <section id={id} className="products">
      <h3 style={{ color }}>{title}</h3>

      {/* Glowing animated "coming soon" banner */}
      <div className="coming-soon-glow">
        ✨ More products coming soon! ✨
      </div>

      <div className="products-grid">
        {products.map((product, i) => {
          const form = reviewForm[product.name];
          const packLabel = selectedPack[product.name] || "1kg";
          const packKg = getKgFor(packLabel);
          const displayedPrice = priceFor(product.price, packKg);

          return (
            <motion.div key={i} className="product-card" whileHover={{ scale: 1.05 }}>
              {/* NEW LAUNCH glowy badge */}
              {product.tag === "new" && (
                <span className="glow-badge badge-new">✨ New Launch</span>
              )}

              <img src={product.img} alt={product.name} />
              <h4 style={{ color }}>{product.name}</h4>
              <p className="kg-label">(Available in packs)</p>

              <div className="pack-select">
                <label>Choose pack:</label>
                <select
                  value={packLabel}
                  onChange={(e) => setSelectedPack(prev => ({ ...prev, [product.name]: e.target.value }))} 
                >
                  {packOptions.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                </select>
                <div className="price-display">Price: <strong>{displayedPrice} / {packLabel}</strong></div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  style={{ backgroundColor: color, color: "#FFF8E7" }}
                  onClick={() => addToCart(product, packKg, packLabel)}
                >
                  Add to Cart
                </button>

                <button
                  style={{ backgroundColor: "#25D366", color: "white" }}
                  onClick={() => onOrder(product, packKg, packLabel)}
                >
                  Quick View
                </button>
              </div>

              {/* Reviews */}
              <div className="reviews">
                <h5>Reviews:</h5>
                {(reviews[product.name] || []).map((r, idx) => (
                  <p key={idx}><strong>{r.name}</strong> ({r.rating}/5): {r.text}</p>
                ))}

                {/* Review Form */}
                <form className="review-form" onSubmit={(e) => { e.preventDefault(); submitReview(product.name); }}>
                  <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setReviewForm(prev => ({ ...prev, [product.name]: { ...form, name: e.target.value } }))} required />
                  <select value={form.rating} onChange={(e) => setReviewForm(prev => ({ ...prev, [product.name]: { ...form, rating: parseInt(e.target.value) } }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <textarea placeholder="Your Review" value={form.text} onChange={(e) => setReviewForm(prev => ({ ...prev, [product.name]: { ...form, text: e.target.value } }))} required />
                  <button type="submit">Submit Review</button>
                </form>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
