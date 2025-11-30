// IMPORTANT: Ensure you have this script in public/index.html: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// Home_patched_full.jsx (secure Razorpay flow)
// Replace App export name if you prefer 'Home' — this file keeps the original export default App for drop-in replacement.

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import "../App.css";
import { Link } from "react-router-dom";

// Backend URL for Razorpay B2 endpoints (create-order / verify-payment)
const BACKEND_URL = "https://indiyummm-backend.onrender.com";

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviews, setReviews] = useState({}); // { productName: [reviews] }
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentSummaryOpen, setPaymentSummaryOpen] = useState(false);

  // DELIVERY state: null = unknown / pincode required; 0 = free; number = rupees
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(null);

  // UPI & payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderPaid, setOrderPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Recipient WhatsApp number for orders (international format, no +)
  const whatsappNumber = "919518501138";

  // ---------------- products ----------------
  const chutneys = [
    { name: "Coconut Chutney", price: 800, img: "/coconut-chutney.jpg", desc: "A traditional blend of coconut and spices, handcrafted for a rich, earthy taste.", tag: "bestseller" },
    { name: "Garlic Chutney", price: 700, img: "/garlic-chutney.jpg", desc: "Fiery and aromatic dry garlic chutney made with 100% natural ingredients.", tag: "new" },
    { name: "Shegdana Chutney", price: 700, img: "/shegdana-chutney.jpg", desc: "Nutty and flavorful, made from roasted peanuts and mild spices." },
    { name: "Javas Chutney", price: 700, img:"/javas-chutney.jpg", desc: "Wholesome flaxseed chutney, rich in omega-3 and traditional taste", tag: "bestseller"},
    { name: "Karala Chutney", price: 700, img:"/Karala-chutney.jpg", desc: "Bitter gourd (karala) blended with traditional spices for a unique and healthy taste" },
    { name: "Sesame Chutney", price: 700, img:"/sesame-chutney.jpg", desc: "Nutty sesame delight with a balanced mix of spices and health benefits.", tag: "new"},
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
    fetch(`${BACKEND_URL}/reviews`)
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

  // Build WhatsApp message for the order (root-level so openRazorpay can use it)
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
    localStorage.setItem("indiyummm_customer_phone", customerPhone);
    setPaymentSummaryOpen(true);
  };

 

  // When user confirms "Mark as Paid" we still send WA order so seller has details

  // WhatsApp order for single product
  const handlePlaceOrder = (product) => {
    if (!product) return;

    if (!customerName || !customerAddress || String(pincode).length !== 6) {
      setDetailsModalOpen(true);
      return;
    }

    setSelectedProduct(product);
    setOrderPlaced(true);
    localStorage.setItem("indiyummm_customer_phone", customerPhone);
    setPaymentSummaryOpen(true);
  };

  // copy UPI ID helper
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

    fetch(`${BACKEND_URL}/reviews`, {
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
// ===== CREATE ORDER FOR COD =====
// ===== CREATE ORDER FOR COD (supports cart OR quick-view selectedProduct) =====
const createCODOrder = async () => {
  try {
    const receipt = "cod_" + Date.now();

    // Save phone in browser for My Orders page
    if (customerPhone) {
      localStorage.setItem("indiyummm_customer_phone", String(customerPhone).trim());
    }

    // Build payload that supports both cart and selectedProduct (quick view)
    const payload = {
      amount: modalAmount,
      receipt,
      cart: cart || [],
      selectedProduct: selectedProduct || null,
      customer: {
        name: customerName,
        address: customerAddress,
        pincode: pincode,
        phone: customerPhone,
        email: localStorage.getItem("customer_email") || "" 
      },
      cod: true
    };

    const res = await fetch(`${BACKEND_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('COD order saved:', data);
if(data&&(data.order_id||data.receipt)){
 const oid=data.order_id||data.receipt; window.location.href=`/payment-success?orderId=${encodeURIComponent(oid)}&amount=${encodeURIComponent(modalAmount)}`; }
return data;
  } catch (err) {
    console.error("COD order create failed", err);
    alert("Failed to save COD order. Please try again.");
  }
};

  // ===== SECURE RAZORPAY FLOW =====
  // This function creates an order on the backend then opens Razorpay with that order_id.
  // After successful payment it calls /verify-payment and redirects to /payment-success on success.
  const openRazorpay = async ()=>{
  try{
    const receipt = `rcpt_${Date.now()}`;
    const payload={amount:modalAmount,receipt,cart,selectedProduct,customer:{name:customerName,address:customerAddress,pincode,phone:customerPhone,email:localStorage.getItem('customer_email')||''}};

// EMAIL CONFIRMATION FUNCTION
const sendEmailConfirmation = (orderData, method) => {
  try {
    const itemsText = (orderData.cart || [])
      .map(item => `${item.name} (${item.packLabel}) — ${item.qty} kg = ₹${item.calculatedPrice}`)
      .join("\n");

    const templateParams = {
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      customer_address: orderData.customer.address,
      order_id: orderData.order_id || orderData.receipt,
      payment_method: method.toUpperCase(),
      amount: orderData.amount,
      order_items: itemsText,
    };

    console.log("EMAILJS sending payload:", templateParams);

    emailjs.send(
      "service_rlnqibi",
      "template_litj5q6",
      templateParams,
      "NLQBCmpCL42kxAEFQ"
    )
    .then(() => console.log("Email sent"))
    .catch(err => console.error("Email error:", err));
  } catch (err) {
    console.error("EmailJS Error:", err);
  }
};


    const cr=await fetch(`${BACKEND_URL}/create-order`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const cd=await cr.json(); if(!cd||!cd.order_id){alert('Order create fail');return;}
    const opts={key:cd.key_id||cd.keyId||cd.key||'',amount:cd.amount,currency:cd.currency||'INR',name:'Indiyummm',description:'Order Payment',order_id:cd.order_id,handler:async (resp)=>{
      try{
        const vr=await fetch(`${BACKEND_URL}/verify-payment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({razorpay_order_id:resp.razorpay_order_id,razorpay_payment_id:resp.razorpay_payment_id,razorpay_signature:resp.razorpay_signature,receipt})});
        const v=await vr.json(); if(v&&v.verified){window.location.href=`/payment-success?orderId=${encodeURIComponent(resp.razorpay_order_id)}&amount=${encodeURIComponent(modalAmount)}`;} else alert('Verify failed');
      }catch(e){console.error(e);alert('Verify err');}
    },modal:{ondismiss:()=>{}}};
    if(window.Razorpay) new window.Razorpay(opts).open(); else alert('Razorpay missing');
  }catch(e){console.error(e);alert('RZP fail');}
};

      

      // duplicate/out-of-place Razorpay block removed (leftover from earlier edits)

/* ---------- Header (use login state from localStorage; keep mobile menu & cart) ---------- */
const isCustomerLogged = typeof window !== "undefined" && !!localStorage.getItem("customer_token");
const customerNameShort = typeof window !== "undefined" ? (localStorage.getItem("customer_name") || "") : "";

return (
  <div className="app">
    {/* Navbar - keep styling & scroll behaviour, but let App.jsx be authoritative for global links.
        This header will render shop anchors + cart + mobile menu button.
        Login/Signup/Logout respects localStorage so both Home.jsx and App.jsx show same state. */}
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <h1 className="logo">Indiyummm</h1>

      <nav className="desktop-nav">
        <a href="#home" onClick={(e) => handleSmoothScroll(e, "#home")}>Home</a>
        <a href="#chutneys" onClick={(e) => handleSmoothScroll(e, "#chutneys")}>Dry Chutneys</a>
        <a href="#pickles" onClick={(e) => handleSmoothScroll(e, "#pickles")}>Pickles</a>
        <Link to="/about">About</Link>

        {/* Show My Orders always (App.jsx also shows it) */}
        <Link to="/my-orders">My Orders</Link>

        {/* Show login / signup only when not logged in; otherwise show greeting + logout link */}
        {isCustomerLogged ? (
          <>
            <span style={{ color: "#4A7C59", marginLeft: 10 }}>{`Hi, ${customerNameShort || "Customer"}`}</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem("customer_token");
                localStorage.removeItem("customer_name");
                localStorage.removeItem("customer_email");
                // refresh to let App.jsx re-evaluate navbar
                window.location.reload();
              }}
              style={{ marginLeft: 10 }}
            >
              Logout
            </a>
          </>
        ) : (
          <>
            <Link to="/customer/login" style={{ marginLeft: 10 }}>Login</Link>
            <Link to="/customer/signup">Sign up</Link>
          </>
        )}
      </nav>

      <div className="nav-right">
        <div className="cart-icon" onClick={() => setCartOpen(true)} role="button" aria-label="Open cart">
          <ShoppingCart className="icon" />
          <span className="cart-count">{totalKg > 0 ? `${roundKg(totalKg)}kg` : null}</span>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <span className={mobileMenuOpen ? "line rotate1" : "line"}></span>
          <span className={mobileMenuOpen ? "line hide" : "line"}></span>
          <span className={mobileMenuOpen ? "line rotate2" : "line"}></span>
        </button>
      </div>
    </header>

    {/* Mobile nav (keeps same links but also respects login state) */}
    {mobileMenuOpen && (
      <div className="mobile-nav">
        <a href="#home" onClick={(e) => handleSmoothScroll(e, "#home")}>Home</a>
        <a href="#chutneys" onClick={(e) => handleSmoothScroll(e, "#chutneys")}>Dry Chutneys</a>
        <a href="#pickles" onClick={(e) => handleSmoothScroll(e, "#pickles")}>Pickles</a>
        <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
        <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>

        {isCustomerLogged ? (
          <>
            <div style={{ padding: "8px 0", fontWeight: 600, color: "#4A7C59" }}>Hi, {customerNameShort || "Customer"}</div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem("customer_token");
                localStorage.removeItem("customer_name");
                localStorage.removeItem("customer_email");
                setMobileMenuOpen(false);
                window.location.reload();
              }}
            >
              Logout
            </a>
          </>
        ) : (
          <>
            <Link to="/customer/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/customer/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
          </>
        )}
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

                <button className="btn-whatsapp" onClick={() => handlePlaceOrder(selectedProduct)}>Place Order</button>
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
        placeholder="Phone Number"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0,10))}
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
            localStorage.setItem("indiyummm_customer_phone", customerPhone);
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

  {/* PAYMENT DETAILS */}
  <div className="payment-details">
    <p><strong>Amount:</strong> ₹{modalAmount}</p>

    <button
      className="btn-pay-now"
      style={{ backgroundColor: "#0F9D58", color: "#fff" }}
      onClick={openRazorpay}
    >
      Pay Securely (Razorpay)
    </button>

    <button 
      className="btn-pay-now" 
      style={{ backgroundColor: "#444", color: "#fff" }}
      onClick={async () => {
        const data = await createCODOrder();
        if (data && data.order_id) {
          window.location.href = `/payment-success?orderId=${data.order_id}&amount=${modalAmount}&method=cod`;
        }
      }}
    >
      Cash on Delivery (COD)
    </button>

    <button className="btn-back" onClick={() => setPaymentModalOpen(false)}>
      Go Back
    </button>
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
