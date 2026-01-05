import { useEffect, useState } from "react";

const API = import.meta.env.VITE_APP_API_URL;

export default function Orders() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    buyerName: "",
    address: "",
  });
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!form.productId || !form.quantity || !form.buyerName || !form.address) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          quantity: Number(form.quantity),
          buyerName: form.buyerName,
          address: form.address,
        }),
      });

      const data = await res.json();
      setOrderId(data.orderId);
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <form
        onSubmit={submitOrder}
        className="w-full max-w-md border rounded-lg shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold mb-1">Place Bulk Order</h2>
        <p className="text-gray-500 mb-4">
          Fill in the details below to place your order
        </p>

        {/* Product Dropdown */}
        <label className="block mb-2 font-medium">Product Name</label>
        <select
          name="productId"
          value={form.productId}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select a product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ₹{p.price}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label className="block mb-2 font-medium">Quantity (kg / units)</label>
        <input
          type="number"
          name="quantity"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Buyer Name */}
        <label className="block mb-2 font-medium">Buyer Name</label>
        <input
          type="text"
          name="buyerName"
          value={form.buyerName}
          onChange={handleChange}
          required
          placeholder="Enter your name"
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Address */}
        <label className="block mb-2 font-medium">Delivery Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          placeholder="Enter complete delivery address"
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Error */}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Place Order
        </button>

        {/* Success */}
        {orderId && (
          <p className="mt-4 text-green-700 font-medium">
            Order placed successfully!
            <br />
            <span className="font-semibold">Order ID:</span> {orderId}
          </p>
        )}
      </form>
    </div>
  );
}
