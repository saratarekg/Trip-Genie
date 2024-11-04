"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import axios from "axios"
import { Search, ChevronLeft, ChevronRight, Star, Filter, Plus, ContactRound, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Loader from "./Loader"
import defaultImage from "../assets/images/default-image.jpg"
import DualHandleSliderComponent from "./dual-handle-slider"

const renderStars = (rating) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

const ProductCard = ({ product, onSelect, userInfo, onBuyNow }) => {
  const [exchangeRate, setExchangeRate] = useState(null)
  const [currencySymbol, setCurrencySymbol] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userInfo && userInfo.role === 'tourist' && userInfo.preferredCurrency !== product.currency) {
      fetchExchangeRate()
    } else {
      getCurrencySymbol()
    }
  }, [userInfo, product])

  const fetchExchangeRate = useCallback(async () => {
    if(userInfo && userInfo.role === 'tourist'){
      try {
        const token = Cookies.get("jwt")
        const response = await fetch(
          `http://localhost:4000/${userInfo.role}/populate`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base: product.currency,
              target: userInfo.preferredCurrency._id,
            }),
          }
        )
        const data = await response.json()
        if (response.ok) {
          setExchangeRate(data.conversion_rate)
        } else {
          console.error('Error in fetching exchange rate:', data.message)
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
      }
    }
  }, [userInfo, product])

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.get(`http://localhost:4000/${userInfo.role}/getCurrency/${product.currency}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCurrencySymbol(response.data.symbol)
    } catch (error) {
      console.error("Error fetching currency symbol:", error)
    }
  }, [userInfo, product])

  const formatPrice = (price) => {
    if (userInfo && userInfo.role === 'tourist' && userInfo.preferredCurrency) {
      if (userInfo.preferredCurrency === product.currency) {
        return `${userInfo.preferredCurrency.symbol}${price}`
      } else if (exchangeRate) {
        const exchangedPrice = price * exchangeRate
        return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(2)}`
      }
    } else if (currencySymbol) {
      return `${currencySymbol}${price}`
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="p-0" onClick={() => onSelect(product._id)}>
        <img
          src={product?.pictures?.[0] || defaultImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4" onClick={() => onSelect(product._id)}>
        <CardTitle className="text-lg text-blue-800">{product.name}</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {product.description.length > 100
            ? `${product.description.slice(0, 100)}...`
            : product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <span className="text-lg font-bold text-orange-400">{formatPrice(product.price)}</span>
        {renderStars(product.rating)}
      </CardFooter>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-orange-400 hover:bg-orange-500 text-white"
          onClick={(e) => {
            e.stopPropagation()
            onBuyNow(product)
          }}
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AllProducts() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState(1)
  const [sortBy, setSortBy] = useState("")
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [myProducts, setMyProducts] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRating, setSelectedRating] = useState(null)
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [deliveryType, setDeliveryType] = useState("")
  const [locationType, setLocationType] = useState("")
  const [location, setLocation] = useState("")
  const tripsPerPage = 6

  const navigate = useNavigate()

  const getUserRole = useCallback(() => {
    let role = Cookies.get("role")
    return role || "guest"
  }, [])

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest"
    const token = Cookies.get("jwt")

    if (role === 'tourist') {
      try {
        const response = await axios.get('http://localhost:4000/tourist/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const currencyId = response.data.preferredCurrency

        const currencyResponse = await axios.get(`http://localhost:4000/tourist/getCurrency/${currencyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        setUserInfo({
          role,
          preferredCurrency: currencyResponse.data
        })
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setUserInfo({ role })
      }
    } else {
      setUserInfo({ role })
    }
  }, [])

  const getSymbol = () => {
    if (userInfo && userInfo.role === 'tourist' && userInfo.preferredCurrency) {
      return `${userInfo.preferredCurrency.symbol}`
    } else {
      return "$"
    }
  }

  const fetchProducts = useCallback(
    async (params = {}) => {
      setIsLoading(true)
      try {
        const token = Cookies.get("jwt")
        const role = getUserRole()
        const url = new URL(`http://localhost:4000/${role}/products`)

        if (params.searchBy) url.searchParams.append("searchBy", params.searchBy)
        if (params.sort) {
          url.searchParams.append("sort", params.sort)
          url.searchParams.append("asc", params.asc)
        }
        if (params.myproducts) url.searchParams.append("myproducts", params.myproducts)
        if (params.minPrice) url.searchParams.append("minPrice", params.minPrice)
        if (params.maxPrice) url.searchParams.append("maxPrice", params.maxPrice)
        if (params.rating) url.searchParams.append("rating", params.rating)
        if (params.categories && params.categories.length > 0) {
          url.searchParams.append("categories", params.categories.join(','))
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setProducts(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Error fetching products")
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    },
    [getUserRole]
  )

  useEffect(() => {
    if (userInfo) {
      fetchProducts()
    }
  }, [userInfo, fetchProducts])

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        searchBy: searchTerm,
        sort: sortBy,
        asc: sortOrder,
        myproducts: myProducts,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: selectedRating,
        categories: selectedCategories
      })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, sortBy, sortOrder, myProducts, priceRange, selectedRating, selectedCategories, fetchProducts])

  const handleProductSelect = (id) => {
    navigate(`/product/${id}`)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSort = (attribute) => {
    setSortOrder((prevOrder) => (prevOrder === 1 ? -1 : 1))
    setSortBy(attribute)
  }

  const handleMyProducts = (attribute) => {
    setMyProducts(attribute)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSortBy("")
    setSortOrder(1)
    setMyProducts(false)
    setPriceRange([0, maxPrice])
    setSelectedRating(null)
    setSelectedCategories([])
    fetchProducts()
  }

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleBuyNow = (product) => {
    setSelectedProduct(product)
    setShowPurchaseConfirm(true)
  }

  const handlePurchase = async () => {
    try {
      const token = Cookies.get("jwt")
      
      const totalAmount = selectedProduct.price * quantity

      const response = await fetch("http://localhost:4000/tourist/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: [
            {
              product: selectedProduct._id,
              quantity: quantity,
            }
          ],
          totalAmount,
          paymentMethod: paymentMethod,
          shippingAddress: location,
          locationType: locationType,
          deliveryType: deliveryType,  
          deliveryTime: deliveryTime,
          deliveryDate: deliveryDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to complete purchase")
      }

      // Handle successful purchase
      console.log("Purchase completed successfully!")
      setShowPurchaseConfirm(false)

    } catch (error) {
      console.error("Error completing purchase:", error)
      // Handle error (e.g., show error message to user)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">All Products</h1>
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-6">Filters</h2>
            
            {/* Search */}
            <div className="mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Categories  */}
            {/* <div className="mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Categories</h3>
              <div className="space-y-2">
                {['Vegetables', 'Fruits', 'Kitchen Accessories', 'Chefs Tips'].map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox 
                      id={category} 
                      className="border-teal-400"
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <label htmlFor={category} className="ml-2 text-sm font-medium">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Price Range</h3>
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
              <h3 className="font-medium text-blue-800 mb-2">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={`flex items-center w-full p-2 rounded hover:bg-gray-100 ${
                      selectedRating === rating ? 'bg-blue-100' : ''
                    }`}
                  >
                    {renderStars(rating)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort by Rating */}
            <div className="mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Sort by Rating</h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => handleSort("rating")}
              >
                <span>Rating</span>
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === "rating" ? (sortOrder === 1 ? "↓"  : "↑") : ""}
              </Button>
            </div>

            {/* Clear Filters Button */}
            <Button 
              onClick={clearFilters}
              className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white"
            >
              Clear Filters
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full md:hidden"
                  onClick={toggleFilters}
                >
                  <Filter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-full ${myProducts ? "bg-orange-400 text-white" : ""}`}
                  onClick={() => handleMyProducts(!myProducts)}
                >
                  <ContactRound className="w-4 h-4 mr-2" />
                  My Products
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage)
                    .map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        userInfo={userInfo}
                        onSelect={handleProductSelect}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium">
                    Page {currentPage} of {Math.ceil(products.length / tripsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(products.length / tripsPerPage)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Confirm Purchase</DialogTitle>
          </DialogHeader>

          {/* Product Details */}
          <div className="my-4">
            <h2 className="text-2xl font-bold">Product Details</h2>
            <div className="my-4">
              <p className="text-xl font-semibold">{selectedProduct?.name}</p>
            </div>
            <div className="my-4">
              <label htmlFor="quantity" className="block text-lg font-medium">Quantity</label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={selectedProduct?.quantity}
              />
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="my-4">
            <h2 className="text-2xl font-bold">Payment & Delivery</h2>
            <div className="my-4">
              <label htmlFor="deliveryDate" className="block text-lg font-medium">Delivery Date</label>
              <Input
                type="date"
                id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="my-4">
              <label htmlFor="deliveryTime" className="block text-lg font-medium">Delivery Time</label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                  <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="my-4">
              <label htmlFor="deliveryType" className="block text-lg font-medium">Delivery Type</label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard Shipping</SelectItem>
                  <SelectItem value="Express">Express Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="my-4">
              <label htmlFor="paymentMethod" className="block text-lg font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Details */}
          <div className="my-4">
            <h2 className="text-2xl font-bold">Location Details</h2>
            <div className="my-4">
              <label htmlFor="locationType" className="block text-lg font-medium">Location Type</label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="my-4">
              <label htmlFor="location" className="block text-lg font-medium">Address</label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter full address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="bg-orange-400 hover:bg-orange-500 text-white">
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}