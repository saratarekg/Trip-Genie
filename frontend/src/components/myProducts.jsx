"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Loader from "./Loader";
import defaultImage from "../assets/images/default-image.jpg";
import DualHandleSliderComponent from "./dual-handle-slider";
import LazyLoad from "react-lazyload";

const renderStars = (rating) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-[#F88C33] fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, onSelect, userInfo }) => {
  const [currencySymbol, setCurrencySymbol] = useState('');

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/${userInfo.role}/getCurrency/${product.currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrencySymbol(response.data.symbol);
    } catch (error) {
      console.error("Error fetching currency symbol:", error);
    }
  }, [userInfo, product]);

  useEffect(() => {
    getCurrencySymbol();
  }, [getCurrencySymbol]);


  const formatPrice = (price) => {
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="p-0" onClick={() => onSelect(product._id)}>
        <img
          src={product.pictures[0]?.url || defaultImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4" onClick={() => onSelect(product._id)}>
        <CardTitle className="text-lg text-[#1A3B47]">{product.name}</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {product.description.length > 100
            ? `${product.description.slice(0, 100)}...`
            : product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <span className="text-2xl font-bold text-[#388A94]">
          {formatPrice(product.price)}
        </span>
        {renderStars(product.rating)}
      </CardFooter>
    </Card>
  );
};

export function MyProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const productsPerPage = 6;

  const navigate = useNavigate();

  const getUserRole = useCallback(() => {
    let role = Cookies.get("role");
    return role || "guest";
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    const token = Cookies.get("jwt");

    if (role === "admin" || role === "seller") {
      try {
        const response = await axios.get(`http://localhost:4000/${role}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo({ ...response.data, role });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({ role });
      }
    } else {
      setUserInfo({ role });
    }
  }, []);

  const getSymbol = () => {
    return ""; // No need for a default symbol as we're using the product's currency
  };

  const fetchProducts = useCallback(
    async (params = {}) => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const url = new URL(`http://localhost:4000/${role}/products?myproducts=true`);

        if (params.searchBy) url.searchParams.append("searchBy", params.searchBy);
        if (params.asc) url.searchParams.append("asc", params.asc);
        if (params.minPrice) url.searchParams.append("minPrice", params.minPrice);
        if (params.maxPrice) url.searchParams.append("maxPrice", params.maxPrice);
        if (params.rating) url.searchParams.append("rating", params.rating);
        if (params.categories && params.categories.length > 0) {
          url.searchParams.append("categories", params.categories.join(","));
        }

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
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error fetching products");
        setProducts([]);
      }
    },
    [getUserRole]
  );

  useEffect(() => {
    if (userInfo) {
      fetchProducts();
    }
  }, [userInfo, fetchProducts]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        searchBy: searchTerm,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: selectedRating,
        asc: sortOrder,
        categories: selectedCategories,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    sortBy,
    sortOrder,
    priceRange,
    selectedRating,
    selectedCategories,
    fetchProducts,
  ]);

  const handleProductSelect = (id) => {
    navigate(`/product/${id}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSort = (attribute) => {
    setSortOrder((prevOrder) => (prevOrder === 1 ? -1 : 1));
    setSortBy(attribute);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("");
    setSortOrder(1);
    setPriceRange([0, maxPrice]);
    setSelectedRating(null);
    setSelectedCategories([]);
    fetchProducts();
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-[#E6DCCF]">
      {/* Navbar */}
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="container mx-auto px-24 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#1A3B47] mb-8">My Products</h1>
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1A3B47]">Filters</h2>
              <Button
                onClick={clearFilters}
                size="sm"
                className="text-gray-400 hover:text-gray-200 bg-transparent border-none"
              >
                Clear All
              </Button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium text-[#1A3B47] mb-2">Price Range</h3>
              <DualHandleSliderComponent
                min={0}
                max={maxPrice}
                symbol={getSymbol()}
                step={Math.max(1, Math.ceil(maxPrice / 100))}
                values={priceRange}
                middleColor="#5D9297"
                colorRing="#388A94"
                onChange={(values) => setPriceRange(values)}
              />
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-[#1A3B47] mb-2">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={`flex items-center w-full p-2 rounded hover:bg-gray-100 ${
                      selectedRating === rating ? "bg-[#B5D3D1]" : ""
                    }`}
                  >
                    {renderStars(rating)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort by Rating */}
            <div className="mb-6">
              <h3 className="font-medium text-[#1A3B47] mb-2">
                Sort by Rating
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                style={{ borderRadius: "20px" }}
                onClick={() => handleSort("rating")}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Rating</span>
                <div className="ml-auto">
                  {sortBy === "rating" ? (sortOrder === 1 ? "↓" : "↑") : ""}
                </div>
              </Button>
            </div>

            <div className="mb-6">
              <Link
                to="/create-product"
                className="flex items-center justify-between w-full px-4 py-2 rounded-md bg-orange-400 text-white"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create Product
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="relative" style={{ width: "900px" }}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D9297]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <span className="text-gray-500 text-sm">
                  ({products.length} items)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full md:hidden"
                  onClick={toggleFilters}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            {alertMessage && (
              <Alert
                className={`mb-4 ${
                  alertMessage.type === "success"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <AlertTitle>
                  {alertMessage.type === "success" ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription>{alertMessage.message}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .slice(
                      (currentPage - 1) * productsPerPage,
                      currentPage * productsPerPage
                    )
                    .map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        userInfo={userInfo}
                        onSelect={handleProductSelect}
                      />
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center items-center space-x-4">
                  <button
                    onClick={() => {
                      handlePageChange(currentPage - 1);
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full bg-white shadow ${
                      currentPage === 1 ? "text-gray-300" : "text-blue-600"
                    }`}
                  >
                    <ChevronLeft />
                  </button>

                  {/* Page X of Y */}
                  <span className="text-lg font-medium">
                    {products.length > 0
                      ? `Page ${currentPage} of ${Math.ceil(
                          products.length / productsPerPage
                        )}`
                      : "No pages available"}
                  </span>

                  <button
                    onClick={() => {
                      handlePageChange(currentPage + 1);
                    }}
                    disabled={
                      currentPage === Math.ceil(products.length / productsPerPage) ||
                      products.length === 0
                    }
                    className={`px-4 py-2 rounded-full bg-white shadow ${
                      currentPage === Math.ceil(products.length / productsPerPage)
                        ? "text-gray-300"
                        : "text-blue-600"
                    }`}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}