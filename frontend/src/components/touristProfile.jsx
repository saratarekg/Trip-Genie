'use client'

import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Flag from 'react-world-flags'
import Cookies from "js-cookie"
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'
import { Activity, ShoppingCart, Plane, Calendar, Wallet, Award, Bell, ShoppingBasket, Bus, Map, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Modal } from "@/components/Modal"
import { ImageCropper } from "@/components/ImageCropper"
import ShippingAddress from "@/pages/AddShippingAddress"
import Popup from "@/components/popup"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const convertUrlToBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

const getTransactionIcon = (details) => {
  if (details.toLowerCase().includes('activity')) return <Activity className="w-6 h-6" />;
  if (details.toLowerCase().includes('itinerary')) return <Map  className="w-6 h-6" />;
  if (details.toLowerCase().includes('transportation')) return <Bus className="w-6 h-6" />;
  if (details.toLowerCase().includes('order')) return <ShoppingBasket  className="w-6 h-6" />;
  return <Wallet className="w-6 h-6" />;
};

const groupTransactionsByDate = (transactions) => {
  const grouped = {};
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    let key;
    if (isToday(date)) key = 'Today';
    else if (isThisWeek(date)) key = 'This Week';
    else if (isThisMonth(date)) key = 'This Month';
    else if (isThisYear(date)) key = 'This Year';
    else key = format(date, 'MMMM yyyy');

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(transaction);
  });
  return grouped;
};

const phoneValidator = (value) => {
  const phoneNumber = parsePhoneNumberFromString("+" + value);
  return phoneNumber ? phoneNumber.isValid() : false;
};

export function TouristProfileComponent() {
  const navigate = useNavigate();

  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTourist, setEditedTourist] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});
  const [nationalities, setNationalities] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(null);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [base64Image, setBase64Image] = useState(null);
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [activeTab, setActiveTab] = useState("wallet");

  const getUserRole = () => Cookies.get("role") || "guest";

  const convertCurrency = useCallback((amount, fromCurrency, toCurrency) => {
    console.log(amount, fromCurrency, toCurrency, rates);
    if (typeof fromCurrency === "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency];
    }
    else if (typeof fromCurrency !== "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency.code]) * rates[toCurrency];
    }
    else if (typeof fromCurrency !== "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency?.code]) * rates[toCurrency?.code];
    }
   else if (typeof fromCurrency === "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency?.code];
    }
   else if (!rates[fromCurrency] || !rates[toCurrency.code]) return amount;
    return (amount / rates[fromCurrency]) * rates[toCurrency?.code];
  }, [rates]);

  const formatCurrency = useCallback((amount, currency) => {
    console.log(amount,currency);
    const currencyInfo = currencies.find((c) => c.code === currencyCode);
    return `${currencyInfo ? currencyInfo.symbol : ""}${amount.toFixed(2)}`;
  }, [currencies]);

  useEffect(() => {
    const fetchTouristProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        response.data.mobile = response.data.mobile.slice(1);
        setTourist(response.data);
        setEditedTourist(response.data);
        setSelectedImage(response.data.profilePicture);

        if (response.data.profilePicture && response.data.profilePicture.url) {
          convertUrlToBase64(response.data.profilePicture.url).then((res) => {
            setBase64Image(res);
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTouristProfile();
  }, []);

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/nationalities"
        );
        setNationalities(response.data);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
      }
    };
    fetchNationalities();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "wallet") {
        try {
          const token = Cookies.get("jwt");
          const [ratesResponse, currenciesResponse] = await Promise.all([
            axios.get("http://localhost:4000/rates", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:4000/tourist/currencies", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setRates(ratesResponse.data.rates);
          setCurrencies(currenciesResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [activeTab]);

  const openModal = () => {
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const fetchExchangeRate = useCallback(async () => {
    if (tourist) {
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(`http://localhost:4000/tourist/populate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: "67140446ee157ee4f239d523",
            target: tourist.preferredCurrency,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setExchangeRate(data.conversion_rate);
        } else {
          console.error("Error in fetching exchange rate:", data.message);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    }
  }, [tourist]);

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/tourist/getCurrency/${tourist.preferredCurrency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrencyCode(response.data.code);
      setCurrencySymbol(response.data.symbol);
    } catch (error) {
      console.error("Error fetching currency symbol:", error);
    }
  }, [tourist]);

  const formatWallet = (price) => {
    fetchExchangeRate();
    getCurrencySymbol();
    if (tourist && exchangeRate && currencySymbol) {
      const exchangedPrice = price * exchangeRate;
      return `${currencySymbol}${exchangedPrice.toFixed(2)}`;
    }
  };

  const handleUpdateClick = () => {
    setShowModal(true);
    setDropdownOpen(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalOpen(false);
    setImageModalOpen(false);
  };

  const handleImageCropped = (newImage) => {
    setNewImage(newImage);
  };

  const handleFirstSave = () => {
    setSelectedImage(newImage);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } =
      e && e.target ? e.target : { name: "mobile", value: e };
    setEditedTourist((prev) => ({ ...prev, [name]: value }));
    setValidationMessages((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNationalityChange = (value) => {
    setEditedTourist((prev) => ({ ...prev, nationality: value }));
    setValidationMessages((prev) => ({ ...prev, nationality: "" }));
  };

  const handleDiscard = () => {
    setEditedTourist(tourist);
    setSelectedImage(tourist.profilePicture)
    setDropdownOpen(false);
    setIsEditing(false);
    setValidationMessages({});

  };

  const validateFields = () => {
    const { email, mobile, nationality, jobOrStudent, fname, lname } = editedTourist;
    const messages = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      messages.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      messages.email = "Invalid email format.";
    }
    if (!mobile) {
      messages.mobile = "Phone number is required.";
    } else if (!phoneValidator(mobile)) {
      messages.mobile = "Invalid phone number.";
    }
    if (!nationality) messages.nationality = "Nationality is required.";
    if (!jobOrStudent) messages.jobOrStudent = "Occupation is required.";
    if (!fname) messages.fname = "First name is required.";
    if (!lname) messages.lname = "Last name is required.";

    setValidationMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const finalTourist = { ...editedTourist };
      finalTourist.mobile = "+" + editedTourist.mobile;
      finalTourist.fname = editedTourist.fname;
      finalTourist.lname = editedTourist.lname;

      const token = Cookies.get("jwt");
      const role = getUserRole();
      const api = `http://localhost:4000/${role}`;
      finalTourist.profilePicture = selectedImage;
      setDropdownOpen(false);

      const response = await axios.put(api, finalTourist, {
        headers: { Authorization: `Bearer ${token}` },
      });
      response.data.tourist.mobile = response.data.tourist.mobile.slice(1);

      if (response.status === 200) {
        setTourist(response.data.tourist);
        setIsEditing(false);
        setError("");
        setValidationMessages({});
      }
    } catch (err) {
      if (err.response?.data?.message === "Email already exists") {
        setValidationMessages({ email: "Email already exists" });
      } else {
        setError(err.message);
      }
    }
  };

  const handleRedeemPoints = async () => {
    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const api = `http://localhost:4000/${role}/redeem-points`;
      const response = await axios.post(
        api,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTourist((prevTourist) => ({
        ...prevTourist,
        wallet: response.data.walletBalance,
        loyaltyPoints: response.data.remainingPoints,
      }));

      return response.data;
    } catch (error) {
      console.error("Error redeeming points:", error);
      throw new Error(
        error.response?.data?.error ||
          "Failed to redeem points. Please try again."
      );
    }
  };

  const RedeemPoints = ({ user, onRedeemPoints }) => {
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState(null);
    const [redeemSuccess, setRedeemSuccess] = useState(null);
    const [preferredCurrency, setPreferredCurrency] = useState("USD");
  
    useEffect(() => {
      const fetchUserInfo = async () => {
        const role = Cookies.get("role") || "guest";
        if (role === "tourist") {
          try {
            const token = Cookies.get("jwt");
            if (!token) {
              console.error("No JWT token found");
              return;
            }
const response = await axios.get("http://localhost:4000/tourist/", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const currencyId = response.data.preferredCurrency;
    
            if (currencyId) {
              const response2 = await axios.get(
                `http://localhost:4000/tourist/getCurrency/${currencyId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setPreferredCurrency(response2.data);
            } else {
              console.error("No preferred currency found for user");
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      };
      fetchUserInfo();
    }, []);
  
    const convertedWalletAmount = convertCurrency(
      user.wallet,
      "USD",
      preferredCurrency
    );
    const pointsValueInEGP = user.loyaltyPoints / 100;
    const pointsValueInUSD = convertCurrency(pointsValueInEGP, "EGP", "USD");
    const pointsValueInPreferredCurrency = convertCurrency(
      pointsValueInUSD,
      "USD",
      preferredCurrency
    );
  
    const handleRedeemClick = async () => {
      setIsRedeeming(true);
      setRedeemError(null);
      setRedeemSuccess(null);
  
      try {
        await onRedeemPoints(user.loyaltyPoints);
        setRedeemSuccess(`Successfully redeemed ${user.loyaltyPoints} points`);
      } catch (error) {
        setRedeemError(
          error.message || "An error occurred while redeeming points"
        );
      } finally {
        setIsRedeeming(false);
      }
    };
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Redeem Loyalty Points</CardTitle>
          <CardDescription>Convert your loyalty points into wallet balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Available Wallet Balance:</span>
            <span className="text-lg font-bold text-[#388A94]">
              {formatCurrency(convertedWalletAmount, preferredCurrency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Loyalty Points:</span>
            <span className="text-lg font-bold text-[#1A3B47]">
              {(user.loyaltyPoints).toFixed(2)} points
            </span>
          </div>
          <Button
            onClick={handleRedeemClick}
            disabled={isRedeeming || user.loyaltyPoints === 0}
            className="w-full text-base text-[#388A94] bg-gray-200 hover:bg-gray-300"
          >
            {isRedeeming
              ? "Redeeming..."
              : `Redeem Points for ${formatCurrency(
                  pointsValueInPreferredCurrency,
                  preferredCurrency
                )}`}
          </Button>
        </CardContent>
        <CardFooter>
          {redeemError && (
            <p className="text-red-500 text-sm">{redeemError}</p>
          )}
          {redeemSuccess && (
            <p className="text-green-500 text-sm">{redeemSuccess}</p>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  const CurrencyApp = ({ user }) => {
    const [currencies, setCurrencies] = useState([]);
    const [preferredCurrency, setPreferredCurrency] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState("");
  
    const fetchPreferredCurrencyCode = async () => {
      try {
        const token = Cookies.get("jwt");
        const codeResponse = await axios.get(
          "http://localhost:4000/tourist/currencies/idd",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const preferredCurrencyCode = codeResponse.data;
        console.log("Preferred Currency Code:", preferredCurrencyCode);

        const currencyResponse = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${preferredCurrencyCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPreferredCurrency(currencyResponse.data);
      } catch (error) {
        console.error("Error fetching preferred currency details:", error);
      }
    };
  
    useEffect(() => {
      const fetchSupportedCurrencies = async () => {
        try {
          const token = Cookies.get("jwt");
          const response = await axios.get(
            "http://localhost:4000/tourist/currencies",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCurrencies(response.data);
        } catch (error) {
          console.error("Error fetching supported currencies:", error);
        }
      };

      fetchSupportedCurrencies();
      fetchPreferredCurrencyCode();
    }, [user]);
  
    const handleSetPreferredCurrency = async () => {
      try {
        const token = Cookies.get("jwt");
        await axios.post(
          "http://localhost:4000/tourist/currencies/set",
          { currencyId: selectedCurrency },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        openSuccessPopup("Preferred currency set successfully!");

        fetchPreferredCurrencyCode();
      } catch (error) {
        console.error("Error setting preferred currency:", error);
        openErrorPopup(error);
      }
    };
  
    const [popupType, setPopupType] = useState("");
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
  
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
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Preferred Currency</CardTitle>
          <CardDescription>
            {preferredCurrency
              ? `Current: ${preferredCurrency.name} (${preferredCurrency.code})`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency-select">Select New Preferred Currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) => setSelectedCurrency(value)}
              >
                <SelectTrigger id="currency-select">
                  <SelectValue placeholder="Choose Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency._id} value={currency._id}>
                      {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSetPreferredCurrency}
              disabled={!selectedCurrency}
              className="w-full bg-[#388A94] hover:bg-[#2e6b77]"
            >
              Set Preferred Currency
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getDefaultAddress = () => {
    const defaultAddress = tourist.shippingAddresses.find(addr => addr.default);
    return defaultAddress
      ? {
          streetName: defaultAddress.streetName,
          city: defaultAddress.city,
          postalCode: defaultAddress.postalCode,
        }
      : null;
  };

  const getBadgeColor = () => {
    switch (tourist.loyaltyBadge) {
      case "Bronze":
        return "bg-amber-600";
      case "Silver":
        return "bg-gray-400";
      case "Gold":
        return "bg-yellow-400";
      default:
        return "bg-gray-200";
    }
  };

  const CustomFlag = ({ countryCode }) => {
    return (
      <Flag
        code={countryCode}
        style={{
          width: 25,
          height: 17,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      />
    );
  };

  const [notifications, setNotifications] = useState([]);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkUnseenNotifications();
    fetchNotifications();
  }, []);


  const checkUnseenNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/tourist/unseen-notifications`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
      setHasUnseenNotifications(response.data.hasUnseen);
    } catch (error) {
      console.error("Error checking unseen notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/tourist/notifications`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data.slice(0, 5));
      } else if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsSeen = async () => {
    try {
      await axios.post(
        `http://localhost:4000/tourist/mark-notifications-seen`,
        {},
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          seen: true,
        }))
      );
      setHasUnseenNotifications(false);
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!tourist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No tourist profile information is available.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
    <h1 className="text-3xl font-bold mb-2">My Account</h1>
    <p className="text-sm text-gray-500 mb-6">Settings / Account</p>
    
      <div className="grid grid-cols-12 gap-6">
        {/* Merged Profile Picture and Info Card - 8 columns */}
        <Card className="col-span-7">
  <CardContent className="py-6">
  <div className="flex items-center justify-center">
      {/* Profile Picture Section */}
      <div className="w-1/3 flex flex-col items-center">
        <div className="relative mb-4">
          <button
            className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center"
            onClick={toggleDropdown}
            disabled={!selectedImage && !isEditing}
          >
            {selectedImage ? (
              <img
                src={selectedImage.url || selectedImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
            {isEditing && (
              <div className="h-24 w-24 absolute bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <span className="text-white text-xs text-center">
                  Edit Profile Picture
                </span>
              </div>
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
              <ul className="py-2">
                {selectedImage && (
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center"
                    onClick={() => {
                      setIsImageViewerOpen(true);
                      setDropdownOpen(false);
                    }}
                  >
                    View
                  </li>
                )}
                {isEditing && (
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center"
                    onClick={handleUpdateClick}
                  >
                    Update
                  </li>
                )}
                {isEditing && selectedImage && (
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 text-center"
                    onClick={() => {
                      setSelectedImage(null);
                      setDropdownOpen(false);
                    }}
                  >
                    Delete
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold">{tourist.username}</h2>
            <div
              className={`w-7 h-7 flex items-center justify-center rounded-full ${getBadgeColor()}`}
            >
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{tourist.email}</p>
        </div>
        {isEditing ? (
          <div className="flex flex-col space-y-2 w-full max-w-[200px]">
            <Button
              onClick={handleUpdate}
              className="w-full bg-[#388A94] hover:bg-[#2e6b77]"
            >
              Update
            </Button>
            <Button
              onClick={handleDiscard}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full max-w-[200px] bg-[#1A3B47]"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Vertical Separator */}
      <div className="border-r border-gray-200 h-[300px] mx-8"></div>

      {/* Profile Info Section */}
      <div className="w-2/3 pl-4 space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">First Name</p>
            {isEditing ? (
              <div>
                <Input
                  type="text"
                  name="fname"
                  value={editedTourist.fname}
                  onChange={handleInputChange}
                  className={validationMessages.fname ? "border-red-500" : ""}
                />
                {validationMessages.fname && (
                  <p className="text-red-500 text-xs mt-1">{validationMessages.fname}</p>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium">{tourist.fname}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Name</p>
            {isEditing ? (
              <div>
              <Input
                type="text"
                name="lname"
                value={editedTourist.lname}
                onChange={handleInputChange}
                className={validationMessages.lname ? "border-red-500" : ""}
              />
               {validationMessages.lname && (
                  <p className="text-red-500 text-xs mt-1">{validationMessages.lname}</p>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium">{tourist.lname}</p>
            )}
          </div>
         
        </div>

        <Separator />

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Street Address</p>
            <p className="text-sm font-medium">
              {getDefaultAddress()?.streetName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">City</p>
            <p className="text-sm font-medium">{getDefaultAddress()?.city || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ZIP Code</p>
            <p className="text-sm font-medium">
              {getDefaultAddress()?.postalCode || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-4">
  {/* Nationality field spans two columns */}
  <div className="col-span-2">
    <p className="text-xs text-gray-500">Nationality</p>
    {isEditing ? (
      <Select onValueChange={handleNationalityChange}>
        <SelectTrigger
          className={validationMessages.nationality ? "border-red-500" : ""}
        >
          <SelectValue placeholder={tourist.nationality.name} />
        </SelectTrigger>
        <SelectContent>
          {nationalities.map((nat) => (
            <SelectItem key={nat._id} value={nat._id}>
              <div className="flex items-center gap-2">
                <Flag
                  code={nat.countryCode}
                  style={{
                    width: 25,
                    height: 17,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                />
                {nat.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <p className="text-sm font-medium">{tourist.nationality.name}</p>
    )}
  </div>

  {/* Occupation field takes one column */}
  <div>
    <p className="text-xs text-gray-500">Occupation</p>
    {isEditing ? (
      <div>
      <Input
        type="text"
        name="jobOrStudent"
        value={editedTourist.jobOrStudent}
        onChange={handleInputChange}
        className={validationMessages.jobOrStudent ? "border-red-500" : ""}
      />
       {validationMessages.jobOrStudent && (
                  <p className="text-red-500 text-xs mt-1">{validationMessages.jobOrStudent}</p>
                )}
      </div>
    ) : (
      <p className="text-sm font-medium">
        {tourist.jobOrStudent || "Not Specified"}
      </p>
    )}
  </div>
</div>

{/* Separator */}
<Separator className="my-4" />

{/* Row 4 (Phone Number and Register Date) */}
<div className="grid grid-cols-3 gap-4">
  {/* Phone Number spans two columns */}
  <div className="col-span-2">
  <p className="text-xs text-gray-500">Phone Number</p>
  {isEditing ? (
  <div className="relative">
   <PhoneInput
          country="eg"
          value={editedTourist.mobile}
          onChange={(value) =>
            handleInputChange({ target: { name: 'mobile', value } })
          }
          inputProps={{
            name: 'mobile',
            required: true,
            className: `w-full pt-2 pb-2 pl-11 ${validationMessages.mobile ? 'border-red-500' : 'border-gray-300'}`,
          }}
          containerClass="w-full"
          disableDropdown={false}  // Ensures the dropdown is visible
          // Use a custom flag component for the country code dropdown
          customFlagComponent={CustomFlag}
        />
        {validationMessages.mobile && (
          <span className="text-red-500 text-xs">{validationMessages.mobile}</span>
        )}
      </div>

  ) : (
    <p className="text-sm font-medium">+{tourist.mobile}</p>
  )}
</div>


  {/* Register Date */}
  <div>
            <p className="text-xs text-gray-500">Birthday</p>
            <p className="text-sm font-medium">
              {new Date(tourist.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
</div>


        {/* Edit Button below email */}
        
      </div>
    </div>
  </CardContent>
</Card>




         {/* Shipping Addresses - 4 columns */}
         <div className="col-span-5">
          <ShippingAddress addresses={tourist.shippingAddresses} />
        </div>

        {/* Tabs Section - spans 8 columns */}
        <div className="col-span-8">
          <Tabs defaultValue="wallet" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wallet">View Wallet Balance</TabsTrigger>
              <TabsTrigger value="currency">Change Currency</TabsTrigger>
              <TabsTrigger value="points">Redeem Points</TabsTrigger>
            </TabsList>
            <TabsContent value="wallet">
  <Card>
    <CardContent className="pt-6">
      {/* Current Balance */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Current Balance</span>
        </div>
        <span className="text-xl font-bold">
          {formatWallet(tourist.wallet)}
        </span>
      </div>

      {/* Wallet History */}
      <div className="mt-2 overflow-y-auto max-h-[200px]">
  <h3 className="text-lg font-semibold mb-2">Wallet History</h3>
  {tourist.history && Array.isArray(tourist.history) && tourist.history.length > 0 ? (
    <div className="space-y-4">
      {Object.entries(groupTransactionsByDate(tourist.history)).map(([date, transactions]) => (
        <div key={date}>
          <h4 className="text-md font-semibold mb-2">{date}</h4>
          <ul className="">
            {transactions.map((entry, index) => (
              <li key={index} className="flex justify-between items-center pl-4 pr-4 pb-3 pt-3 bg-white rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    {getTransactionIcon(entry.details)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {entry.details || "Transaction"}
                    </p>
                    <p className="text-xs text-gray-500">
                    {format(new Date(entry.timestamp), 'dd,MM,yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    entry.transactionType === "deposit"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {entry.transactionType === "deposit" ? "+" : "-"}
                  {formatCurrency(convertCurrency(entry.amount, "USD", currencyCode), tourist.preferredCurrency)}                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">
      {tourist.history && Array.isArray(tourist.history)
        ? "No transactions found"
        : "Wallet history not available"}
    </p>
  )}
</div>

    </CardContent>
  </Card>
</TabsContent>

            <TabsContent value="currency">
              <CurrencyApp user={tourist} />
            </TabsContent>
            <TabsContent value="points">
              <RedeemPoints user={tourist} onRedeemPoints={handleRedeemPoints} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Notifications - 4 columns */}
        <Card className="col-span-4 max-h-[350px] overflow-y-auto">
        <CardHeader className="flex ">
  <CardTitle className=" ">
    Notifications
    <Button
    variant="ghost"
    className="text-sm text-[#388A94] hover:bg-white hover:underline justify-end"
    onClick={() => (window.location.href = "/tourist-notifications")}
  >
    View All
  </Button>
  </CardTitle>
  
</CardHeader>

  <CardContent>
    <div className="flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#388A94]" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-[#1A3B47] p-4 text-center">
          No notifications at the moment.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.slice(0, 10).map((notification, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-50 transition-colors relative cursor-pointer flex flex-col gap-1"
              onClick={() => navigate(notification.link)}
            >
              {!notification.seen && (
                <span className="absolute top-2 right-2 bg-[#F88C33] text-white text-xs px-2 py-1 rounded-full">
                  New
                </span>
              )}
              <div
                className="text-[#1A3B47] text-sm truncate"
                dangerouslySetInnerHTML={{
                  __html: notification.body.slice(0, 30) + "...", // Show first 50 characters
                }}
              ></div>
              <p className="text-xs text-gray-500">{formatDate(notification.date)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </CardContent>
</Card>



       
      </div>

      {/* Profile Picture Update Modal */}
      <Modal show={showModal} onClose={closeModal}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Update Profile Picture</h2>
          <ImageCropper
            onImageCropped={handleImageCropped}
            currentImage={selectedImage?.url || selectedImage}
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={handleFirstSave} className="bg-[#F88C33]">
              Save
            </Button>
            <Button onClick={closeModal} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        show={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        isImageViewer={true}
        imageUrl={selectedImage?.url || selectedImage}
      />
    </div>
  )
}







