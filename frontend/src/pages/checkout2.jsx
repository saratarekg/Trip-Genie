'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronRight, PlusCircle } from 'lucide-react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { format, addDays } from 'date-fns'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import AddCard from "@/pages/AddCard"
import ShippingAddress from "@/pages/AddShippingAddress"

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  streetName: z.string().min(1, "Street name is required"),
  streetNumber: z.string().min(1, "Street number is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  locationType: z.string().min(1, "Location type is required"),
  deliveryDate: z.string().refine(
    (date) => new Date(date) > new Date(),
    "Delivery date must be in the future"
  ),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  deliveryType: z.string().min(1, "Delivery type is required"),
  paymentMethod: z.enum(["credit_card", "debit_card", "wallet", "cash_on_delivery"], {
    required_error: "Payment method is required",
  }),
  selectedCard: z.string().optional().refine((val) => val && val.length > 0, {
    message: "Please select a card",
    path: ["selectedCard"],
  }),
})

export default function CheckoutPage() {
  const [userRole, setUserRole] = useState('tourist')
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null)
  const [exchangeRates, setExchangeRates] = useState({})
  const [currencySymbol, setCurrencySymbol] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [savedCards, setSavedCards] = useState([])
  const [savedAddresses, setSavedAddresses] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetName: "",
      streetNumber: "",
      city: "",
      state: "",
      postalCode: "",
      locationType: "",
      deliveryDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      deliveryTime: "",
      deliveryType: "",
      paymentMethod: "",
      selectedCard: "",
    },
  })

  useEffect(() => {
    fetchUserInfo()
    fetchCart()
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
        const userData = response.data
        const currencyId = userData.preferredCurrency
        setSavedCards(userData.cards || [])
        setSavedAddresses(userData.shippingAddresses || [])

        // Set default address if available
        const defaultAddress = userData.shippingAddresses?.find(addr => addr.default)
        if (defaultAddress) {
          Object.keys(defaultAddress).forEach(key => {
            if (key !== 'default') {
              form.setValue(key, defaultAddress[key])
            }
          })
        }

        form.setValue("firstName", userData.fname || "")
        form.setValue("lastName", userData.lname || "")
        form.setValue("email", userData.email || "")
        form.setValue("phone", userData.mobile || "")

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

  const fetchCart = async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.get("http://localhost:4000/tourist/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCartItems(response.data || [])
      calculateTotal(response.data)
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0)
    setTotalAmount(total)
  }

  const fetchExchangeRate = async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await fetch(
        `http://localhost:4000/${userRole}/populate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: cartItems[0]?.product.currency,
            target: userPreferredCurrency._id,
          }),
        }
      )
      const data = await response.json()

      if (response.ok) {
        setExchangeRates(data.conversion_rate)
      } else {
        console.error("Error in fetching exchange rate:", data.message)
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
    }
  }

  const getCurrencySymbol = async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.get(
        `http://localhost:4000/${userRole}/getCurrency/${cartItems[0]?.product.currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setCurrencySymbol(response.data)
    } catch (error) {
      console.error("Error fetching currency symbol:", error)
    }
  }

  const formatPrice = (price) => {
    const roundedPrice = price
    if (cartItems.length > 0) {
      if (userRole === "tourist" && userPreferredCurrency) {
        if (userPreferredCurrency._id === cartItems[0].product.currency) {
          return `${userPreferredCurrency.symbol}${roundedPrice}`
        } else {
          const exchangedPrice = (roundedPrice * exchangeRates).toFixed(2)
          return `${userPreferredCurrency.symbol}${exchangedPrice}`
        }
      } else {
        if (currencySymbol) {
          return `${currencySymbol.symbol}${roundedPrice}`
        }
      }
    }
    return `$${roundedPrice}`
  }

  useEffect(() => {
    if (cartItems.length > 0) {
      if (
        userRole === "tourist" &&
        userPreferredCurrency &&
        userPreferredCurrency._id !== cartItems[0].product.currency
      ) {
        fetchExchangeRate()
      } else {
        getCurrencySymbol()
      }
    }
  }, [userRole, userPreferredCurrency, cartItems])

  const handleAddNewAddress = async (addressData) => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.post(
        "http://localhost:4000/tourist/addAddress",
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.status === 200) {
        const userResponse = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSavedAddresses(userResponse.data.shippingAddresses || [])
        
        setIsAddAddressOpen(false)
        Object.keys(addressData).forEach(key => {
          form.setValue(key, addressData[key])
        })
      }
    } catch (error) {
      console.error("Error adding new address:", error)
    }
  }

  const handleAddNewCard = async (cardData) => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.post(
        "http://localhost:4000/tourist/addCard",
        cardData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.status === 200) {
        const userResponse = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSavedCards(userResponse.data.cards || [])
        
        setIsAddCardOpen(false)
        form.setValue("paymentMethod", cardData.cardType === "Credit Card" ? "credit_card" : "debit_card")
        form.setValue("selectedCard", cardData.cardNumber)
      }
    } catch (error) {
      console.error("Error adding new card:", error)
    }
  }

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get("jwt")
      const products = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }))

      const response = await fetch("http://localhost:4000/tourist/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products,
          totalAmount,
          paymentMethod: data.paymentMethod,
          selectedCard: data.selectedCard,
          shippingAddress: `${data.streetNumber} ${data.streetName}, ${data.city}, ${data.state} ${data.postalCode}`,
          locationType: data.locationType,
          deliveryType: data.deliveryType,
          deliveryTime: data.deliveryTime,
          deliveryDate: data.deliveryDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message)
      }

      setPurchaseStatus('success')
      setIsStatusDialogOpen(true)
      emptyCart()
    } catch (error) {
      console.error('Error making purchase:', error)
      setPurchaseStatus('error')
      setIsStatusDialogOpen(true)
    }
  }

  const emptyCart = async () => {
    try {
      setCartItems([])

      const token = Cookies.get("jwt")
      const emptyCartResponse = await fetch("http://localhost:4000/tourist/empty/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (emptyCartResponse.ok) {
        console.log('Cart emptied successfully.')
      } else {
        console.error('Failed to empty the cart.')
      }
    } catch (error) {
      console.error('Error emptying cart items:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
      </div>
      <div className="max-w-6xl mx-auto pt-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#1A3B47]">Checkout</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-6 bg-[#B5D3D1]">
              <CardContent>
                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#1A3B47]">Personal Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#1A3B47]">Address Details</h2>
                    {savedAddresses.length > 0 && (
                      <FormField
                        control={form.control}
                        name="selectedAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Saved Addresses</FormLabel>
                            <RadioGroup
                              onValueChange={(value) => {
                                const address = savedAddresses.find(addr => 
                                  addr.streetNumber === value.split('|')[0] && 
                                  addr.streetName === value.split('|')[1]
                                )
                                if (address) {
                                  Object.keys(address).forEach(key => {
                                    if (key !== 'default') {
                                      form.setValue(key, address[key])
                                    }
                                  })
                                }
                              }}
                              className="space-y-4"
                            >
                              {savedAddresses.map((address, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-white p-4 rounded-xl">
                                  <RadioGroupItem 
                                    value={`${address.streetNumber}|${address.streetName}`} 
                                    id={`address-${index}`} 
                                  />
                                  <Label htmlFor={`address-${index}`}>
                                    {`${address.streetNumber} ${address.streetName}, ${address.city}, ${address.state} ${address.postalCode}`}
                                    {address.default && " (Default)"}
                                  </Label>
                                  <ChevronRight className="ml-auto" />
                                </div>
                              ))}
                            </RadioGroup>
                          </FormItem>
                        )}
                      />
                    )}
                    <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <ShippingAddress onClose={handleAddNewAddress} />
                      </DialogContent>
                    </Dialog>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="streetName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="streetNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="locationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#1A3B47]">Delivery Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" min={format(addDays(new Date(), 1), 'yyyy-MM-dd')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                                <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="deliveryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select delivery type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Delivery - {formatPrice(5.99)}</SelectItem>
                              <SelectItem value="express">Express Delivery - {formatPrice(9.99)}</SelectItem>
                              <SelectItem value="nextday">Next Day Delivery - {formatPrice(14.99)}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#1A3B47]">Payment Details</h2>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (value !== "credit_card" && value !== "debit_card") {
                                form.setValue("selectedCard", "")
                              }
                            }}
                            value={field.value}
                            className="space-y-4"
                          >
                            {savedCards.some(card => card.cardType === "Credit Card") && (
                              <div className="flex items-center space-x-2 bg-white p-4 rounded-xl">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card">Credit Card</Label>
                              </div>
                            )}
                            {savedCards.some(card => card.cardType === "Debit Card") && (
                              <div className="flex items-center space-x-2 bg-white p-4 rounded-xl">
                                <RadioGroupItem value="debit_card" id="debit_card" />
                                <Label htmlFor="debit_card">Debit Card</Label>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 bg-white p-4 rounded-xl">
                              <RadioGroupItem value="wallet" id="wallet" />
                              <Label htmlFor="wallet">Wallet</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-white p-4 rounded-xl">
                              <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                              <Label htmlFor="cash_on_delivery">Cash on Delivery</Label>
                            </div>
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(form.watch("paymentMethod") === "credit_card" || form.watch("paymentMethod") === "debit_card") && (
                      <FormField
                        control={form.control}
                        name="selectedCard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select a Card</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a card" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {savedCards
                                  .filter(card => card.cardType === (form.watch("paymentMethod") === "credit_card" ? "Credit Card" : "Debit Card"))
                                  .map((card) => (
                                    <SelectItem key={card.cardNumber} value={card.cardNumber}>
                                      **** **** **** {card.cardNumber.slice(-4)}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Card</DialogTitle>
                        </DialogHeader>
                        <AddCard onClose={handleAddNewCard} />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#1A3B47]">Order Summary</h2>
                    <div className="bg-white rounded-xl p-6 space-y-4">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item?.product?.name} x {item?.quantity}</span>
                          <span>{formatPrice(item?.totalPrice)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatPrice(totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#1A3B47] hover:bg-[#388A94]">
                    Complete Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {purchaseStatus === 'success' ? 'Purchase Successful!' : 'Purchase Failed'}
            </DialogTitle>
          </DialogHeader>
          <p>
            {purchaseStatus === 'success'
              ? 'Your order has been placed successfully. Thank you for your purchase!'
              : 'There was an error processing your purchase. Please try again or contact support.'}
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsStatusDialogOpen(false)
                // Navigate to home page
              }}
              className="bg-[#5D9297] hover:bg-[#388A94]"
            >
              Go to Home
            </Button>
            <Button
              onClick={() => {
                setIsStatusDialogOpen(false)
                // Navigate to all products page
              }}
              className="bg-[#1A3B47] hover:bg-[#388A94]"
            >
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}