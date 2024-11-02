import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import FilterComponent from "./FilterProduct";
import defaultImage from "../assets/images/default-image.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "./Loader";

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



const ProductCard = ({ product, onSelect, userInfo, exchangeRates, currencySymbols }) =>{
  const [isLoading, setIsLoading] = useState(false);
  
  const formatPrice = (price) => {
  if (!product || !userInfo) return '';

  if (userInfo.role === 'tourist' && userInfo.preferredCurrency) {
    if (userInfo.preferredCurrency._id === product.currency) {
      return `${userInfo.preferredCurrency.symbol}${price}`;
    } else {
      const exchangeRate = exchangeRates[`${product.currency}-${userInfo.preferredCurrency._id}`];
      console.log("userInfo.preferredCurrency:", exchangeRates);
      if (exchangeRate) {
        const exchangedPrice = price * exchangeRate;
        return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
      }
    }
  }
  
  // return `${currencySymbols[product.currency] || ''}${price}`;
};

  return (
    <div >
      {isLoading ? (
        <Loader />
      ) : (
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
      </CardDescription>
    </CardContent>
    <CardFooter className="flex justify-between items-center">
      <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
      <div className="flex items-center">{renderStars(product.rating)}</div>
    </CardFooter>
  </Card>
      )}
      </div>
);
}

export function AllProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [myProducts, setMyProducts] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const tripsPerPage = 6;

  const navigate = useNavigate();

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    const token = Cookies.get("jwt");

    if (role === 'tourist') {
      try {
        const response = await axios.get('http://localhost:4000/tourist/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currencyId = response.data.preferredCurrency;

        const currencyResponse = await axios.get(`http://localhost:4000/tourist/getCurrency/${currencyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserInfo({
          role,
          preferredCurrency: currencyResponse.data
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({ role });
      }
    } else {
      setUserInfo({ role });
    }
  }, []);

  const fetchExchangeRates = useCallback(async (productCurrencies) => {
    if (!userInfo || userInfo.role !== 'tourist' || !userInfo.preferredCurrency) return;

    const token = Cookies.get("jwt");
    const uniqueCurrencies = [...new Set(productCurrencies)];
    const rates = {};

    for (const currency of uniqueCurrencies) {
      if (currency !== userInfo.preferredCurrency._id) {
        try {
          const response = await fetch(
            `http://localhost:4000/tourist/populate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                base: currency,
                target: userInfo.preferredCurrency._id,
              }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            rates[`${currency}-${userInfo.preferredCurrency._id}`] = data.conversion_rate;
          }
        } catch (error) {
          console.error("Error fetching exchange rate:", error);
        }
      }
    }

    setExchangeRates(rates);
  }, [userInfo]);

  const fetchCurrencySymbols = useCallback(async (productCurrencies) => {
    const token = Cookies.get("jwt");
    const uniqueCurrencies = [...new Set(productCurrencies)];
    const symbols = {};

    for (const currency of uniqueCurrencies) {
      try {
        const response = await axios.get(`http://localhost:4000/${userRole}/getCurrency/${currency}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        symbols[currency] = response.data.symbol;
      } catch (error) {
        console.error("Error fetching currency symbol:", error);
      }
    }

    setCurrencySymbols(symbols);
  }, [userInfo]);

  const getUserRole = useCallback(() => {
    let role = Cookies.get("role");
    return role || "guest";
  }, []);

  const fetchProducts = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/products`);
      
      if (params.searchBy) {
        url.searchParams.append("searchBy", params.searchBy);
      }

      if (params.sort) {
        url.searchParams.append("sort", params.sort);
        url.searchParams.append("asc", params.asc);
      }

      if (params.myproducts) {
        url.searchParams.append("myproducts", params.myproducts);
      }

      if (params.minPrice) {
        url.searchParams.append("minPrice", params.minPrice);
      }

      if (params.maxPrice) {
        url.searchParams.append("maxPrice", params.maxPrice);
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
      const productCurrencies = data.map(product => product.currency);
      await fetchExchangeRates(productCurrencies);
      await fetchCurrencySymbols(productCurrencies);

      setProducts(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error fetching products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [getUserRole]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {

      if (maxPrice === priceRange[1]) {
      fetchProducts({ searchBy: searchTerm
        , sort: sortBy
        , asc: sortOrder
        , myproducts: myProducts
        , minPrice: priceRange[0]
       });
      }
      else{
        fetchProducts({ searchBy: searchTerm
          , sort: sortBy
          , asc: sortOrder
          , myproducts: myProducts
          , minPrice: priceRange[0]
          , maxPrice: priceRange[1]
         });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchProducts]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      fetchProducts();
    }
  }, [userInfo, fetchProducts]);

  useEffect(() => {
    if (sortBy) {
      fetchProducts({ sort: sortBy, asc: sortOrder, myproducts: myProducts, minPrice: priceRange[0], maxPrice: priceRange[1] });
    }
  }, [sortBy, sortOrder, fetchProducts]);

  useEffect(() => {
    if (myProducts) {
      fetchProducts({ myproducts: myProducts });
    }
  }, [myProducts, fetchProducts]);

  const handleProductSelect = (id) => {
    navigate(`/product/${id}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (attribute) => {
    setSortOrder(prevOrder => prevOrder === 1 ? -1 : 1);
    setSortBy(attribute);
  };

  const handleMyProducts = (attribute) => {
    setMyProducts(attribute);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("");
    setSortOrder(1);
    setMyProducts(false);
    setPriceRange([0, maxPrice]);
    fetchProducts();
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Products</h1>

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
            searchProducts={() => fetchProducts({
              minPrice: priceRange[0],
              maxPrice: priceRange[1],
              myproducts: myProducts,
              sort: sortBy,
              asc: sortOrder
            })}
            role={getUserRole()}
          />
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {isLoading ? (
          <Loader />
        ) : (
          <>
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
                  userInfo={userInfo}
                  exchangeRates={exchangeRates}
                  currencySymbols={currencySymbols}
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
          </>
        )}
      </div>
    </div>
  );
}