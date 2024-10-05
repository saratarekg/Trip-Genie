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
        <h1 className="text-4xl font-bold mb-4">Products</h1>
        <div className="w-16 h-1 bg-orange-500 mb-6"></div>
        <p className="text-gray-600 mb-8">
        Explore our exclusive collection of treasures and locally-inspired keepsakes. Whether for yourself or a loved one, each item tells a story and celebrates the culture of our vibrant destination. Bring home a piece of your adventure today!
        </p>
        <div className="flex justify-center">
  <div className="relative">
    <div className="absolute left-0 top-0 w-8 h-8 bg-gray-800 -translate-x-1/2 -translate-y-1/2 rounded"></div>
    <div className="absolute right-0 bottom-0 w-8 h-8 bg-gray-300 translate-x-1/2 translate-y-1/2 rounded"></div>
    <button 
      onClick={handleViewAllProducts}
      className="relative bg-coral text-white px-8 py-3 rounded text-lg font-semibold bg-orange-500 transition duration-300 z-10" // Set z-index for the button
    >
      <span className="relative z-10">View all products</span>
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
              <h2 className="text-xl font-serif mb-2">{product.name}</h2>
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