const ProductCard = (props) => {
  const { product } = props;
  return (
    <div className="w-60 flex items-center border rounded-lg p-3 shadow-sm">
      <div>
        <h3 className="font-medium text-sm">{product.name}</h3>
        <p className="text-green-600 font-semibold">₹{product.price}/kg</p>
      </div>
      <img
        src={product.image_url}
        alt={product.name}
        className="h-28 w-full object-cover rounded mb-2"
      />
    </div>
  );
};

export default ProductCard;
