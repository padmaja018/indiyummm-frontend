import { useEffect, useState } from "react";

export default function Reviews({ selectedProduct }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ userName: "", rating: 0, comment: "" });

  // Fetch reviews for selected product
  useEffect(() => {
    if (!selectedProduct) return;
    fetch("https://indiyummm-backend.onrender.com/api/products/reviews")
      .then(res => res.json())
      .then(data => setReviews(data[selectedProduct.name] || []))
      .catch(console.error);
  }, [selectedProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const payload = {
      productName: selectedProduct.name,
      ...form
    };

    const res = await fetch("https://indiyummm-backend.onrender.com/api/products/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const saved = await res.json();
    setReviews(prev => [...prev, saved]);
    setForm({ userName: "", rating: 0, comment: "" });
  };

  if (!selectedProduct) return <p>Select a product first.</p>;

  return (
    <div>
      <h2>Reviews for {selectedProduct.name}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Your Name"
          value={form.userName}
          onChange={e => setForm({ ...form, userName: e.target.value })}
          required
        />
        <select
          value={form.rating}
          onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
          required
        >
          <option value="">Rating</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea
          placeholder="Comment"
          value={form.comment}
          onChange={e => setForm({ ...form, comment: e.target.value })}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <div>
        {reviews.length === 0 ? <p>No reviews yet</p> :
          reviews.map(r => (
            <div key={r.id}>
              <p>{r.userName} ({r.rating}⭐): {r.comment}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}
