import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const API = import.meta.env.VITE_APP_API_URL;

const Products = () => {
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API}/products`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-8 h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">Farm Fresh Products</h1>
      <p className="text-gray-700 mb-6">
        Discover range of fresh vegetable and fruits for bulk orders
      </p>

      <div className="flex flex-wrap justify-center mx-40 gap-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to Order?</h3>
        <p className="text-gray-600 mb-4">
          Place bulk orders for fresh vegetables and fruits
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
export default Products;
