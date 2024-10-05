import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import defaultImage from "../assets/images/default-image.jpg";
import Loader from "./Loader.jsx";

export function ProductViewer() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = Cookies.get("jwt");
        let role = Cookies.get("role") || "guest";
        const response = await axios.get(
          `http://localhost:4000/${role}/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.data.slice(0, 4);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleViewAllProducts = () => {
    setIsLoading(true);
    navigate(`/all-products`); 
    setIsLoading(false);
  };

  const handleProductClick = (id) => {
    setIsLoading(true);
    navigate(`/product/${id}`); 
    setIsLoading(false);
  };

  const renderStars = (rating) => {
    return Array(5).fill().map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
      {isLoading && <Loader />}
      <div className="w-full md:w-1/3 pr-8 mb-8 md:mb-0">
        <h2 className="text-3xl font-bold">Products</h2>
        <hr className="border-red-500 w-1/2 mb-3 mt-1 border-t-2" />
        <p className="text-gray-600 mb-8">
        Explore our exclusive collection of treasures and locally-inspired keepsakes. Whether for yourself or a loved one, each item tells a story and celebrates the culture of our vibrant destination. Bring home a piece of your adventure today!
        </p>
        <div className="flex justify-center">
  <div className="relative">
    <div className="absolute left-0 top-0 w-8 h-8 bg-gray-800 -translate-x-1/2 -translate-y-1/2 rounded z-0"></div>
    <div className="absolute right-0 bottom-0 w-8 h-8 bg-gray-300 translate-x-1/2 translate-y-1/2 rounded z-0"></div>
    <button 
      onClick={handleViewAllProducts}
      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium transition duration-300 z-20 relative" // Set z-index higher and make button relative
    >
      View all products
    </button>
  </div>
</div>




      </div>
      <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4">
  {products.map((product) => (
    <div 
      key={product.id} 
      className="relative overflow-hidden rounded-lg cursor-pointer group h-92" 
      onClick={() => handleProductClick(product.id)}
    >
      <img
        src={product.picture || defaultImage}
        alt={product.name}
        className="w-full h-68 object-cover transition duration-300 transform group-hover:-translate-y-8"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 transform translate-y-full transition duration-300 group-hover:translate-y-0">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase">{'BUY ONLINE'}</span>
                <span className="text-lg font-bold">€{product.price}</span>
              </div>
              <h2 className="text-l mb-2">{product.name}</h2>
              <div className="flex justify-between items-center">
                <div className="text-yellow-400 text-s">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">{product.rating} stars</span>
              </div>
            </div>
    </div>
  ))}
</div>

    </div>
  );
}