'use client'

import { useState, useEffect, useCallback } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import axios from 'axios'

export default function CartDropdown({ 
  isOpen = false, 
  onClose, 
  isCartOpen,
  setIsCartOpen
}) {
  const [cartItems, setCartItems] = useState([])
  const [exchangeRates, setExchangeRates] = useState({})
  const [currencies, setCurrencies] = useState([])
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null)
  const [userRole, setUserRole] = useState("guest")
  const navigate = useNavigate()

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/rates')
      setExchangeRates(response.data.rates)
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    }
  }, [])

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/tourist/currencies', {
        headers: { Authorization: `Bearer ${Cookies.get('jwt')}` }
      })
      setCurrencies(response.data)
    } catch (error) {
      console.error('Error fetching currencies:', error)
    }
  }, [])

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest"
    setUserRole(role)

    if (role === 'tourist') {
      try {
        const token = Cookies.get("jwt")
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const currencyId = response.data.preferredCurrency

        const response2 = await axios.get(`http://localhost:4000/tourist/getCurrency/${currencyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUserPreferredCurrency(response2.data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }
  }, [])

  const fetchCartItems = useCallback(async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await fetch("http://localhost:4000/tourist/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error("Error fetching cart items:", error)
    }
  }, [])

  const formatPrice = useCallback((price, productCurrency) => {
    if (userRole === 'tourist' && userPreferredCurrency) {
      const baseRate = exchangeRates[productCurrency] || 1
      const targetRate = exchangeRates[userPreferredCurrency.code] || 1
      const exchangedPrice = (price / baseRate) * targetRate
      return `${userPreferredCurrency.symbol}${exchangedPrice.toFixed(2)}`
    }
    const currency = currencies.find(c => c._id === productCurrency)
    return `${currency ? currency.symbol : '$'}${price.toFixed(2)}`
  }, [userRole, userPreferredCurrency, exchangeRates, currencies])

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const token = Cookies.get("jwt")
      const response = await fetch(
        `http://localhost:4000/tourist/update/cart`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newQuantity, productId }),
        }
      )
      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const handleRemoveItem = async (productId) => {
    try {
      const token = Cookies.get("jwt")
      const response = await fetch(
        `http://localhost:4000/tourist/remove/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    fetchExchangeRates()
    fetchCurrencies()
    fetchCartItems()
  }, [fetchUserInfo, fetchExchangeRates, fetchCurrencies, fetchCartItems])

  if (!isOpen) return null

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-[100]">
      
        <div className="realtive w-full pt-2 ">
      <div className="flex justify-between items-center mb-4 w-full border-b border-gray-300 px-4 py-2">
  <h2 className="text-lg font-semibold text-black">My Cart ({cartItems.length})</h2>
  <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
    ×
  </button>
</div>
</div>
<div className="pr-4 pl-4 pb-4">
        {/* Display "No products in cart" message if the cart is empty */}
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">No products in cart</p>
        ) : (
          <div className="space-y-4">
            {cartItems.slice(0, 3).map((item, index) => (
              <div key={item.product._id} className={`flex items-center gap-4 p-2 ${index < cartItems.length - 1 ? 'border-b' : ''}`}>
                <div 
                  onClick={() => (navigate(`/product/${item.product._id}`), setIsCartOpen(false))} 
                  className="flex-shrink-0 cursor-pointer"
                >
                  <img
                    src={item.product.pictures[0]?.url || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span 
                        onClick={() => (navigate(`/product/${item.product._id}`), setIsCartOpen(false))} 
                        className="font-medium text-black text-base cursor-pointer hover:underline"
                      >
                        {item.product.name}
                      </span>
                    </div>
                    <p className="font-semibold text-black text-lg">
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-black"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-black">{item.quantity}</span>
                      <Button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-black"
                        disabled={item.quantity >= item.product.quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleRemoveItem(item.product._id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <Button
            className="w-full mt-4 text-white text-lg font-semibold bg-[#1A3B47] hover:bg-[#14303A] transition duration-300 ease-in-out"
            onClick={() => {
              navigate('/touristCart')
              setIsCartOpen(false)
              onClose()
            }}
          >
            View All
          </Button>
        )}
      </div>
    </div>
  )
}
