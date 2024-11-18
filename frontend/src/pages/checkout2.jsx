import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import Cookies from "js-cookie"
import { format, addDays, addBusinessDays } from "date-fns"
import * as z from "zod"
import { FaStar } from "react-icons/fa"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useSearchParams } from "react-router-dom"
import ShippingAddress from "@/pages/AddShippingAddress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  deliveryTime: z.string().min(1, "Delivery time is required"),
  deliveryType: z.string().min(1, "Delivery type is required"),
  paymentMethod: z.enum(
    ["credit_card", "debit_card", "wallet", "cash_on_delivery"],
    {
      required_error: "Payment method is required",
    }
  ),
  selectedCard: z
    .string()
    .optional()
    .refine((val) => val && val.length > 0, {
      message: "Please select a card",
      path: ["selectedCard"],
    }),
})

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const [paySucess, setPaySucess] = useState(false)
  const [activeSection, setActiveSection] = useState("personal")
  const [userRole, setUserRole] = useState("tourist")
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null)
  const [exchangeRates, setExchangeRates] = useState({})
  const [currencySymbol, setCurrencySymbol] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [savedCards, setSavedCards] = useState([])
  const [savedAddresses, setSavedAddresses] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isPriceLoading, setIsPriceLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddCardForm, setShowAddCardForm] = useState(false)
  const [showSavedAddresses, setShowSavedAddresses] = useState(false)
  const [showSavedCards, setShowSavedCards] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const navigate = useNavigate()
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null)
  const [addressDetails, setAddressDetails] = useState({
    streetName: "",
    streetNumber: "",
    floorUnit: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    landmark: "",
    locationType: "",
    default: false,
  })
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    holderName: "",
    cvv: "",
    cardType: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoDetails, setPromoDetails] = useState(null)
  const [promoError, setPromoError] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountedTotal, setDiscountedTotal] = useState(0)
  const [currentPromoCode, setCurrentPromoCode] = useState("")
  const [deliveryType, setDeliveryType] = useState(
    searchParams.get("deliveryType") || ""
  )
  const [deliveryTime, setDeliveryTime] = useState(
    searchParams.get("deliveryTime") || ""
  )

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
      deliveryTime: "",
      deliveryType: "",
      paymentMethod: "",
      selectedCard: "",
    },
  })

  useEffect(() => {
    fetchUserInfo()
  }, [])

  useEffect(() => {
    const loadPrices = async () => {
      setIsPriceLoading(true)
      await fetchCart()
      await fetchExchangeRate()
      await getCurrencySymbol()
      setIsPriceLoading(false)
    }
    loadPrices()
  }, [userPreferredCurrency])

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

        const defaultAddress = userData.shippingAddresses?.find(
          (addr) => addr.default
        )
        const defaultCard = userData.cards?.find((card) => card.default)

        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
          Object.keys(defaultAddress).forEach((key) => {
            if (key !== "default") {
              form.setValue(key, defaultAddress[key])
            }
          })
        }

        if (defaultCard) {
          setSelectedCard(defaultCard)
          form.setValue(
            "paymentMethod",
            defaultCard.cardType === "Credit Card"
              ? "credit_card"
              : "debit_card"
          )
          form.setValue("selectedCard", defaultCard.cardNumber)
        }

        form.setValue("firstName", userData.fname || "")
        form.setValue("lastName", userData.lname || "")
        form.setValue("email", userData.email || "")
        form.setValue("phone", userData.mobile || "")

        if (
          response.data.currentPromoCode &&
          response.data.currentPromoCode.code
        ) {
          setCurrentPromoCode(response.data.currentPromoCode.code)
          setPromoCode(response.data.currentPromoCode.code)
        }

        const response2 = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${currencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setUserPreferredCurrency(response2.data)
        if (
          response.data.currentPromoCode &&
          response.data.currentPromoCode.code
        ) {
          await handlePromoSubmit({ preventDefault: () => {} })
        }
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

  const handlePromoSubmit = async (e) => {
    if (e) e.preventDefault()
    setPromoError("")
    setPromoDetails(null)
    setDiscountAmount(0)
    setDiscountedTotal(totalAmount)

    if (!promoCode.trim()) {
      return
    }

    try {
      const response = await fetch(
        "http://localhost:4000/tourist/get/promo-code",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("jwt")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: promoCode }),
        }
      )

      if (response.status === 404) {
        setPromoError("Promo Code Not Found.")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch promo code details")
      }

      const data = await response.json()
      const promo = data.promoCode

      if (promo.status === "inactive") {
        setPromoError("This promo code is currently inactive.")
        return
      }

      const currentDate = new Date()
      const startDate = new Date(promo?.dateRange?.start)
      const endDate = new Date(promo?.dateRange?.end)

      if (currentDate < startDate || currentDate > endDate) {
        setPromoError("This promo code is not valid for the current date.")
        return
      }

      if (promo.timesUsed >= promo.usage_limit) {
        setPromoError("This promo code has reached its usage limit.")
        return
      }

      setPromoDetails(promo)
      const discount = totalAmount * (promo.percentOff / 100)
      setDiscountAmount(discount)
      setDiscountedTotal(totalAmount - discount)
    } catch (error) {
      console.error(error)
      setPromoError("Failed to apply promo code. Please try again.")
    }
  }

  const handleAddNewAddress = async (newAddress) => {
    setIsLoading(true)
    try {
      const token = Cookies.get("jwt")
      const response = await axios.post(
        "http://localhost:4000/tourist/addAddress",
        newAddress,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 200) {
        const userResponse = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const newAddresses = userResponse.data.shippingAddresses || []
        setSavedAddresses(newAddresses)

        const addedAddress = newAddresses.find(
          (addr) =>
            addr.streetName === newAddress.streetName &&
            addr.streetNumber === newAddress.streetNumber
        )
        if (addedAddress) {
          setSelectedAddress(addedAddress)
          Object.keys(addedAddress).forEach((key) => {
            if (key !== "default") {
              form.setValue(key, addedAddress[key])
            }
          })
        }

        setIsAddressDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding new address:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNewCard = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = Cookies.get("jwt")
      const response = await axios.post(
        "http://localhost:4000/tourist/addCard",
        cardDetails,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 200) {
        const userResponse = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const newCards = userResponse.data.cards || []
        setSavedCards(newCards)

        const newCard = newCards.find(
          (card) => card.cardNumber === cardDetails.cardNumber
        )
        if (newCard) {
          setSelectedCard(newCard)
          form.setValue(
            "paymentMethod",
            newCard.cardType === "Credit Card" ? "credit_card" : "debit_card"
          )
          form.setValue("selectedCard", newCard.cardNumber)
        }

        setShowAddCardForm(false)
        resetCardDetails()
      }
    } catch (error) {
      console.error("Error adding new card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripeRedirect = async (data) => {
    try {
      console.log("Redirecting to Stripe...")

      const API_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      const stripe = await loadStripe(API_KEY)

      const response = await fetch("http://localhost:4000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product: {
              name: item.product.name,
            },
            quantity: item.quantity,
            totalPrice: formatPrice2( item.totalPrice),
          })),
          currency: userPreferredCurrency.code,
          deliveryInfo: {
            type: data.deliveryType,
            time: data.deliveryTime,
            deliveryPrice: getDeliveryPrice(data.deliveryType),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server response:", errorData)
        throw new Error(`Failed to create checkout session: ${errorData.error || response.statusText}`)
      }

      const { id: sessionId } = await response.json()

      if (!sessionId) {
        throw new Error("No session ID returned from the server")
      }

      console.log("Session ID received:", sessionId)

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      })

      if (result.error) {
        console.error("Stripe redirect error:", result.error)
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error("Error in redirecting to Stripe:", error)
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  }

  const onSubmit = async (data) => {
    console.log("submitting", data)

    if (data.paymentMethod === "credit_card") {
      await handleStripeRedirect(data)
    } else {
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
            deliveryDate: estimatedDeliveryDate ? format(estimatedDeliveryDate, "yyyy-MM-dd") : null,
            promoCode: promoCode,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message)
        }

        setPurchaseStatus("success")
        setIsStatusDialogOpen(true)
        emptyCart()
      } catch (error) {
        console.error("Error making purchase:", error)
        setPurchaseStatus("error")
        setIsStatusDialogOpen(true)
      }
    }
  }

  const emptyCart = async () => {
    try {
      setCartItems([])

      const token = Cookies.get("jwt")
      const emptyCartResponse = await fetch(
        "http://localhost:4000/tourist/empty/cart",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (emptyCartResponse.ok) {
        console.log("Cart emptied successfully.")
      } else {
        console.error("Failed to empty the cart.")
      }
    } catch (error) {
      console.error("Error emptying cart items:", error)
    }
  }

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? "" : section)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setAddressDetails((prev) => ({ ...prev, [name]: checked }))
    } else {
      setAddressDetails((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  const resetAddressDetails = () => {
    setAddressDetails({
      streetName: "",
      streetNumber: "",
      floorUnit: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      landmark: "",
      locationType: "",
      default: false,
    })
  }

  const resetCardDetails = () => {
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      holderName: "",
      cvv: "",
      cardType: "",
    })
  }

  const handleNextSection = (currentSection) => {
    const sections = ["personal", "address", "payment", "delivery"]
    const currentIndex = sections.indexOf(currentSection)
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1])
    }
  }

  const calculateDeliveryDate = (deliveryType) => {
    const today = new Date()
    let estimatedDate

    switch (deliveryType) {
      case "Standard":
        estimatedDate = addBusinessDays(today, 8)
        break
      case "Express":
        estimatedDate = addBusinessDays(today, 3)
        break
      case "Next-Same":
        estimatedDate = addDays(today, 1)
        break
      case "International":
        estimatedDate = addBusinessDays(today, 21)
        break
      default:
        estimatedDate = addBusinessDays(today, 8)
    }

    setEstimatedDeliveryDate(estimatedDate)
  }

  const handleDeliveryTypeChange = (value) => {
    form.setValue("deliveryType", value)
    calculateDeliveryDate(value)
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

  const formatPrice2 = (price) => {
    const roundedPrice = price
    if (cartItems.length > 0) {
      if (userRole === "tourist" && userPreferredCurrency) {
        if (userPreferredCurrency._id === cartItems[0].product.currency) {
          return roundedPrice
        } else {
          const exchangedPrice = (roundedPrice * exchangeRates).toFixed(2)
          return exchangedPrice
        }
      }
    }
  }

  const formatPrice = (price) => {
    if (isPriceLoading) {
      return (
        <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
      )
    }
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

  const getDeliveryPrice = (deliveryType) => {
    switch (deliveryType) {
      case "Express":
        return formatPrice2(4.99)
      case "Next-Same":
        return formatPrice2(6.99)
      case "International":
        return formatPrice2(14.99)
      default:
        return formatPrice2(2.99)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-6">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
      </div>
      <div className="max-w-6xl mx-auto pt-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#1A3B47]">
          Checkout
        </h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Card className="bg-white">
                  <CardContent className="p-6">
                    {/* Personal Details Section */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection("personal")}
                      >
                        <h2 className="text-2xl font-bold text-[#1A3B47]">
                          Personal Details
                        </h2>
                        {activeSection === "personal" ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </div>
                      {activeSection === "personal" && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <p>{form.watch("firstName")}</p>
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <p>{form.watch("lastName")}</p>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p>{form.watch("email")}</p>
                          </div>
                          <div>
                            <Label>Mobile</Label>
                            <p>{form.watch("phone")}</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleNextSection("personal")}
                            className="col-span-2 mt-4 bg-[#B5D3D1] hover:bg-[#5D9297] text-[#1A3B47]"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Address Section */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection("address")}
                      >
                        <h2 className="text-2xl font-bold text-[#1A3B47]">
                          Delivery Address
                        </h2>
                        {activeSection === "address" ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </div>
                      {activeSection === "address" && (
                        <div className="mt-4">
                          {savedAddresses.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xl font-bold mb-2">
                                {selectedAddress?.locationType}
                              </div>
                              <h4 className="font-semibold text-md mb-1">
                                {`${selectedAddress?.streetNumber} ${selectedAddress?.streetName}, ${selectedAddress?.city}`}
                              </h4>
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setShowSavedAddresses(true)
                                  }}
                                  className="text-[#388A94] hover:underline mr-4"
                                >
                                  Change
                                </button>
                                <Popover>
                                  <PopoverTrigger>
                                    <ChevronRight className="cursor-pointer" />
                                  </PopoverTrigger>
                                  <PopoverContent className="p-4">
                                    <h4 className="font-bold mb-2">
                                      {selectedAddress?.locationType}
                                    </h4>
                                    <p>
                                      {selectedAddress?.streetNumber}{" "}
                                      {selectedAddress?.streetName}
                                    </p>
                                    <p>
                                      {selectedAddress?.city},{" "}
                                      {selectedAddress?.state}{" "}
                                      {selectedAddress?.postalCode}
                                    </p>
                                    <p>{selectedAddress?.country}</p>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setIsAddressDialogOpen(true)
                            }}
                            className="text-[#388A94] hover:underline"
                          >
                            Add New
                          </button>

                          <Dialog
                            open={isAddressDialogOpen}
                            onOpenChange={setIsAddressDialogOpen}
                          >
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                              </DialogHeader>
                              <ShippingAddress
                                onSubmit={handleAddNewAddress}
                                onCancel={() => (
                                  setIsAddressDialogOpen(false), fetchUserInfo()
                                )}
                              />
                            </DialogContent>
                          </Dialog>

                          {showSavedAddresses && (
                            <Dialog
                              open={showSavedAddresses}
                              onOpenChange={setShowSavedAddresses}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Saved Addresses</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {savedAddresses.map((address, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                                      onClick={() => {
                                        setSelectedAddress(address)
                                        Object.keys(address).forEach((key) => {
                                          if (key !== "default") {
                                            form.setValue(key, address[key])
                                          }
                                        })
                                        setShowSavedAddresses(false)
                                      }}
                                    >
                                      <div>
                                        <p className="font-semibold">
                                          {address.locationType}
                                        </p>
                                        <p>{`${address.streetNumber} ${address.streetName}, ${address.city}`}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              onClick={() => handleNextSection("address")}
                              className="bg-[#B5D3D1] hover:bg-[#5D9297] text-[#1A3B47]"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Section */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection("payment")}
                      >
                        <h2 className="text-2xl font-bold text-[#1A3B47]">
                          Payment
                        </h2>
                        {activeSection === "payment" ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </div>
                      {activeSection === "payment" && (
                        <div className="mt-4">
                          <RadioGroup
                            defaultValue={form.watch("paymentMethod")}
                            onValueChange={(value) =>
                              form.setValue("paymentMethod", value)
                            }
                          >
                            {savedCards.length > 0 && (
                              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                                <RadioGroupItem
                                  value="credit_card"
                                  id="credit_card"
                                />
                                <Label htmlFor="credit_card">
                                  {selectedCard?.cardType} (**** **** ****{" "}
                                  {selectedCard?.cardNumber.slice(-4)})
                                </Label>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setShowSavedCards(true)
                                  }}
                                  className="text-[#388A94] hover:underline ml-auto"
                                >
                                  Change
                                </button>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                              <RadioGroupItem
                                value="cash_on_delivery"
                                id="cash_on_delivery"
                              />
                              <Label htmlFor="cash_on_delivery">
                                Cash on Delivery
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                              <RadioGroupItem value="wallet" id="wallet" />
                              <Label htmlFor="wallet">Wallet</Label>
                            </div>
                          </RadioGroup>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setShowAddCardForm(true)
                            }}
                            className="text-[#388A94] hover:underline mt-4"
                          >
                            Add New Card
                          </button>

                          {showSavedCards && (
                            <Dialog
                              open={showSavedCards}
                              onOpenChange={setShowSavedCards}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Saved Cards</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {savedCards.map((card, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                                      onClick={() => {
                                        setSelectedCard(card)
                                        form.setValue(
                                          "paymentMethod",
                                          card.cardType === "Credit Card"
                                            ? "credit_card"
                                            : "debit_card"
                                        )
                                        form.setValue(
                                          "selectedCard",
                                          card.cardNumber
                                        )
                                        setShowSavedCards(false)
                                      }}
                                    >
                                      <div>
                                        <p className="font-semibold">
                                          {card.cardType}
                                        </p>
                                        <p>
                                          **** **** ****{" "}
                                          {card.cardNumber.slice(-4)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {showAddCardForm && (
                            <form
                              onSubmit={handleAddNewCard}
                              className="mt-4 border border-gray-300 rounded-md p-4 bg-white"
                            >
                              <h3 className="text-lg font-semibold mb-4">
                                Add New Card
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <Label htmlFor="cardNumber">
                                    Card Number
                                  </Label>
                                  <Input
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={cardDetails.cardNumber}
                                    onChange={handleCardInputChange}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="expiryDate">
                                    Expiry Date
                                  </Label>
                                  <Input
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={cardDetails.expiryDate}
                                    onChange={handleCardInputChange}
                                    placeholder="MM/YY"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cvv">CVV</Label>
                                  <Input
                                    id="cvv"
                                    name="cvv"
                                    value={cardDetails.cvv}
                                    onChange={handleCardInputChange}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label htmlFor="holderName">
                                    Card Holder Name
                                  </Label>
                                  <Input
                                    id="holderName"
                                    name="holderName"
                                    value={cardDetails.holderName}
                                    onChange={handleCardInputChange}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label htmlFor="cardType">Card Type</Label>
                                  <Select
                                    name="cardType"
                                    value={cardDetails.cardType}
                                    onValueChange={(value) =>
                                      handleCardInputChange({
                                        target: { name: "cardType", value },
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select card type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Credit Card">
                                        Credit Card
                                      </SelectItem>
                                      <SelectItem value="Debit Card">
                                        Debit Card
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddCardForm(false)
                                    resetCardDetails()
                                  }}
                                  className="mr-2"
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                  {isLoading ? "Processing..." : "Add Card"}
                                </Button>
                              </div>
                            </form>
                          )}
                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              onClick={() => handleNextSection("payment")}
                              className="bg-[#B5D3D1] hover:bg-[#5D9297] text-[#1A3B47]"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delivery Section */}
                    <div className="mb-6">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection("delivery")}
                      >
                        <h2 className="text-2xl font-bold text-[#1A3B47]">
                          Delivery
                        </h2>
                        {activeSection === "delivery" ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </div>
                      {activeSection === "delivery" && (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="deliveryType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Type</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={handleDeliveryTypeChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select delivery type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Standard">
                                        Standard Shipping (2–8 business days) -{" "}
                                        {formatPrice(2.99)}
                                      </SelectItem>
                                      <SelectItem value="Express">
                                        Express Shipping (1–3 business days) -{" "}
                                        {formatPrice(4.99)}
                                      </SelectItem>
                                      <SelectItem value="Next-Same">
                                        Next-Day/Same-Day Shipping -{" "}
                                        {formatPrice(6.99)}
                                      </SelectItem>
                                      <SelectItem value="International">
                                        International Shipping (7–21 business
                                        days) - {formatPrice(14.99)}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {estimatedDeliveryDate && (
                            <div className="mt-4">
                              <Label>Estimated Delivery Date</Label>
                              <p className="text-sm text-gray-600">
                                {format(estimatedDeliveryDate, "MMMM d, yyyy")}
                              </p>
                            </div>
                          )}
                          <FormField
                            control={form.control}
                            name="deliveryTime"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Delivery Time</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="morning">
                                        Morning (8 AM - 12 PM)
                                      </SelectItem>
                                      <SelectItem value="afternoon">
                                        Afternoon (12 PM - 4 PM)
                                      </SelectItem>
                                      <SelectItem value="evening">
                                        Evening (4 PM - 8 PM)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#1A3B47] hover:bg-[#388A94]"
                    >
                      Complete Purchase
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-1/3">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-[#1A3B47] mb-4">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <TooltipProvider key={index}>
                      <div className="flex justify-between">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() =>
                              navigate(`/product/${item?.product?._id}`)
                            }
                            className="text-black cursor-pointer hover:underline"
                          >
                            {item?.product?.name} x {item?.quantity}
                          </TooltipTrigger>
                          <TooltipContent className="w-48 p-2 text-sm whitespace-normal">
                            <p>
                              {item?.product?.description?.slice(0, 70)}
                              {item?.product?.description?.length > 70
                                ? "..."
                                : ""}
                            </p>
                            <div className="flex items-center pt-1">
                              <FaStar className="text-yellow-500" />
                              <span className="ml-1">
                                {item?.product?.rating.toFixed(1) || "N/A"}
                              </span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <span>{formatPrice(item?.totalPrice)}</span>
                      </div>
                    </TooltipProvider>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {formatPrice(
                        form.watch("deliveryType") === "Express"
                          ? 4.99
                          : form.watch("deliveryType") === "Next-Same"
                          ? 6.99
                          : form.watch("deliveryType") === "International"
                          ? 14.99
                          : 2.99
                      )}
                    </span>
                  </div>
                  {/* Promo Code Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Promo Code</h3>
                    <form
                      onSubmit={handlePromoSubmit}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-grow"
                      />
                      <Button type="submit">Apply</Button>
                    </form>
                    {promoError && (
                      <p className="text-red-500 mt-2">{promoError}</p>
                    )}
                    {promoDetails && (
                      <div className="mt-4 p-4 bg-green-100 rounded-md">
                        <p className="text-green-700">
                          Promo code applied: {promoDetails.percentOff}% off
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Valid until:{" "}
                          {format(
                            new Date(promoDetails.dateRange.end),
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  {promoDetails && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {estimatedDeliveryDate && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Estimated Delivery Date</span>
                      <span>
                        {format(estimatedDeliveryDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {formatPrice(
                          (promoDetails ? discountedTotal : totalAmount) +
                            (form.watch("deliveryType") === "Express"
                              ? 4.99
                              : form.watch("deliveryType") === "Next-Same"
                              ? 6.99
                              : form.watch("deliveryType") === "International"
                              ? 14.99
                              : 2.99)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {purchaseStatus === "success"
                ? "Purchase Successful!"
                : "Purchase Failed"}
            </DialogTitle>
          </DialogHeader>
          <p>
            {purchaseStatus === "success"
              ? "Your order has been placed successfully. Thank you for your purchase!"
              : "There was an error processing your purchase. Please try again or contact support."}
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsStatusDialogOpen(false)
                navigate("/")
              }}
              className="bg-[#5D9297] hover:bg-[#388A94]"
            >
              Go to Home
            </Button>

            <Button
              onClick={() => {
                setIsStatusDialogOpen(false)
                navigate("/all-products")
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