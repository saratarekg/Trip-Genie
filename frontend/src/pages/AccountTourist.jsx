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
          <p><strong>Name:</strong> {user.username}</p>
          {/* make the user role not seperated by hyphen and first letter capital */}
          <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("-"," ")}</p>


        </div>
      );
  }
};

const Upcoming = ({ user }) => {
  switch (user.role) {
    case "tourist":
      return <TouristActivities />;
    case "tourism-governor":
      return <div className="p-4 text-center">Activity management is handled in the admin dashboard.</div>;
    case "seller":
      return <div className="p-4 text-center">Manage your listings in the seller dashboard.</div>;
    case "advertiser":
      return <div className="p-4 text-center">View your ad campaigns in the advertiser dashboard.</div>;
    case "tour-guide":
      return <div className="p-4 text-center">Check your upcoming tours in the tour guide dashboard.</div>;
    default:
      return <div className="p-4 text-center">No upcoming activities available for {user.role}.</div>;
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
  const [exchangeRate, setExchangeRate] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(null);

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

  const fetchExchangeRate = useCallback(async () => {
    if (user && user.role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(`http://localhost:4000/tourist/populate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: "withEGP",
            target: user.preferredCurrency,
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
  }, [user]);

  const getCurrencySymbol = useCallback(async () => {
    if (user && user.role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${user.preferredCurrency}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrencySymbol(response.data.symbol);
      } catch (error) {
        console.error("Error fetching currency symbol:", error);
      }
    }
  }, [user]);

  const formatWallet = (price) => {
    fetchExchangeRate();
    getCurrencySymbol();
    if (user && user.role === "tourist" && exchangeRate && currencySymbol) {
      const exchangedPrice = price * exchangeRate;
      return `${currencySymbol}${exchangedPrice.toFixed(2)}`;
    }
    return price;
  };

  if (user.role !== "tourist") {
    return <div>Points redemption not available for {user.role}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Redeem Loyalty Points</h2>
      <p className="text-sm text-gray-600 mb-4">
        Convert your loyalty points to wallet balance
      </p>
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">
          Available Wallet Balance:{" "}
          <span className="text-green-600">{formatWallet(user.wallet)}</span>
        </p>
        <p className="text-sm font-medium">
          Loyalty Points:{" "}
          <span className="text-blue-600">{user.loyaltyPoints} points</span>
        </p>
      </div>
      <Button
        onClick={handleRedeemClick}
        disabled={isRedeeming || user.loyaltyPoints === 0}
        className="w-full"
      >
        {isRedeeming
          ? "Redeeming..."
          : `Redeem Points for ${user.loyaltyPoints / 100} EGP`}
      </Button>
      {redeemError && (
        <p className="text-red-500 text-sm text-center mt-2">{redeemError}</p>
      )}
      {redeemSuccess && (
        <p className="text-green-500 text-sm text-center mt-2">
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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="container p-5">
        <Popup
          isOpen={popupOpen}
          onClose={closePopup}
          type={popupType}
          message={popupMessage}
        />
      </div>
      <h1 style={{ fontSize: "2em", fontWeight: "bold", marginBottom: "20px" }}>
        Preferred Currency
      </h1>
      <h2
        style={{
          fontSize: "3em",
          fontWeight: "bold",
          color: "#3B82F6",
          marginBottom: "20px",
        }}
      >
        {preferredCurrency
          ? `${preferredCurrency.name} (${preferredCurrency.code})`
          : "Loading..."}
      </h2>

      <label
        style={{ display: "block", marginBottom: "20px", fontSize: "1.2em" }}
      >
        Select New Preferred Currency:
        <div
          style={{
            display: "inline-block",
            marginLeft: "10px",
            position: "relative",
          }}
        >
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "2px solid #3B82F6",
              fontSize: "1em",
              appearance: "none",
              width: "250px",
              cursor: "pointer",
              color: "#3B82F6",
              backgroundColor: "#f0f4ff",
              fontWeight: "500",
            }}
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
        <button
          type="button"
          onClick={handleSetPreferredCurrency}
          disabled={!selectedCurrency}
          style={{
            marginLeft: "15px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: selectedCurrency ? "#3B82F6" : "#a3a3a3",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: selectedCurrency ? "pointer" : "not-allowed",
            fontSize: "1em",
          }}
        >
          Set
        </button>
      </label>
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
      const api = `http://localhost:4000/tourists/redeem-points`;
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
        return (
          <RedeemPoints user={user} onRedeemPoints={handleRedeemPoints} />
        );
      case "security":
        return <PasswordChanger />;
      case "preferences":
        return <Preferences user={user} />;
      case "add-card":
        return user.role === "tourist" ? <AddCard /> : <div>Add card not available for {user.role}</div>;
      case "add-ship":
        return user.role === "tourist" ? <ShippingAddress /> : <div>Add shipping address not available for {user.role}</div>;
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
    "Activities & Itineraries": [
      { name: "Upcoming Bookings", icon: Calendar, tab: "upcoming", roles: ["tourist"] },
      { name: "Points and Wallet", icon: Wallet, tab: "redeem-points", roles: ["tourist"] },
    ],
    Products: [
      { name: "Cart", icon: ShoppingCartIcon, tab: "cart", roles: ["tourist"] },
      { name: "Wishlist", icon: Heart, tab: "wishlist", roles: ["tourist"] },
    ],
    "Settings and Privacy": [
      { name: "Account", icon: User, tab: "info", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin" , "tourism-governor"] },
      { name: "Security", icon: Lock, tab: "security", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
      { name: "Preferences", icon: Settings, tab: "preferences", roles: ["tourist"] },
      { name: "Set Currency", icon: DollarSign, tab: "currency", roles: ["tourist"] },
      { name: "Add credit/debit cards", icon: CreditCard, tab: "add-card", roles: ["tourist"] },
      { name: "Add Shipping Address", icon: HomeIcon, tab: "add-ship", roles: ["tourist"] },
      { name: "Delete Account", icon: Trash2, tab: "delete-account", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    ],
    "Help and Support": [
      { name: "File a Complaint", icon: AlertTriangle, tab: "complain", roles: ["tourist"] },
      { name: "My Complaints", icon: FileText, tab: "my-complaints", roles: ["tourist"] },
      { name: "FAQs", icon: HelpCircle, tab: "faqs", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    ],
    // "Display and Accessibility": [
    //   { name: "Theme", icon: Eye, tab: "theme", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    //   { name: "Language", icon: MapPin, tab: "language", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    // ],
    "Give Feedback": [
      { name: "History", icon: HistoryIcon, tab: "history", roles: ["tourist"] },
      { name: "Feedback", icon: MessageSquare, tab: "feedback", roles: ["tourist"] },
    ],
  };

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

  const role = getUserRole();

  return (
    <div>
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 mt-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <nav>
              <ul className="space-y-2">
                {Object.entries(menuStructure).map(([category, items]) => {
                  const filteredItems = items.filter(item => item.roles.includes(role));
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
                    onClick={logOut}
                    className="flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
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