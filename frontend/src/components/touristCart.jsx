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
import { Minus, Plus, Trash2, X, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
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
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [showProductList, setShowProductList] = useState(false);


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

  const emptyCart = useCallback(async () => {
    try {
      setCartItems([]);
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
        throw new Error("Failed to empty the cart");
      }
    } catch (error) {
      console.error("Error emptying cart items:", error);
      setActionError("Failed to empty the cart. Please try again.");
    }
  }, []);

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
          paymentMethod,
          shippingAddress: location,
          locationType,
          deliveryType,
          deliveryTime,
          deliveryDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Purchase failed");
      }

      await emptyCart();

      setAllPurchasesSuccessful(true);
      setAllPurchasesSuccessfulPopup(true);
      console.log("Purchase successful for all items!");
    } catch (error) {
      setActionError(error.message);
      setAllPurchasesSuccessful(false);
      setAllPurchasesSuccessfulPopup(false);
      console.error("Error making purchase:", error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
   
    <div className="flex h-screen ml-10 ">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 flex justify-between items-center">
          Shopping Cart
          <span className="text-xl font-normal">({cartItems.length} items)</span>
        </h1>
        {cartItems?.length === 0 ? (
          <p className="text-center text-gray-500 my-8">No items in cart</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.product?._id} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center">
                <img
                  src={item.product?.pictures[0]?.url}
                  alt={item?.product?.name || "Product"}
                  className="w-20 h-20 object-cover mr-4 cursor-pointer"
                  onClick={() => handleProductClick(item.product._id)}
                />
                <div>
                  <h2 className="text-lg font-semibold cursor-pointer hover:underline" onClick={() => handleProductClick(item.product._id)}>
                    {item?.product?.name}
                  </h2>
                  <p className="text-sm text-gray-600 max-w-xs overflow-hidden text-ellipsis whitespace-normal break-words">
                    {item.product.description?.length > 50 ? `${item.product.description?.slice(0, 50)}...` : item.product.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center space-x-2 rounded-full">
                  <Button
                    onClick={() => handleQuantityChange(item?.product?._id, Math.max(1, item?.quantity - 1))}
                    className="p-2 h-8 w-8 rounded-full bg-[#B5D3D1] flex items-center justify-center hover:bg-[#9FBFBB] transition duration-300 ease-in-out"
                    disabled={item?.quantity <= 1 || item?.product?.quantity === 0}
                  >
                    <Minus className="h-4 w-4 text-[#388A94] font-semibold" />
                  </Button>
                  <span className="px-4 py-1 text-xl">{item?.quantity}</span>
                  <Button
                    onClick={() => handleQuantityChange(item?.product?._id, item?.quantity + 1)}
                    className="p-2 h-8 w-8 rounded-full border bg-[#B5D3D1] flex items-center justify-center hover:bg-[#9FBFBB] transition duration-300 ease-in-out"
                    disabled={item?.quantity >= item?.product?.quantity}
                  >
                    <Plus className="h-4 w-4 text-[#388A94] font-semibold" />
                  </Button>
                </div>
                <span className="ml-4 font-semibold w-24 text-right text-xl">
                  {item.priceLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-full rounded-full"></div>
                  ) : (
                    formatPrice(item?.product?.price * item?.quantity, item?.product?.currency)
                  )}
                </span>
                <Button
                  onClick={() => handleRemoveItem(item?.product?._id)}
                  className="p-2 w-8 h-8 ml-4 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="w-80 bg-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        <div className="mb-4 w-full">
        <span className=" font-bold text-xl">Products</span>

            <div className="mt-2 space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-base">
                  <span>{item?.product?.name} x {item?.quantity}</span>
                  <span>{formatPrice(item?.product?.price * item?.quantity, item?.product?.currency)}</span>
                </div>
              ))}
            </div>
          
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-bold text-xl">
            <span>Total:</span>
            <span>
              {totalAmountLoading ? (
                <span className="animate-pulse bg-gray-200 h-6 w-24 inline-block align-middle rounded"></span>
              ) : (
                formatPrice(totalAmount, userPreferredCurrency ? userPreferredCurrency.code : "USD")
              )}
            </span>
          </div>
        </div>
        <Button
          className="w-full mt-6 bg-[#1A3B47] text-white py-3 text-lg"
          onClick={() => navigate("/checkout2")}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>

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
          </DialogHeader>
          <p>{actionError}</p>
          <DialogFooter>
            <Button variant="default" onClick={() => setActionError(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};
export default ShoppingCart;
