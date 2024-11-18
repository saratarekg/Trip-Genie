'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { format, isValid } from 'date-fns'
import axios from 'axios'
import Cookies from 'js-cookie'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState('guest')
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null)
  const [rates, setRates] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 6

  useEffect(() => {
    fetchUserInfo()
    fetchRates()
    fetchOrders()
  }, [])

  const fetchUserInfo = async () => {
    const role = Cookies.get("role") || "guest"
    setUserRole(role)

    if (role === "tourist") {
      try {
        const token = Cookies.get("jwt")
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const currencyId = response.data.preferredCurrency

        const response2 = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${currencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setUserPreferredCurrency(response2.data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }
  }

  const handleCancel = async (orderId) => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.put(`http://localhost:4000/tourist/cancelPurchase/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Order canceled:", response.data)
      fetchOrders()
    } catch (error) {
      console.error("Error canceling order:", error)
    }
  }

  const fetchRates = async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates")
      setRates(response.data.rates)
    } catch (error) {
      console.error("Error fetching rates:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.get("http://localhost:4000/tourist/purchase", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const displayPrice = (priceUSD) => {
    if (!userPreferredCurrency) return `$${priceUSD}`
    const rate = rates[userPreferredCurrency.code]
    return `${userPreferredCurrency.symbol}${(priceUSD * rate).toFixed(2)}`
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase()
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = searchQuery === '' || 
      order.products.some(item => 
        item.product?.name?.toLowerCase().includes(searchLower)
      ) ||
      order.deliveryType.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-[#F88C33] text-white'
      case 'delivered':
        return 'bg-[#5D9297] text-white'
      case 'cancelled':
        return 'bg-gray-300 text-[#1A3B47]'
      default:
        return 'bg-gray-100 text-[#1A3B47]'
    }
  }

  const getOrderIdentifier = (index) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const number = Math.floor(index / 26) + 1
    const letter = letters[index % 26]
    return `${letter}${number}`
  }

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>
      <div className="container mx-auto p-6">
      <h1 className="text-5xl font-bold mb-3 text-[#1A3B47]">Orders</h1>
        <div className="flex justify-between items-center mb-6">
        <div className='mr-2' >
  <button 
    onClick={() => setFilter('all')} 
    className={`px-4 py-2 mr-2 rounded ${filter === 'all' ? 'bg-[#388A94] text-white' : 'bg-white text-black'}`}>
    All
  </button>
  <button 
    onClick={() => setFilter('pending')} 
    className={`px-4 py-2 mr-2 rounded ${filter === 'pending' ? 'bg-[#388A94] text-white' : 'bg-white text-black'}`}>
    Pending
  </button>
  <button 
    onClick={() => setFilter('delivered')} 
    className={`px-4 py-2 mr-2 rounded ${filter === 'delivered' ? 'bg-[#388A94] text-white' : 'bg-white text-black'}`}>
    Completed
  </button>
  <button 
    onClick={() => setFilter('cancelled')} 
    className={`px-4 py-2 mr-2 rounded ${filter === 'cancelled' ? 'bg-[#388A94] text-white' : 'bg-white text-black'}`}>
    Cancelled
  </button>
</div>

          
          <div className="relative w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="    Search products, delivery type, or status..."
              className="pl-9 border-[#B5D3D1]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-[#1A3B47]">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.map((order, index) => (
              <Card key={order._id} className="bg-white w-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="bg-[#B5D3D1] text-[#1A3B47] font-bold text-2xl px-3 py-2 rounded">
                        {getOrderIdentifier(index)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium">{order.deliveryType}</span>
                        <span className="text-xs text-muted-foreground">Order #{order._id.slice(-5)}</span>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-base font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' ? 'Pending' : 
                       order.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                    </div>
                  </div>
                  <div className="flex justify-between mt-4 text-base text-muted-foreground">
  <span>
    {order.status === 'delivered'
      ? format(new Date(order.deliveryDate), 'EEE, MMM dd, yyyy') // Show delivery date if delivered
      : format(new Date(order.purchaseDate), 'EEE, MMM dd, yyyy')} 
  </span>
  <span>
    {order.status === 'delivered'
      ? format(new Date(order.deliveryDate), 'hh:mm a') // Show delivery time if delivered
      : format(new Date(order.purchaseDate), 'hh:mm a')} 
  </span>
</div>

                </CardHeader>
                
                <CardContent className="border-y border-[#B5D3D1]">
                  <div className="grid grid-cols-[1fr,auto,auto] gap-4 mb-2 mt-2 text-sm text-muted-foreground">
                    <span>Items</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Price</span>
                  </div>
                  <div className="space-y-2 min-h-[120px] relative">
                    {order.products.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr,auto,auto] gap-4 items-center">
                        <span className="text-base break-words">{item.product.name}</span>
                        <span className="text-sm text-center text-gray-500">x{item.quantity}</span>
                        <span className="text-sm text-right">{displayPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.products.length >= 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent flex items-end justify-center">
                        {order.products.length > 3 && (
                        <span className="text-sm text-[#388A94] font-medium">
                          +{order.products.length - 3} more items
                        </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4 pt-4">
  <div className="flex justify-between items-center w-full">
    <span className="text-base font-semibold">Total</span>
    <span className="text-lg font-semibold">{displayPrice(order.totalPrice)}</span>
  </div>
  
  <div className="flex gap-2 w-full">
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1 text-base bg-gray-200 text-[#388A94] hover:bg-gray-300 ">
          See Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[800px] max-h-[600px] p-6 overflow-y-auto"> {/* Increased width */}
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle> {/* Larger title */}
          <DialogDescription className="text-lg text-muted-foreground">
            Order #{order._id.slice(-5)} • {format(new Date(order.purchaseDate), 'EEE, MMM dd, yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-6"> {/* 2-column grid */}
          
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Status:</span>
              <span className="col-span-3 text-lg">{order.status === 'delivered' ? 'Completed' : order.status}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Delivery Type:</span>
              <span className="col-span-3 text-lg">{order.deliveryType}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
  <span className="font-medium text-lg">Delivery Date:</span>
  <span className="col-span-3 text-lg">
    {isValid(new Date(order.deliveryDate)) 
      ? format(new Date(order.deliveryDate), 'EEE, MMM dd, yyyy') 
      : 'Invalid Delivery Date'}
  </span>
</div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Delivery Time:</span>
              <span className="col-span-3 text-lg">{order.deliveryTime}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Payment Method:</span>
              <span className="col-span-3 text-lg">{order.paymentMethod.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          {/* Column 2 */}
          {order.shippingAddress && (
            <>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Address:</span>
              <div className="col-span-3 text-lg">
                <div><strong>Street Name:</strong> {order.shippingAddress?.split(',')[0]?.split(':')[1]?.trim()}</div>
                <div><strong>Street Number:</strong> {order.shippingAddress?.split(',')[1]?.split(':')[1]?.trim()}</div>
                <div><strong>Floor/Unit:</strong> {order.shippingAddress?.split(',')[2]?.split(':')[1]?.trim()}</div>
                <div><strong>State:</strong> {order.shippingAddress?.split(',')[3]?.split(':')[1]?.trim()}</div>
                <div><strong>City:</strong> {order.shippingAddress?.split(',')[4]?.split(':')[1]?.trim()}</div>
                <div><strong>Postal Code:</strong> {order.shippingAddress?.split(',')[5]?.split(':')[1]?.trim()}</div>
                <div><strong>Landmark:</strong> {order.shippingAddress?.split(',')[6]?.split(':')[1]?.trim()}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium text-lg">Location Type:</span>
              <span className="col-span-3 text-lg">{order.locationType}</span>
            </div>
          </div>
          </>
          )}
        </div>
        

        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-lg">Products:</span>
            <ul className="col-span-3 list-disc pl-5 text-lg">
              {order.products.map((item, idx) => (
                <li key={idx}>
                  {item.product.name} x{item.quantity} - {displayPrice(item.product.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-lg">Total:</span>
            <span className="col-span-3 font-bold text-lg">{displayPrice(order.totalPrice)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {order.status === 'pending' && (
      <Button 
        variant="destructive" 
        className="flex-1 text-base bg-[#F88C33] hover:bg-[#e67d24] text-white"
        onClick={() => handleCancel(order._id)}
      >
        Cancel
      </Button>
    )}
  </div>
</CardFooter>


              </Card>
            ))}
          </div>
        )}
        
        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-[#388A94] text-white hover:bg-[#2e6b77]"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 bg-white rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-[#388A94] text-white hover:bg-[#2e6b77]"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}