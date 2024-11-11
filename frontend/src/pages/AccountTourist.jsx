import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  CreditCard,
  MapPin,
  ShoppingBag,
  User,
  Wallet,
  ShoppingCartIcon,
  Lock,
  AlertTriangle,
  Settings,
  HistoryIcon,
  Calendar,
  HelpCircle,
  Eye,
  MessageSquare,
  LogOut,
  Trash2,
  XCircle,
  CheckCircle,
  Heart,
  DollarSign,
  FileText,
  HomeIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Popup from "@/components/popup";
import "@/styles/Popup.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PasswordChanger from "@/components/Passwords";
import { TouristProfileComponent } from "@/components/touristProfile";
import FileComplaintForm from "@/components/FileComplaintForm";
import TravelPreferences from "@/components/TouristPreferences";
import TouristActivities from "@/pages/TouristActivities";
import FAQ from "@/pages/FAQs";
import TouristAttendedActivities from "@/pages/TouristAttended";
import AddCard from "@/pages/AddCard";
import ShippingAddress from "@/pages/AddShippingAddress";
import ShoppingCart from "@/components/touristCart.jsx";
import WishlistPage from "@/components/touristWishlist.jsx";
import { MyComplaintsComponent } from "@/components/myComplaints";
import { AdvertiserProfileComponent } from "@/components/AdvertiserProfileComponent";
import { SellerProfileComponent } from "@/components/SellerProfileComponent";
import { TourGuideProfileComponent } from "@/components/tourGuideProfile";

// Sub-components
const AccountInfo = ({ user }) => {
  switch (user.role) {
    case "advertiser":
      return <AdvertiserProfileComponent />;
    case "seller":
      return <SellerProfileComponent />;
    case "tour-guide":
      return <TourGuideProfileComponent />;
    case "tourist":
      return <TouristProfileComponent />;
    default:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          <p>
            <strong>Name:</strong> {user.username}
          </p>
          {/* make the user role not seperated by hyphen and first letter capital */}
          <p>
            <strong>Role:</strong>{" "}
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1).replace("-", " ")}
          </p>
        </div>
      );
  }
};

const Upcoming = ({ user }) => {
  switch (user.role) {
    case "tourist":
      return <TouristActivities />;
    case "tourism-governor":
      return (
        <div className="p-4 text-center">
          Activity management is handled in the admin dashboard.
        </div>
      );
    case "seller":
      return (
        <div className="p-4 text-center">
          Manage your listings in the seller dashboard.
        </div>
      );
    case "advertiser":
      return (
        <div className="p-4 text-center">
          View your ad campaigns in the advertiser dashboard.
        </div>
      );
    case "tour-guide":
      return (
        <div className="p-4 text-center">
          Check your upcoming tours in the tour guide dashboard.
        </div>
      );
    default:
      return (
        <div className="p-4 text-center">
          No upcoming activities available for {user.role}.
        </div>
      );
  }
};

const Cart = ({ user }) => {
  if (user.role === "tourist") {
    return <ShoppingCart />;
  } else {
    return <div>Cart not available for {user.role}</div>;
  }
};

const Wishlist = ({ user }) => {
  if (user.role === "tourist") {
    return <WishlistPage />;
  } else {
    return <div>Wishlist not available for {user.role}</div>;
  }
};

const History = ({ user }) => {
  if (user.role === "tourist") {
    return <TouristAttendedActivities />;
  } else {
    return <div>History not available for {user.role}</div>;
  }
};

const Complaint = () => <FileComplaintForm />;

const Preferences = ({ user }) => {
  if (user.role === "tourist") {
    return <TravelPreferences />;
  } else {
    return <div>Preferences not available for {user.role}</div>;
  }
};

const FAQs = () => <FAQ />;

const RedeemPoints = ({ user, onRedeemPoints }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("jwt");
        const [ratesResponse, currenciesResponse] = await Promise.all([
          axios.get("http://localhost:4000/rates", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/tourist/currencies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchUserInfo(),
        ]);
        setRates(ratesResponse.data.rates);
        setCurrencies(currenciesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    // if type of from currency is string and to currency is string  return (amount / rates[fromCurrency]) * rates[toCurrency]
    if (typeof fromCurrency === "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency];
    }
    if (typeof fromCurrency !== "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency.code]) * rates[toCurrency];
    }
    if (typeof fromCurrency !== "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency.code]) * rates[toCurrency.code];
    }

    if (typeof fromCurrency === "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency.code];
    }

    if (!rates[fromCurrency] || !rates[toCurrency.code]) return amount;
    return (amount / rates[fromCurrency]) * rates[toCurrency.code];
  };

  const formatCurrency = (amount, currency) => {
    const currencyInfo = currencies.find((c) => c.code === currency.code);
    return `${currencyInfo ? currencyInfo.symbol : ""}${amount.toFixed(2)}`;
  };

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

  console.log("Converted wallet amount:", convertedWalletAmount);
  console.log("Points value in EGP:", pointsValueInEGP);
  console.log("Points value in USD:", pointsValueInUSD);
  console.log(
    "Points value in preferred currency:",
    pointsValueInPreferredCurrency
  );

  const fetchUserInfo = useCallback(async () => {
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
  }, []);

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

  if (user.role !== "tourist") {
    return <div>Points redemption not available for {user.role}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Redeem Loyalty Points</h2>
      <p className="text-lg text-gray-700 mb-6">
        Convert your loyalty points into wallet balance.
      </p>

      <div className="space-y-4 mb-6">
        <p className="text-lg font-medium text-gray-600">
          Available Wallet Balance:{" "}
          <span className="text-teal-600">
            {formatCurrency(convertedWalletAmount, preferredCurrency)}
          </span>
        </p>
        <p className="text-lg font-medium text-gray-600">
          Loyalty Points:{" "}
          <span className="text-blue-600">{user.loyaltyPoints} points</span>
        </p>
      </div>

      <Button
        onClick={handleRedeemClick}
        disabled={isRedeeming || user.loyaltyPoints === 0}
        className="w-full py-3 bg-[#F88C33] text-white rounded-lg hover:bg-orange-500 transition duration-300 ease-in-out"
      >
        {isRedeeming
          ? "Redeeming..."
          : `Redeem Points for ${formatCurrency(
              pointsValueInPreferredCurrency,
              preferredCurrency
            )}`}
      </Button>

      {/* Error Message */}
      {redeemError && (
        <p className="text-red-500 text-sm text-center mt-4">{redeemError}</p>
      )}

      {/* Success Message */}
      {redeemSuccess && (
        <p className="text-green-500 text-sm text-center mt-4">
          {redeemSuccess}
        </p>
      )}
    </div>
  );
};

const CurrencyApp = ({ user }) => {
  const [currencies, setCurrencies] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const fetchPreferredCurrencyCode = async () => {
    if (user.role === "tourist") {
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
    }
  };

  useEffect(() => {
    if (user.role === "tourist") {
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
    }
  }, [user]);

  const handleSetPreferredCurrency = async () => {
    if (user.role === "tourist") {
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

  if (user.role !== "tourist") {
    return <div>Currency settings not available for {user.role}</div>;
  }

  return (
    <div className="container p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <Popup
        isOpen={popupOpen}
        onClose={closePopup}
        type={popupType}
        message={popupMessage}
      />
      <h1 className="text-2xl font-bold mb-4">Preferred Currency</h1>
      <h2 className="text-xl font-bold mb-4">
        {preferredCurrency
          ? `${preferredCurrency.name} (${preferredCurrency.code})`
          : "Loading..."}
      </h2>

      <label className="block text-lg font-medium text-gray-700 mb-5">
        <span>Select New Preferred Currency:</span>
        <div className="relative mt-2">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full p-4 rounded-lg border-2 border-teal-600 text-teal-600 bg-teal-50 font-medium focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
          >
            <option value="" disabled>
              Choose Currency
            </option>
            {currencies.map((currency) => (
              <option key={currency._id} value={currency._id}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSetPreferredCurrency}
          disabled={!selectedCurrency}
          className={`w-36 py-3 rounded-lg text-white font-semibold focus:outline-none transition duration-300 ease-in-out ${
            selectedCurrency
              ? "bg-[#F88C33] hover:bg-orange-600 cursor-pointer" //className="flex items-center justify-center w-full py-2 bg-[#F88C33] text-white rounded-md hover:bg-orange-500 transition duration-300 ease-in-out mb-4"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Set
        </button>
      </div>
    </div>
  );
};

const DeleteAccount = ({ onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");
      const response = await axios.delete(
        `http://localhost:4000/${role}/delete-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setDeleteResult({
          success: true,
          message: "Your account has been successfully deleted.",
        });
        Cookies.remove("jwt");
        Cookies.remove("role");
      }
    } catch (error) {
      setDeleteResult({
        success: false,
        message:
          error.response?.data?.message ||
          "An error occurred while deleting your account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (deleteResult && deleteResult.success) {
      navigate("/login"); // Redirect to login page if deletion is successful
    } else {
      onClose(); // Close the dialog if deletion is not successful
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {deleteResult ? (
              deleteResult.success ? (
                <span className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" />
                  Account Deleted
                </span>
              ) : (
                <span className="flex items-center">
                  <XCircle className="text-red-500 mr-2" />
                  Error
                </span>
              )
            ) : (
              "Delete Account"
            )}
          </DialogTitle>
          <DialogDescription>
            {deleteResult
              ? deleteResult.message
              : "Are you sure you want to delete your account? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {!deleteResult && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </>
          )}
          {deleteResult && deleteResult.success && (
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          )}
          {deleteResult && !deleteResult.success && (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState("info");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserRole = () => Cookies.get("role") || "guest";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ ...response.data, role });
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path === "account" || path === "") {
      setActiveTab("info");
    } else {
      setActiveTab(path);
    }
  }, [location]);

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

      setUser((prevUser) => ({
        ...prevUser,
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

  const renderContent = () => {
    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error)
      return <div className="text-center text-red-500">Error: {error}</div>;
    if (!user)
      return <div className="text-center">No user data available.</div>;

    switch (activeTab) {
      case "info":
        return <AccountInfo user={user} />;
      case "complain":
        return <Complaint />;
      case "my-complaints":
        return <MyComplaintsComponent />;
      case "cart":
        return <Cart user={user} />;
      case "wishlist":
        return <Wishlist user={user} />;
      case "history":
        return <History user={user} />;
      case "upcoming":
        return <Upcoming user={user} />;
      case "redeem-points":
        return <RedeemPoints user={user} onRedeemPoints={handleRedeemPoints} />;
      case "security":
        return <PasswordChanger />;
      case "preferences":
        return <Preferences user={user} />;
      case "add-card":
        return user.role === "tourist" ? (
          <AddCard />
        ) : (
          <div>Add card not available for {user.role}</div>
        );
      case "add-ship":
        return user.role === "tourist" ? (
          <ShippingAddress />
        ) : (
          <div>Add shipping address not available for {user.role}</div>
        );
      case "currency":
        return <CurrencyApp user={user} />;
      case "faqs":
        return <FAQs />;
      default:
        return <AccountInfo user={user} />;
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "delete-account") {
      setShowDeleteAccount(true);
    } else {
      setActiveTab(tab);
      navigate(`/account/${tab}`);
    }
  };

  const menuStructure = {
    "Upcoming Bookings": [
      {
        name: "Activities & Itineraries",
        icon: Calendar,
        tab: "upcoming",
        roles: ["tourist"],
      },
    ],
    Products: [
      { name: "Cart", icon: ShoppingCartIcon, tab: "cart", roles: ["tourist"] },
      { name: "Wishlist", icon: Heart, tab: "wishlist", roles: ["tourist"] },
    ],
    "Settings and Privacy": [
      {
        name: "Account",
        icon: User,
        tab: "info",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
      {
        name: "Security",
        icon: Lock,
        tab: "security",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
      {
        name: "Preferences",
        icon: Settings,
        tab: "preferences",
        roles: ["tourist"],
      },
      {
        name: "Points and Wallet",
        icon: Wallet,
        tab: "redeem-points",
        roles: ["tourist"],
      },
      {
        name: "Set Currency",
        icon: DollarSign,
        tab: "currency",
        roles: ["tourist"],
      },
      {
        name: "Add credit/debit cards",
        icon: CreditCard,
        tab: "add-card",
        roles: ["tourist"],
      },
      {
        name: "Add Shipping Address",
        icon: HomeIcon,
        tab: "add-ship",
        roles: ["tourist"],
      },
      {
        name: "Delete Account",
        icon: Trash2,
        tab: "delete-account",
        roles: ["tourist", "seller", "advertiser", "tour-guide"],
      },
    ],
    "Help and Support": [
      {
        name: "File a Complaint",
        icon: AlertTriangle,
        tab: "complain",
        roles: ["tourist"],
      },
      {
        name: "My Complaints",
        icon: FileText,
        tab: "my-complaints",
        roles: ["tourist"],
      },
      {
        name: "FAQs",
        icon: HelpCircle,
        tab: "faqs",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
    ],
    // "Display and Accessibility": [
    //   { name: "Theme", icon: Eye, tab: "theme", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    //   { name: "Language", icon: MapPin, tab: "language", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    // ],
    "Give Feedback": [
      {
        name: "History",
        icon: HistoryIcon,
        tab: "history",
        roles: ["tourist"],
      },
      {
        name: "Feedback",
        icon: MessageSquare,
        tab: "feedback",
        roles: ["tourist"],
      },
    ],
  };

  const LogoutPopup = ({ onConfirm, onCancel }) => {
    return (
      <div className="popup">
        {" "}
        <div className="popup-content">
          {" "}
          <h3>Are you sure you want to log out?</h3>{" "}
          <button onClick={onConfirm}>Yes</button>{" "}
          <button onClick={onCancel}>No</button>{" "}
        </div>{" "}
      </div>
    );
  };

  const [showPopup, setShowPopup] = useState(false);

  const logOut = async () => {
    console.log("Logging out...");
    try {
      const response = await fetch("http://localhost:4000/auth/logout");
      if (response.ok) {
        Cookies.set("jwt", "");
        Cookies.set("role", "");
        Cookies.remove("jwt");
        Cookies.remove("role");
        console.log("Logged out successfully");
        navigate("/login");
        window.location.reload();
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowPopup(true);
  };

  const handleConfirmLogout = () => {
    setShowPopup(false);
    logOut();
  };

  const handleCancelLogout = () => {
    setShowPopup(false);
  };

  const role = getUserRole();

  return (
    <div>
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="container mx-auto px-4 py-4 mt-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <nav>
              <ul className="space-y-2">
                {Object.entries(menuStructure).map(([category, items]) => {
                  const filteredItems = items.filter((item) =>
                    item.roles.includes(role)
                  );
                  if (filteredItems.length === 0) return null;

                  return (
                    <li key={category} className="mb-4">
                      <button
                        onClick={() =>
                          setExpandedMenu(
                            expandedMenu === category ? null : category
                          )
                        }
                        className="flex items-center justify-between w-full text-left text-gray-700 hover:text-orange-500 py-2"
                      >
                        <span>{category}</span>
                        <ChevronRight
                          className={`h-5 w-5 transform transition-transform ${
                            expandedMenu === category ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {expandedMenu === category && (
                        <ul className="ml-4 mt-2 space-y-2">
                          {filteredItems.map((item) => (
                            <li key={item.tab}>
                              <button
                                onClick={() => handleTabClick(item.tab)}
                                className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                                  activeTab === item.tab
                                    ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                                    : ""
                                }`}
                              >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                  {showPopup && (
                    <LogoutPopup
                      onConfirm={handleConfirmLogout}
                      onCancel={handleCancelLogout}
                    />
                  )}
                </li>
              </ul>
            </nav>
          </aside>

          <main className="w-full md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow">
              {renderContent()}
            </div>
          </main>
        </div>

        {showDeleteAccount && (
          <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
        )}
      </div>
    </div>
  );
}
