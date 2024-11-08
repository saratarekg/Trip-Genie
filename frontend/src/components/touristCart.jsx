import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Minus, Plus, Trash2, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "./popup";
import "@/styles/Popup.css";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountLoading, setTotalAmountLoading] = useState(true);
  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("");
  const [quantityError, setQuantityError] = useState(false);
  const [allPurchasesSuccessful, setAllPurchasesSuccessful] = useState(false);
  const [allPurchasesSuccessfulPopup, setAllPurchasesSuccessfulPopup] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [popupType, setPopupType] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [userRole, setUserRole] = useState("guest");
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencies, setCurrencies] = useState([]);

  const openSuccessPopup = (message) => {
    setPopupType("success");
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const openErrorPopup = (message) => {
    setPopupType("error");
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const isCheckoutDisabled = cartItems.some(
    (item) =>
      item?.product?.quantity === 0 || item?.quantity > item?.product?.quantity
  );

  const blueButtonStyle =
    "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300";

  const resetFields = () => {
    setPaymentMethod("");
    setDeliveryDate("");
    setDeliveryTime("");
    setDeliveryType("");
    setStreetName("");
    setStreetNumber("");
    setFloorUnit("");
    setState("");
    setCity("");
    setPostalCode("");
    setLandmark("");
    setLocationType("");
    setLocation("");
  };

  useEffect(() => {
    if (location) {
      console.log("Location updated:", location);
      handlePurchase();
    }
  }, [location]);

  useEffect(() => {
    if (allPurchasesSuccessful) {
      emptyCart();
    } else {
      console.error("Failed to complete purchase for some items.");
    }
  }, [allPurchasesSuccessful]);

  const calculateDeliveryCost = (type) => {
    switch (type) {
      case "Standard":
        return 2.99;
      case "Express":
        return 4.99;
      case "Next-Same":
        return 6.99;
      case "International":
        return 14.99;
      default:
        return 0;
    }
  };



  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/rates');
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/tourist/currencies', {
        headers: { Authorization: `Bearer ${Cookies.get('jwt')}` }
      });
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    if (role === 'tourist') {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currencyId = response.data.preferredCurrency;

        const response2 = await axios.get(`http://localhost:4000/tourist/getCurrency/${currencyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPreferredCurrency(response2.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
    fetchExchangeRates();
    fetchCurrencies();
    fetchCartItems();
  }, [fetchUserInfo, fetchExchangeRates, fetchCurrencies]);

  useEffect(() => {
    calculateTotalAmount();
  }, [cartItems, exchangeRates, userPreferredCurrency]);


  const fetchCartItems = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch("http://localhost:4000/tourist/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  }, []);

  
  const formatPrice = useCallback((price, productCurrency) => {
    if (userRole === 'tourist' && userPreferredCurrency) {
      const baseRate = exchangeRates[productCurrency] || 1;
      const targetRate = exchangeRates[userPreferredCurrency.code] || 1;
      const exchangedPrice = (price / baseRate) * targetRate;
      return `${userPreferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
    }
    const currency = currencies.find(c => c._id === productCurrency);
    return `${currency ? currency.symbol : '$'}${price.toFixed(2)}`;
  }, [userRole, userPreferredCurrency, exchangeRates, currencies]);

  const calculateTotalAmount = useCallback(() => {
    setTotalAmountLoading(true);
    let total = 0;
    for (const item of cartItems) {
      if (userRole === 'tourist' && userPreferredCurrency && userPreferredCurrency.code !== item.product?.currency) {
        const baseRate = exchangeRates[item.product?.currency] || 1;
        const targetRate = exchangeRates[userPreferredCurrency.code] || 1;
        total += (item.product?.price / baseRate) * targetRate * item.quantity;
      } else {
        total += item?.product?.price * item.quantity;
      }
    }
    setTotalAmount(total);
    setTotalAmountLoading(false);
  }, [cartItems, userRole, userPreferredCurrency, exchangeRates]);

  const emptyCart = async () => {
    try {
      setCartItems([]);
      setShowPurchaseConfirm(false);
      setPaymentMethod("");

      const token = Cookies.get("jwt");
      const emptyCartResponse = await fetch(
        "http://localhost:4000/tourist/empty/cart",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (emptyCartResponse.ok) {
        console.log("Cart emptied successfully.");
      } else {
        console.error("Failed to empty the cart.");
      }
    } catch (error) {
      console.error("Error emptying cart items:", error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/tourist/remove/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: productId }),
        }
      );
      if (response.ok) {
        setCartItems(
          cartItems.filter((item) => item.product._id !== productId)
        );
        openSuccessPopup("Item removed successfully!");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setActionError(error.message);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const token = Cookies.get("jwt");
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
      );
      if (response.ok) {
        const updatedItems = cartItems.map((item) => {
          if (item.product?._id === productId) {
            return {
              ...item,
              quantity: newQuantity,
              priceLoading: true,
            };
          }
          return item;
        });

        setCartItems(updatedItems);
        calculateTotalAmount();

        // Simulate a delay for price recalculation
        setTimeout(() => {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.product?._id === productId
                ? { ...item, priceLoading: false }
                : item
            )
          );
        }, 500);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setActionError(error.message);
    }
  };

  const handleCheckout = () => {
    setShowPurchaseConfirm(true);
  };

  const handlePurchase = async () => {
    try {
      const token = Cookies.get("jwt");

      const products = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const response = await fetch("http://localhost:4000/tourist/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products,
          totalAmount,
          paymentMethod: paymentMethod,
          shippingAddress: location,
          locationType: locationType,
          deliveryType: deliveryType,
          deliveryTime: deliveryTime,
          deliveryDate: deliveryDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Purchase failed:", errorData.message);
        setActionError(errorData.message);
        setAllPurchasesSuccessful(false);
        setAllPurchasesSuccessfulPopup(false);
      } else {
        setAllPurchasesSuccessful(true);
        setAllPurchasesSuccessfulPopup(true);
        console.log("Purchase successful for all items!");
      }
    } catch (error) {
      setActionError(error.message);
      console.error("Error making purchase:", error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <div className="container p-5">
        <Popup
          isOpen={popupOpen}
          onClose={closePopup}
          type={popupType}
          message={popupMessage}
        />
      </div>
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cartItems?.length === 0 ? (
        <p className="text-center text-gray-500 my-8">No items in cart</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.product?._id} className="flex flex-col border-b py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {console.log(item)}
                <img
                  src={item.product?.pictures[0]?.url}
                  alt={item?.product?.name || "Product"}
                  className="w-20 h-20 object-cover mr-4 cursor-pointer"
                  onClick={() => handleProductClick(item.product._id)}
                />
                <div>
                  {item?.product ? (
                    <>
                      <h2
                        className="text-lg font-semibold cursor-pointer hover:underline"
                        onClick={() => handleProductClick(item.product._id)}
                      >
                        {item?.product?.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {item.product.description?.length > 150
                          ? `${item.product.description?.slice(0, 150)}...`
                          : item.product.description}
                      </p>
                    </>
                  ) : (
                    <p>Product is not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() =>
                      handleQuantityChange(
                        item?.product?._id,
                        Math.max(1, item?.quantity - 1)
                      )
                    }
                    className={`px-2 py-1 rounded ${blueButtonStyle}`}
                    disabled={
                      item?.quantity <= 1 || item?.product?.quantity === 0
                    }
                    variant={
                      item?.quantity <= 1 || item?.product?.quantity === 0
                        ? "ghost"
                        : "default"
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1 bg-gray-100 rounded">
                    {item?.quantity}
                  </span>
                  <Button
                    onClick={() =>
                      handleQuantityChange(
                        item?.product?._id,
                        item?.quantity + 1
                      )
                    }
                    className={`px-2 py-1 rounded ${blueButtonStyle}`}
                    disabled={item?.quantity >= item?.product?.quantity}
                    variant={
                      item?.quantity >= item?.product?.quantity
                        ? "ghost"
                        : "default"
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="ml-4 font-semibold w-24 text-right">
                  {item.priceLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
                  ) : (
                    formatPrice(
                      item?.product?.price * item?.quantity,
                      item?.product?.currency
                    )
                  )}
                </span>
                <Button
                  onClick={() => handleRemoveItem(item?.product?._id)}
                  className="ml-4"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              {item?.product?.quantity === 0 && (
                <p className="text-red-500 text-sm">
                  This item is out of stock. Please remove it to proceed with
                  checkout.
                </p>
              )}
              {item?.quantity > item?.product?.quantity &&
                item?.product?.quantity !== 0 && (
                  <p className="text-red-500 text-sm">
                    Only {item?.product?.quantity} left in stock. Please adjust
                    the quantity.
                  </p>
                )}
            </div>
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-xl font-bold">
            Total:{" "}
            {totalAmountLoading ? (
              <span className="animate-pulse bg-gray-200 h-6 w-32 inline-block align-middle rounded"></span>
            ) : (
              formatPrice(
                totalAmount,
                userPreferredCurrency ? userPreferredCurrency.code : "USD"
              )
            )}
          </div>
          <Button
            className="bg-[#000034]"
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
          >
            Checkout
          </Button>
        </div>
      )}
      {cartItems.some((item) => item?.product?.quantity === 0) && (
        <p className="text-red-500 mt-4">
          Some items in your cart are out of stock. Please remove them to
          proceed with checkout.
        </p>
      )}
      {cartItems.some((item) => item?.quantity > item?.product?.quantity) && (
        <p className="text-red-500 mt-4">
          Some items in your cart exceed available stock. Please adjust
          quantities to proceed with checkout.
        </p>
      )}

      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              Confirm Purchase
            </DialogTitle>
          </DialogHeader>

          <div className="my-4">
            <h2 className="text-2xl font-bold">Product Details</h2>

            {cartItems.map((item, index) => (
              <div key={index} className="my-4">
                <p className="text-xl font-semibold">{item?.product?.name}</p>
                <p className="text-lg">
                  Quantity:
                  <input
                    type="number"
                    value={item?.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value > item?.product?.quantity || value < 1) {
                        setQuantityError(true);
                      } else {
                        setQuantityError(false);
                        handleQuantityChange(item?.product?._id, value);
                      }
                    }}
                    className={`w-20 ml-2 border rounded-md ${
                      quantityError ? "border-red-500" : ""
                    }`}
                    min="1"
                    max={item?.product?.quantity}
                  />
                </p>
                {quantityError && (
                  <p className="text-red-500 text-sm mt-1">
                    Unavailable amount, max is: {item?.product?.quantity}
                  </p>
                )}
                <p className="text-xl">
                  Price:{" "}
                  {item?.priceLoading ? (
                    <span className="animate-pulse bg-gray-200 h-6 w-24 inline-block align-middle rounded"></span>
                  ) : (
                    formatPrice(
                      item?.product?.price * item?.quantity,
                      item?.product?.currency
                    )
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="my-4">
            <h2 className="text-2xl font-bold">Payment & Delivery</h2>

            <div className="my-4">
              <label
                htmlFor="deliveryDate"
                className="block text-lg font-medium"
              >
                Delivery Date
              </label>
              <input
                type="date"
                id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div className="my-4">
              <label
                htmlFor="deliveryTime"
                className="block text-lg font-medium"
              >
                Delivery Time
              </label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning (8 AM - 12 PM)
                  </SelectItem>
                  <SelectItem value="midday">Midday (12 PM - 3 PM)</SelectItem>
                  <SelectItem value="afternoon">
                    Afternoon (3 PM - 6 PM)
                  </SelectItem>
                  <SelectItem value="night">Night (6 PM - 9 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="my-4">
              <label
                htmlFor="deliveryType"
                className="block text-lg font-medium"
              >
                Delivery Type
              </label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">
                    Standard Shipping (5-7 days) -{" "}
                    {formatPrice(
                      2.99,
                      userPreferredCurrency ? userPreferredCurrency.code : "USD"
                    )}
                  </SelectItem>
                  <SelectItem value="Express">
                    Express Shipping (2-3 days) -{" "}
                    {formatPrice(
                      4.99,
                      userPreferredCurrency ? userPreferredCurrency.code : "USD"
                    )}
                  </SelectItem>
                  <SelectItem value="Next-Same">
                    Next/Same Day Shipping -{" "}
                    {formatPrice(
                      6.99,
                      userPreferredCurrency ? userPreferredCurrency.code : "USD"
                    )}
                  </SelectItem>
                  <SelectItem value="International">
                    International Shipping -{" "}
                    {formatPrice(
                      14.99,
                      userPreferredCurrency ? userPreferredCurrency.code : "USD"
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="my-4">
              <label
                htmlFor="paymentMethod"
                className="block text-lg font-medium"
              >
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="cash_on_delivery">
                    Cash on Delivery
                  </SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="my-4">
            <h2 className="text-2xl font-bold">Address Details</h2>

            <div className="my-4">
              <label htmlFor="streetName" className="block text-lg font-medium">
                Street Name
              </label>
              <input
                type="text"
                id="streetName"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter street name"
              />
            </div>

            <div className="my-4">
              <label
                htmlFor="streetNumber"
                className="block text-lg font-medium"
              >
                Street Number
              </label>
              <input
                type="text"
                id="streetNumber"
                value={streetNumber}
                onChange={(e) => setStreetNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter street number"
              />
            </div>

            <div className="my-4">
              <label htmlFor="floorUnit" className="block text-lg font-medium">
                Floor/Unit
              </label>
              <input
                type="text"
                id="floorUnit"
                value={floorUnit}
                onChange={(e) => setFloorUnit(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter floor/unit (optional)"
              />
            </div>

            <div className="my-4">
              <label htmlFor="city" className="block text-lg font-medium">
                City
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter city"
              />
            </div>

            <div className="my-4">
              <label htmlFor="state" className="block text-lg font-medium">
                State/Province/Region
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter state"
              />
            </div>

            <div className="my-4">
              <label htmlFor="country" className="block text-lg font-medium">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter country"
              />
            </div>

            <div className="my-4">
              <label htmlFor="postalCode" className="block text-lg font-medium">
                Postal/ZIP Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter postal code (Optional)"
              />
            </div>

            <div className="my-4">
              <label htmlFor="landmark" className="block text-lg font-medium">
                Landmark/Additional Info
              </label>
              <input
                type="text"
                id="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter landmark or additional info (optional)"
              />
            </div>

            <div className="my-4">
              <label
                htmlFor="locationType"
                className="block text-lg font-medium"
              >
                Location Type
              </label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="apartment">Apartment/Condo</SelectItem>
                  <SelectItem value="friend_family">
                    Friend/Family's Address
                  </SelectItem>
                  <SelectItem value="po_box">PO Box</SelectItem>
                  <SelectItem value="office">Office/Business</SelectItem>
                  <SelectItem value="pickup_point">Pickup Point</SelectItem>
                  <SelectItem value="vacation">
                    Vacation/Temporary Address
                  </SelectItem>
                  <SelectItem value="school">School/University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="my-4 border-t border-gray-300 pt-4">
            <h2 className="text-2xl font-bold">Total Price</h2>
            <div className="flex flex-col">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between mt-2">
                  <p className="text-lg">
                    {item?.product?.name} x {item?.quantity}
                  </p>
                  <p className="text-lg">
                    {item.priceLoading ? (
                      <span className="animate-pulse bg-gray-200 h-6 w-24 inline-block align-middle rounded"></span>
                    ) : (
                      formatPrice(
                        item?.product?.price * item?.quantity,
                        item?.product?.currency
                      )
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-lg">Delivery Cost:</p>
              <p className="text-lg">
                {formatPrice(
                  calculateDeliveryCost(deliveryType),
                  userPreferredCurrency ? userPreferredCurrency.code : "USD"
                )}
              </p>
            </div>
            <div className="flex justify-between mt-4 font-bold">
              <p className="text-lg">Total Price:</p>
              <p className="text-lg">
                {totalAmountLoading ? (
                  <span className="animate-pulse bg-gray-200 h-6 w-32 inline-block align-middle rounded"></span>
                ) : (
                  formatPrice(
                    totalAmount + calculateDeliveryCost(deliveryType),
                    userPreferredCurrency ? userPreferredCurrency.code : "USD"
                  )
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPurchaseConfirm(false);
                resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const fullLocation =
                  "Street Name: " +
                  streetName +
                  ", Street Number: " +
                  streetNumber +
                  (floorUnit ? ", Floor/Unit: " + floorUnit : "") +
                  ", State: " +
                  state +
                  ", City: " +
                  city +
                  ", Postal Code: " +
                  postalCode +
                  (landmark ? ", Landmark: " + landmark : "");

                setLocation(fullLocation);
                setTimeout(() => {
                  resetFields();
                }, 100);
                setShowPurchaseConfirm(false);
              }}
              disabled={
                !paymentMethod ||
                !deliveryDate ||
                !deliveryTime ||
                !streetName ||
                !streetNumber ||
                !state ||
                !city ||
                quantityError ||
                !locationType
              }
            >
              Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={allPurchasesSuccessfulPopup}
        onOpenChange={() => setAllPurchasesSuccessfulPopup(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Success
            </DialogTitle>
            <DialogDescription>
              Purchase completed successfully!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setAllPurchasesSuccessfulPopup(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={actionError !== null}
        onOpenChange={() => setActionError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Error
            </DialogTitle>
            <DialogDescription>{actionError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setActionError(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingCart;
