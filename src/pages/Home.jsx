
// Home_updated.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import "../App.css";
import { Link } from "react-router-dom";

// Backend URL for Razorpay create-order / verify endpoints. Replace if your backend URL differs:
const BACKEND_URL = "https://indiyummm-backend.onrender.com";


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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [returnModalOpen, setReturnModalOpen] = useState(false); // NEW: shows when user returns from UPI app

  // Recipient WhatsApp number for orders (international format, no +)
  const whatsappNumber = "919518501138";

  // ---------------- products ----------------
  const chutneys = [
    { name: "Coconut Chutney", price: 690, img: "/coconut-chutney.jpg", desc: "A traditional blend of coconut and spices, handcrafted for a rich, earthy taste.", tag: "bestseller" },
    { name: "Garlic Chutney", price: 680, img: "/garlic-chutney.jpg", desc: "Fiery and aromatic dry garlic chutney made with 100% natural ingredients.", tag: "new" },
    { name: "Shegdana Chutney", price: 680, img: "/shegdana-chutney.jpg", desc: "Nutty and flavorful, made from roasted peanuts and mild spices." },
    { name: "Javas Chutney", price: 680, img:"/javas-chutney.jpg", desc: "Wholesome flaxseed chutney, rich in omega-3 and traditional taste", tag: "bestseller"},
    { name: "Karala Chutney", price: 680, img:"/Karala-chutney.jpg", desc: "Bitter gourd (karala) blended with traditional spices for a unique and healthy taste" },
    { name: "Sesame Chutney", price: 20, img:"/sesame-chutney.jpg", desc: "Nutty sesame delight with a balanced mix of spices and health benefits.", tag: "new"},
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

  const clearSavedData = () => {
    try {
      localStorage.removeItem("savedCart");
      localStorage.removeItem("savedCustomerName");
      localStorage.removeItem("savedAddress");
      localStorage.removeItem("savedPincode");
      localStorage.removeItem("savedDeliveryCharge");
      localStorage.removeItem("savedSelectedProduct");
      localStorage.removeItem("waitingForUPIPayment");
      localStorage.removeItem("savedOrderPlaced");
      localStorage.removeItem("savedPaymentSummaryOpen");
    } catch (e) {
      console.warn("clearSavedData error", e);
    }
  };

  const saveAllToStorage = (extra = {}) => {
    try {
      localStorage.setItem("savedCart", JSON.stringify(cart));
      localStorage.setItem("savedCustomerName", customerName);
      localStorage.setItem("savedAddress", customerAddress);
      localStorage.setItem("savedPincode", pincode);
      localStorage.setItem("savedDeliveryCharge", deliveryCharge === null ? "" : String(deliveryCharge));
      localStorage.setItem("savedSelectedProduct", selectedProduct ? JSON.stringify(selectedProduct) : "");
      localStorage.setItem("savedOrderPlaced", orderPlaced ? "1" : "");
      localStorage.setItem("savedPaymentSummaryOpen", paymentSummaryOpen ? "1" : "");
      // If caller wants to mark we are heading to UPI/External
      if (extra.waiting) localStorage.setItem("waitingForUPIPayment", "yes");
    } catch (e) {
      console.warn("saveAllToStorage error", e);
    }
  };

  // When user confirms "Mark as Paid" we still send WA order so seller has details
  const confirmPaidAndSendWA = (method = "upi", razorpayId = "") => {
    // method: "razorpay" | "cod" | "upi"
    let runningSubtotal = 0;
    let message = "🛍️ *Indiyummm Order Details*\n\n";

    if (cart && cart.length > 0) {
      cart.forEach((item, idx) => {
        message += `${idx + 1}) *${item.name}* — ${item.packLabel}\n`;
        message += `Qty: ${item.qty} kg\n`;
        message += `Price: ₹${item.calculatedPrice}\n\n`;
        runningSubtotal += item.calculatedPrice;
      });
    } else if (selectedProduct) {
      const priceSingle = calcPriceForKg(selectedProduct.price, selectedProduct.packKg);
      message += `*${selectedProduct.name}* — ${selectedProduct.packLabel}\n`;
      message += `Qty: ${selectedProduct.packKg} kg\n`;
      message += `Price: ₹${priceSingle}\n\n`;
      runningSubtotal = priceSingle;
    }

    const delivery = (typeof deliveryCharge === "number") ? deliveryCharge : 0;
    const totalPayable = runningSubtotal + delivery;

    message += "--------------------\n";
    message += `Subtotal: ₹${runningSubtotal}\n`;
    message += `Delivery Charges: ₹${delivery}\n`;
    message += `*Total Payable: ₹${totalPayable}*\n`;
    message += "--------------------\n\n";

    message += `Name: ${customerName}\n`;
    message += `Address: ${customerAddress}\n`;
    message += `Pincode: ${pincode}\n\n`;

    if (method === "razorpay") {
      message += "Payment: Paid via Razorpay\n\n";
      if (razorpayId) message += `Razorpay ID: ${razorpayId}\n\n`;
    } else if (method === "cod") {
      message += "Payment: Cash on Delivery Requested\n\n";
    } else {
      message += "Payment: Paid via UPI Scan\n\n";
    }

    message += "📞 Contact: +91 9404955707\n";
    message += "📧 Email: indiyumm23@gmail.com\n";

    try {
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappURL, "_blank");
    } catch (e) {
      console.error("Failed to open WhatsApp:", e);
      alert("Unable to open WhatsApp. Please copy the message and send manually.");
    }

    // Close modal and clear cart after opening WhatsApp
    setPaymentModalOpen(false);
    setCart([]);
    setOrderPlaced(false);

    // clear saved data in storage, as order has been sent
    clearSavedData();
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

  // ---------- PERSISTENCE: restore saved data on load ----------
  useEffect(() => {
    try {
      const sc = localStorage.getItem("savedCart");
      if (sc) setCart(JSON.parse(sc));

      const n = localStorage.getItem("savedCustomerName");
      if (n) setCustomerName(n);

      const a = localStorage.getItem("savedAddress");
      if (a) setCustomerAddress(a);

      const p = localStorage.getItem("savedPincode");
      if (p) setPincode(p);

      const d = localStorage.getItem("savedDeliveryCharge");
      if (d !== null && d !== "") setDeliveryCharge(Number(d));

      const sp = localStorage.getItem("savedSelectedProduct");
      if (sp) {
        try { setSelectedProduct(JSON.parse(sp)); } catch (e) { setSelectedProduct(null); }
      }

      const waiting = localStorage.getItem("waitingForUPIPayment");
      if (waiting === "yes") {
        // show modal asking user to confirm payment
        setReturnModalOpen(true);
      }
    } catch (e) {
      console.warn("Restore failed:", e);
    }
  }, []);

  // ---------- PERSISTENCE: keep storage updated whenever relevant state changes ----------
  useEffect(() => {
    try {
      localStorage.setItem("savedCart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem("savedCustomerName", customerName); } catch(e) {}
  }, [customerName]);

  useEffect(() => {
    try { localStorage.setItem("savedAddress", customerAddress); } catch(e) {}
  }, [customerAddress]);

  useEffect(() => {
    try { localStorage.setItem("savedPincode", pincode); } catch(e) {}
  }, [pincode]);

  useEffect(() => {
    try { localStorage.setItem("savedDeliveryCharge", deliveryCharge === null ? "" : String(deliveryCharge)); } catch(e) {}
  }, [deliveryCharge]);

  useEffect(() => {
    try { localStorage.setItem("savedSelectedProduct", selectedProduct ? JSON.stringify(selectedProduct) : ""); } catch(e) {}
  }, [selectedProduct]);

  useEffect(() => {
    try { localStorage.setItem("savedOrderPlaced", orderPlaced ? "1" : ""); } catch(e) {}
  }, [orderPlaced]);

  useEffect(() => {
    try { localStorage.setItem("savedPaymentSummaryOpen", paymentSummaryOpen ? "1" : ""); } catch(e) {}
  }, [paymentSummaryOpen]);

  // Call this right before opening an external UPI app or navigating away for payment
  const beginExternalPayment = (markWaiting = true, targetUrl = null) => {
    // Save everything and mark waiting
    saveAllToStorage({ waiting: markWaiting });
    if (markWaiting) localStorage.setItem("waitingForUPIPayment", "yes");

    // Optionally open the supplied URL (UPI intent)
    if (targetUrl) {
      // open in new tab to keep current tab stable if possible
      window.open(targetUrl, "_blank");
    }
  };

  // ---------- UPI intent helper ----------
  const openUpiIntent = () => {
    // Build UPI URI (some apps accept this)
    const upiUri = `upi://pay?pa=${UPI_ID}&pn=Indiyummm&am=${modalAmount}&cu=INR`;
    beginExternalPayment(true, upiUri);
  };

  // ---------- Razorpay: save state then open Razorpay ----------
  
  const openRazorpay = async () => {
    // Secure B2 flow: create order on backend, open Razorpay with returned order_id/key,
    // then verify payment on backend before sending WhatsApp.
    try {
      // save state
      beginExternalPayment(false);
      const receipt = "indiyummm_" + Date.now();
      const payload = {
        amount: modalAmount, // rupees
        receipt,
        cart,
        customer: { name: customerName, address: customerAddress, pincode }
      };

      const createRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const createData = await createRes.json();
      if (!createData || !createData.order_id) {
        alert("Unable to create order on server. Please try again.");
        console.error("create-order failed", createData);
        return;
      }

      const options = {
        key: createData.key_id || createData.keyId || createData.key, // backend provides key_id
        amount: createData.amount, // in paise
        currency: createData.currency || "INR",
        name: "Indiyummm",
        description: "Order Payment",
        order_id: createData.order_id,
        handler: async function (resp) {
          // resp contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                receipt: receipt
              })
            });
            const v = await verifyRes.json();
            if (v && v.verified) {
              try { localStorage.removeItem("waitingForUPIPayment"); } catch(e){}
              // payment verified on backend — send WA and clear cart
              confirmPaidAndSendWA("razorpay", resp.razorpay_payment_id);
            } else {
              alert("Payment could not be verified on server. Please contact support.");
              console.error("verification failed", v);
            }
          } catch (err) {
            console.error("verify-payment error", err);
            alert("Server verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            // user closed checkout without finishing
            console.log("Razorpay modal dismissed");
          }
        }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error("openRazorpay error:", err);
      alert("Failed to start payment. Please try again.");
    }
  };

    new window.Razorpay(opt).open();
  };

  // When user clicks "Send order" after returning from UPI app
  const handleReturnConfirmed = () => {
    // remove waiting flag to avoid showing again
    try { localStorage.removeItem("waitingForUPIPayment"); } catch(e){}
    setReturnModalOpen(false);
    // send WA (message will indicate UPI paid)
    confirmPaidAndSendWA("upi");
  };

  const handleReturnNotPaid = () => {
    try { localStorage.removeItem("waitingForUPIPayment"); } catch(e){}
    setReturnModalOpen(false);
    // leave saved data intact so user can retry payment
    alert("No problem — your cart and details are saved. You can try payment again.");
  };

  // When user confirms "Mark as Paid" we still send WA order so seller has details


  const handleWhatsAppOrderClickBeforeExternal = () => {
    // When user is about to go to external payment flow (e.g., they hit Continue to Payment),
    // we mark waitingForUPIPayment and save state, so if they return we can restore.
    saveAllToStorage();
    // We will not set waitingForUPIPayment here until they actually use external UPI,
    // but when opening the external UPI intent we set it.
  };

  const handleSmoothOpenPayment = () => {
    // Called when user presses "Continue to Payment" from summary modal
    saveAllToStorage();
    setPaymentSummaryOpen(false);
    setPaymentModalOpen(true);
  };

  const handleSmoothScrollClick = (e, id) => {
    handleSmoothScroll(e, id);
  };

  // copy UPI ID helper unchanged above

  // ---------------- UI & render ----------------

  return (
    <div className="app">
      {/* Navbar */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h1 className="logo">Indiyummm</h1>
        <nav className="desktop-nav">
          <a href="#home" onClick={(e)=>handleSmoothScroll(e,'#home')}>Home</a>
          <a href="#chutneys" onClick={(e)=>handleSmoothScroll(e,'#chutneys')}>Dry Chutneys</a>
          <a href="#pickles" onClick={(e)=>handleSmoothScroll(e,'#pickles')}>Pickles</a>
          <Link to="/about">About</Link>
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
    <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
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
                const val = e.target.value.replace(/\\D/g, "").slice(0, 6);
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
              <button className="btn-whatsapp" onClick={()=>{handleSmoothOpenPayment();}} style={{marginTop:15}}>
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
      onClick={() => { openRazorpay(); }}
    >
      Pay Securely (Razorpay)
    </button>

    {/* COD */}
  <button 
  className="btn-pay-now" 
  style={{ backgroundColor: "#444", color: "#fff" }}
  onClick={() => { confirmPaidAndSendWA("cod"); }}
>
  Cash on Delivery (COD)
</button>

    {/* MARK AS PAID */}
    <button
      className="btn-mark-paid"
      style={{ backgroundColor: "#0A66C2", color: "#fff" }}
      onClick={() => {
        // User manually confirms they paid (useful for QR/UPI)
        try { localStorage.removeItem("waitingForUPIPayment"); } catch(e){}
        confirmPaidAndSendWA("upi");
      }}
    >
      I HAVE PAID — SEND MY ORDER TO WHATSAPP
    </button>

    {/* GO BACK */}
    <button className="btn-back" onClick={() => setPaymentModalOpen(false)}>
      Go Back
    </button>

    <p className="small-muted" style={{ marginTop: 12 }}>
      After payment, tap <strong>I HAVE PAID — SEND MY ORDER TO WHATSAPP</strong> so we get your order immediately.
    </p>
  </div>

                  <p className="small-muted" style={{ marginTop: 12 }}>
                    After payment, tap <strong>I HAVE PAID — SEND MY ORDER TO WHATSAPP</strong> so we get your order immediately.
                  </p>
                </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return-from-UPI Modal (Option 2 style) */}
      <AnimatePresence>
        {returnModalOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button className="modal-close" onClick={() => { setReturnModalOpen(false); try{ localStorage.removeItem("waitingForUPIPayment"); }catch(e){} }}><X/></button>
              <h3>Welcome Back!</h3>
              <p>If you completed the payment in your UPI app, tap below to send your order to WhatsApp. Your cart and details were restored.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn-whatsapp" onClick={() => handleReturnConfirmed()}>SEND ORDER TO WHATSAPP</button>
                <button className="btn-add" onClick={() => handleReturnNotPaid()}>I haven't paid yet</button>
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

    </div>
  );


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
