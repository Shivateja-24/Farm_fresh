import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-15 py-7 bg-green-700 text-white shadow-md">
      <Link to="/" className="text-xl font-bold">
        Fresh Farms
      </Link>

      <div className="flex gap-6 ">
        <Link to="/" className="hover:underline">
          Products
        </Link>
        <Link to="/orders" className="hover:underline">
          Place Order
        </Link>
        <Link to="/track" className="hover:underline">
          Track Order
        </Link>
        <Link to="/admin" className="hover:underline">
          Admin
        </Link>
      </div>
    </nav>
  );
};
export default Navbar;
