import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import FilterComponent from "./FilterProduct.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  <Card
    className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
    onClick={() => onSelect(product._id)}
  >
    <CardHeader>
      <img
        src={product.pictures[0] || defaultImage}
        alt={product.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
    </CardHeader>
    <CardContent>
      <CardTitle>{product.name}</CardTitle>
      <CardDescription className="mt-2">
        {product.description.length > 150
          ? `${product.description.slice(0, 150)}...`
          : product.description}
      </CardDescription>{" "}
    </CardContent>
    <CardFooter className="flex justify-between items-center">
      <span className="text-lg font-bold text-blue-600">${product.price}</span>
      <div className="flex items-center">{renderStars(product.rating)}</div>
    </CardFooter>
  </Card>
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
  const [isLoading, setIsLoading] = useState(true);
  const [myProducts, setMyProducts] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);

  const navigate = useNavigate();

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
    setIsLoading(false);
  }, []);

  const handleProductSelect = (id) => {
    setIsLoading(true);
    navigate(`/product/${id}`);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    searchProducts();
    setIsLoading(false);
  }, [myProducts]);

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const searchProducts = async () => {
    try {
      setIsLoading(true);
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/products`);

      if (priceRange[0] !== 0 || priceRange[1] !== maxPrice) {
        url.searchParams.append("minPrice", priceRange[0].toString());
        url.searchParams.append("maxPrice", priceRange[1].toString());
      }


      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }
      if (myProducts) {
        url.searchParams.append("myproducts", myProducts);
      }
      if (price && price !== "") {
        url.searchParams.append("budget", price);
      }
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Error fetching filtered results");
      setProducts([]);
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
    setIsLoading(true);
    if (sortBy) {
      searchProducts();
    }
    setIsLoading(false);
  }, [sortBy, sortOrder]);

  const handleSort = (attribute) => {
    setIsLoading(true);
    const newSortOrder = sortOrder === 1 ? -1 : 1;
    setSortOrder(newSortOrder);
    setSortBy(attribute);
    setIsLoading(false);
  };

  const handleMyProducts = (attribute) => {
    setIsLoading(true);
    setMyProducts(attribute);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const response = await fetch(`http://localhost:4000/${role}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    setIsLoading(true);
    setSearchTerm("");
    setPrice("");
    setSortBy("");
    setSortOrder("");
    setMyProducts(false);
    fetchProducts();
    setIsLoading(false);
  };

  const toggleFilters = () => {
    setIsLoading(true);
    setFiltersVisible(!filtersVisible);
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-100 pt-20 py-12 px-4 sm:px-6 lg:px-8 ">
          <div className="max-w-7xl mx-auto">
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
                myProducts={myProducts}
                handlemyProducts={handleMyProducts}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
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
                    key={product._id}
                    product={product}
                    onSelect={handleProductSelect}
                  />
                ))}
            </div>

            <div className="mt-8 flex justify-center items-center space-x-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full bg-white shadow ${
                  currentPage === 1 ? "text-gray-300" : "text-blue-600"
                }`}
              >
                <ChevronLeft />
              </Button>

              <span className="text-lg font-medium">
                {products.length > 0
                  ? `Page ${currentPage} of ${Math.ceil(
                      products.length / tripsPerPage
                    )}`
                  : "No pages available"}
              </span>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(products.length / tripsPerPage) ||
                  products.length === 0
                }
                className={`px-4 py-2 rounded-full bg-white shadow ${
                  currentPage === Math.ceil(products.length / tripsPerPage)
                    ? "text-gray-300"
                    : "text-blue-600"
                }`}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}