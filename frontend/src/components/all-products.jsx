import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight , Star} from "lucide-react";
import FilterComponent from "./FilterProduct.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.jsx";

const renderStars = (rating) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, onSelect }) => (
  <div
    className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
    onClick={() => onSelect(product._id)}
  >
    <div className="overflow-hidden">
      <img
        src={
          product.picture || defaultImage
        }
        alt={product.name}
        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      />
    </div>
    <div className="p-4 ">
      <h3 className="text-xl font-semibold mt-2">{product.name}</h3>
      <h3 className="text-sm mt-2 text-gray-700">{product.description}</h3>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-bold text-blue-600">
          ${product.price}
        </span>
        <div className="text-yellow-400 text-s">
                  {renderStars(product.rating)}
                </div>
      </div>
    </div>
  </div>
);

export function AllProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [price, setPrice] = useState("");
  const tripsPerPage = 6;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myProducts, setmyProducts] = useState(false);

  const navigate = useNavigate();

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    fetchProducts();
    setIsLoading(false);
  }, []);

  const handleProductSelect = (id) => {
    setIsLoading(true);
    navigate(`/product/${id}`); // Navigate to the product details page
    setIsLoading(false);
  };

  useEffect(() => {

    searchProducts();
  

}, [myProducts]);

  const searchProducts = async () => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/products`);

      // Add the search term and filter parameters
      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }
      if (myProducts) {
        url.searchParams.append("myproducts", myProducts);
      }
      if (price && price !== "") {
        url.searchParams.append("budget", price);
      }

      // Add sorting parameters
      if (sortBy) {
        url.searchParams.append("sort", sortBy);
      }
      if (sortOrder) {
        url.searchParams.append("asc", sortOrder);
      }
      const token = Cookies.get("jwt");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setProducts(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Error fetching filtered results");
      setProducts([]);
    }
  };

    const searchItineraries = async () => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/itineraries`);
   
      // Add the search term and filter parameters
      if(myItineraries){
        url.searchParams.append("myItineraries", myItineraries);
      }
      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }
      if (price && price !== "") {
        url.searchParams.append("budget", price);
      }

      if (dateRange.upper) {
        url.searchParams.append("upperDate", dateRange.upper);
      }
      if (dateRange.lower) {
        url.searchParams.append("lowerDate", dateRange.lower);
      }
      if (selectedTypes.length > 0) {
        url.searchParams.append("types", selectedTypes.join(",")); // Send selected types as comma-separated
      }
      if (selectedLanguages.length > 0) {
        url.searchParams.append("languages", selectedLanguages.join(",")); // Send selected languages as comma-separated
      }

      // Add sorting parameters
      if (sortBy) {
        url.searchParams.append("sort", sortBy);
      }
      if (sortOrder) {
        url.searchParams.append("asc", sortOrder);
      }
      const token = Cookies.get("jwt");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setItineraries(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Error fetching filtered results");
      setItineraries([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchProducts();
      } else {
        fetchProducts();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (sortBy) {
      searchProducts();
    }
  }, [sortBy, sortOrder]);

  const handleSort = (attribute) => {
    setIsLoading(true);
    const newSortOrder = sortOrder === 1 ? -1 : 1;
    setSortOrder(newSortOrder);
    setSortBy(attribute); 
    setIsLoading(false);
  };
  const handlemyProducts = (attribute) => {
    setIsLoading(true);
    setmyProducts(attribute); 
    setIsLoading(false);
  };
  const fetchProducts = async () => {
    try {
      setIsLoading(false);
      const token = Cookies.get('jwt');
      const role = getUserRole();
      const response = await fetch(
        `http://localhost:4000/${role}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error fetching products");
      setProducts([]);
    }
  };
  const clearFilters = () => {
    // Reset all filter states to initial values
    setSearchTerm("");
    setPrice("");
    setSortBy(""); // Reset sorting
    setSortOrder(""); // Reset sort order
    setmyProducts(false);

    // Fetch products without any filters
    fetchProducts();
  };

  const toggleFilters = () => {
    setIsLoading(false);
    setFiltersVisible(!filtersVisible);
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-100 pt-20 py-12 px-4 sm:px-6 lg:px-8 " >
          <div className="max-w-7xl mx-auto">
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                All Products
              </h1>

              <div className="flex flex-col mb-8">
                <div className="relative w-full mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                <FilterComponent
                  filtersVisible={filtersVisible}
                  toggleFilters={toggleFilters}
                  sortOrder={sortOrder}
                  sortBy={sortBy}
                  handleSort={handleSort}
                  clearFilters={clearFilters}
                  myProducts= {myProducts}
                  handlemyProducts= {handlemyProducts}
                  // sortProducts={sortProducts}
                  price={price}
                  setPrice={setPrice}
                  searchProducts={searchProducts}
                 
                  role={getUserRole()}
                />
              </div>

              {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .slice(
                    (currentPage - 1) * tripsPerPage,
                    currentPage * tripsPerPage
                  )
                  .map((product) => (
                    <ProductCard
                      key={product._id} // Use the unique _id as the key
                      product={product}
                      onSelect={handleProductSelect}
                    />
                  ))}
              </div>

              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === 1 ? "text-gray-300" : "text-blue-600"
                    }`}
                >
                  <ChevronLeft />
                </button>

              

                {/* Page X of Y */}
                <span className="text-lg font-medium">
                  Page {currentPage} of {Math.ceil(products.length / tripsPerPage)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(products.length / tripsPerPage))
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(products.length / tripsPerPage)
                  }
                  className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === Math.ceil(products.length / tripsPerPage)
                    ? "text-gray-300"
                    : "text-blue-600"
                    }`}
                >
                  <ChevronRight />
                </button>
              </div>

            </>
          </div>
        </div>
      )}
    </div>
  );
}
