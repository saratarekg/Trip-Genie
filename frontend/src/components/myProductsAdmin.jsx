"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import Loader from "./Loader";
import defaultImage from "../assets/images/default-image.jpg";
import productImage from "../assets/images/prod.png";
import DualHandleSliderComponent from "./dual-handle-slider";
import ProductDetail from "@/components/ProductDetailAdmin";

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
  const [currencySymbol, setCurrencySymbol] = useState("");

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `https://trip-genie-apis.vercel.app/${userInfo.role}/getCurrency/${product.currency}`,
        {
          credentials: "include",
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
    <Card className="relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl  cursor-pointer">
      <CardHeader className="p-0" onClick={() => onSelect(product._id)}>
        <img
          src={product.pictures[0]?.url || defaultImage}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4" onClick={() => onSelect(product._id)}>
        <CardTitle className="text-lg text-[#1A3B47]">{product.name}</CardTitle>
        <div className="mt-1">{renderStars(product.rating)}</div>
        <p className="text-sm text-gray-600 mt-2 break-words">
          {product.description.length > 40
            ? `${product.description.slice(0, 40)}...`
            : product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <span className="text-2xl font-bold text-[#388A94]">
          {formatPrice(product.price)}
        </span>
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
  const [maxPriceOfProducts, setMaxPriceOfProducts] = useState(1000);
  const [priceRange, setPriceRange] = useState([0, maxPriceOfProducts]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isPriceInitialized, setIsPriceInitialized] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null); // Add state for selected historical place

  const productsPerPage = 6;

  const navigate = useNavigate();

  const getUserRole = useCallback(() => {
    let role = Cookies.get("role");
    return role || "guest";
  }, []);

  const handleProductSelectbyid = (id) => {
    setSelectedProductId(id);
  };

  const handleBackToAll = () => {
    setSelectedProductId(null);
    fetchProducts();
  };

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    const token = Cookies.get("jwt");

    if (role === "admin" || role === "seller") {
      try {
        const response = await axios.get(
          `https://trip-genie-apis.vercel.app/${role}/`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserInfo({ ...response.data, role });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({ role });
      }
    } else {
      setUserInfo({ role });
    }
  }, []);

  useEffect(() => {
    if (!isPriceInitialized) {
      fetchMaxPrice();
    }
  }, [userInfo]);

  const fetchMaxPrice = async () => {
    const role = getUserRole();
    const token = Cookies.get("jwt");
    const url = new URL(
      `https://trip-genie-apis.vercel.app/${role}/max-price-products-my`
    );
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setMaxPriceOfProducts(data);
    setPriceRange([0, data]);
    setIsPriceInitialized(true);
  };

  const fetchProducts = useCallback(
    async (params = {}) => {
      try {
        setIsLoading(true);
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const url = new URL(
          `https://trip-genie-apis.vercel.app/${role}/products?myproducts=true`
        );

        if (params.searchBy)
          url.searchParams.append("searchBy", params.searchBy);
        if (params.sort) url.searchParams.append("sort", params.sort);
        if (params.asc !== undefined)
          url.searchParams.append("asc", params.asc);
        if (params.minPrice)
          url.searchParams.append("minPrice", params.minPrice);
        if (params.maxPrice)
          url.searchParams.append("maxPrice", params.maxPrice);
        if (params.rating) url.searchParams.append("rating", params.rating);
        if (params.categories && params.categories.length > 0) {
          url.searchParams.append("categories", params.categories.join(","));
        }

        const response = await fetch(url, {
          credentials: "include",
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
      } finally {
        setIsLoading(false);
      }
    },
    [getUserRole, maxPriceOfProducts]
  );

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      fetchProducts();
    }
  }, [userInfo, fetchProducts]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        searchBy: searchTerm,
        sort: sortBy,
        asc: sortOrder,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: selectedRating,
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
    setPriceRange([0, maxPriceOfProducts]);
    setSelectedRating(null);
    setSelectedCategories([]);
    fetchProducts();
  };

  return (
    <div className="bg-gray-100">
      {selectedProductId ? (
        <div>
          <Button
            onClick={handleBackToAll}
            className="mb-4 bg-[#5D9297] text-white text-base"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to My Products
          </Button>
          <ProductDetail id={selectedProductId} />
        </div>
      ) : (
        <div className="">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden md:block w-80 h-100 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1A3B47]">
                  Filters
                </h2>
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
                {isPriceInitialized && (
                  <DualHandleSliderComponent
                    min={0}
                    max={maxPriceOfProducts === 0 ? 1000 : maxPriceOfProducts}
                    symbol="$"
                    step={Math.max(1, Math.ceil(maxPriceOfProducts / 100))}
                    values={priceRange}
                    exchangeRate="1"
                    middleColor="#5D9297"
                    colorRing="#388A94"
                    onChange={(values) => setPriceRange(values)}
                  />
                )}
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
              {/* Featured Products Section */}
              <div className="mb-6">
                <h3 className="font-medium text-[#1A3B47] mb-4">
                  Featured Products
                </h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {products.length > 0 &&
                      products.slice(0, 3).map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <img
                            src={product.pictures[0]?.url || defaultImage}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <h4 className="font-medium text-sm">
                              {product.name}
                            </h4>
                            <div className="mt-1">
                              {renderStars(product.rating)}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search my products..."
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D9297]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  </div>
                  <span className="text-gray-500 text-sm whitespace-nowrap">
                    ({products.length} items)
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap rounded-full"
                      onClick={() => handleSort("rating")}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort by Rating
                      {sortBy === "rating" && (
                        <span className="ml-2">
                          {sortOrder === 1 ? "↓" : "↑"}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap rounded-full"
                      onClick={() => handleSort("price")}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort by Price
                      {sortBy === "price" && (
                        <span className="ml-2">
                          {sortOrder === 1 ? "↓" : "↑"}
                        </span>
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={() => {}} // TODO: Implement mobile filters
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
              )}

              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length > 0 &&
                      products
                        .slice(
                          (currentPage - 1) * productsPerPage,
                          currentPage * productsPerPage
                        )
                        .map((product) => (
                          <ProductCard
                            key={product._id}
                            product={product}
                            userInfo={userInfo}
                            onSelect={handleProductSelectbyid}
                          />
                        ))}
                  </div>

                  <div className="mt-8 flex justify-center items-center space-x-4">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="icon"
                      className="text-[#1A3B47] border-[#1A3B47]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-[#1A3B47]">
                      Page {currentPage} of{" "}
                      {Math.max(
                        1,
                        Math.ceil(products.length / productsPerPage)
                      )}
                    </span>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                          Math.max(
                            1,
                            Math.ceil(products.length / productsPerPage)
                          ) || products.length === 0
                      }
                      variant="outline"
                      size="icon"
                      className="text-[#1A3B47] border-[#1A3B47]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
