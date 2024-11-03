import React, { useState, useEffect } from "react";
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
  FileText
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Popup from "@/components/popup";
import '@/styles/Popup.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import TouristActivities from '@/pages/TouristActivities';
import TouristAttendedActivities from '@/pages/TouristAttended';
import ShoppingCart from '@/components/touristCart.jsx';
import WishlistPage from '@/components/touristWishlist.jsx';
import { MyComplaintsComponent } from "@/components/myComplaints";

// Sub-components
const AccountInfo = ({ tourist }) => <TouristProfileComponent />;

const Upcoming = ({ tourist }) => <TouristActivities />;

const Cart = ({ tourist }) => <ShoppingCart />;

const Wishlist = ({ tourist }) => <TouristActivities />;

const History = ({ tourist }) => <TouristAttendedActivities />;

const Complaint = () => <FileComplaintForm />;

const Preferences = () => <TravelPreferences />;

const RedeemPoints = ({ tourist, onRedeemPoints }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  const handleRedeemClick = async () => {
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      await onRedeemPoints(tourist.loyaltyPoints);
      setRedeemSuccess(`Successfully redeemed ${tourist.loyaltyPoints} points`);
    } catch (error) {
      setRedeemError(
        error.message || "An error occurred while redeeming points"
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Redeem Loyalty Points</h2>
      <p className="text-sm text-gray-600 mb-4">
        Convert your loyalty points to wallet balance
      </p>
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">
          Available Wallet Balance:{" "}
          <span className="text-green-600">{tourist.wallet.toFixed(2)} EGP</span>
        </p>
        <p className="text-sm font-medium">
          Loyalty Points:{" "}
          <span className="text-blue-600">{tourist.loyaltyPoints} points</span>
        </p>
      </div>
      <Button
        onClick={handleRedeemClick}
        disabled={isRedeeming || tourist.loyaltyPoints === 0}
        className="w-full"
      >
        {isRedeeming
          ? "Redeeming..."
          : `Redeem Points for ${tourist.loyaltyPoints / 100} EGP`}
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

const CurrencyApp = () => {
  const [currencies, setCurrencies] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const fetchPreferredCurrencyCode = async () => {
      try {
          const token = Cookies.get("jwt");
          const codeResponse = await axios.get("http://localhost:4000/tourist/currencies/idd", {
              headers: { Authorization: `Bearer ${token}` },
          });
          
          const preferredCurrencyCode = codeResponse.data;
          console.log("Preferred Currency Code:", preferredCurrencyCode);

          const currencyResponse = await axios.get(`http://localhost:4000/tourist/getCurrency/${preferredCurrencyCode}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          setPreferredCurrency(currencyResponse.data);
      } catch (error) {
          console.error('Error fetching preferred currency details:', error);
      }
  };

  useEffect(() => {
      const fetchSupportedCurrencies = async () => {
          try {
              const token = Cookies.get("jwt");
              const response = await axios.get("http://localhost:4000/tourist/currencies", {
                  headers: { Authorization: `Bearer ${token}` },
              });
              setCurrencies(response.data);
          } catch (error) {
              console.error('Error fetching supported currencies:', error);
          }
      };

      fetchSupportedCurrencies();
      fetchPreferredCurrencyCode();
  }, []);

  const handleSetPreferredCurrency = async () => {
      try {
          const token = Cookies.get("jwt");
          await axios.post(
              "http://localhost:4000/tourist/currencies/set",
              { currencyId: selectedCurrency },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          openSuccessPopup('Preferred currency set successfully!');
          
          fetchPreferredCurrencyCode();
      } catch (error) {
          console.error('Error setting preferred currency:', error);
          openErrorPopup(error);
      }
  };

  const [popupType, setPopupType] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const openSuccessPopup = (message) => {
    setPopupType('success');
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const openErrorPopup = (message) => {
    setPopupType('error');
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const closePopup = () => {
      setPopupOpen(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div className="container p-5">
        <Popup isOpen={popupOpen} onClose={closePopup} type={popupType} message={popupMessage}/>
      </div>
      <h1 style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '20px' }}>Preferred Currency</h1>
      <h2 style={{ fontSize: '3em', fontWeight: 'bold', color: '#3B82F6', marginBottom: '20px' }}>
          {preferredCurrency ? `${preferredCurrency.name} (${preferredCurrency.code})` : "Loading..."}
      </h2>

      <label style={{ display: 'block', marginBottom: '20px', fontSize: '1.2em' }}>
          Select New Preferred Currency:
          <div style={{ display: 'inline-block', marginLeft: '10px', position: 'relative' }}>
              <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '2px solid #3B82F6',
                      fontSize: '1em',
                      appearance: 'none',
                      width: '250px',
                      cursor: 'pointer',
                      color: '#3B82F6',
                      backgroundColor: '#f0f4ff',
                      fontWeight: '500',
                  }}
              >
                  <option value="" disabled>Choose Currency</option>
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
                  marginLeft: '15px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: selectedCurrency ? '#3B82F6' : '#a3a3a3',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: selectedCurrency ? 'pointer' : 'not-allowed',
                  fontSize: '1em',
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
      const response = await axios.delete("http://localhost:4000/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 404) {
        setDeleteResult({ success: true, message: "Your account has been successfully deleted." });
        Cookies.remove("jwt");
        Cookies.remove("role");
      }
    } catch (error) {
      setDeleteResult({ success: false, message: error.response?.data?.message || "An error occurred while deleting your account." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
            {deleteResult ? deleteResult.message : "Are you sure you want to delete your account? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {!deleteResult && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
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

export default function AccountTourist() {
  const [activeTab, setActiveTab] = useState("info");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [tourist, setTourist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserRole = () => Cookies.get("role") || "guest";

  useEffect(() => {
    const fetchTouristProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTourist(response.data);
      } catch (err) {
        setError(err.message);
        setTourist(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTouristProfile();
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

  const renderContent = () => {
    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;
    if (!tourist) return <div className="text-center">No tourist data available.</div>;

    switch (activeTab) {
      case "info": return <AccountInfo tourist={tourist} />;
      case "complain": return <Complaint />;
      case "my-complaints": return <MyComplaintsComponent />;
      case "cart": return <ShoppingCart tourist={tourist} />;
      case "wishlist": return  <WishlistPage tourist={tourist} />;
      case "history": return <History tourist={tourist} />;
      case "upcoming": return <Upcoming tourist={tourist} />;
      case "redeem-points": return <RedeemPoints tourist={tourist} onRedeemPoints={handleRedeemPoints} />;
      case "security": return <PasswordChanger />;
      case "preferences": return <Preferences />;
      case "currency": return <CurrencyApp />;
      default: return <AccountInfo tourist={tourist} />;
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
      { name: "Upcoming Bookings", icon: Calendar, tab: "upcoming" },
      { name: "Points and Wallet", icon: Wallet, tab: "redeem-points" },
    ],
    "Products": [
      { name: "Cart", icon: ShoppingCartIcon, tab: "cart" },
      { name: "Wishlist", icon: Heart, tab: "wishlist" },
    ],
    "Settings and Privacy": [
      { name: "Account", icon: User, tab: "info" },
      { name: "Security", icon: Lock, tab: "security" },
      { name: "Preferences", icon: Settings, tab: "preferences" },
      { name: "Set Currency", icon: DollarSign, tab: "currency" },
      { name: "Delete Account", icon: Trash2, tab: "delete-account" },
    ],
    "Help and Support": [
      { name: "File a Complaint", icon: AlertTriangle, tab: "complain" },
      { name: "My Complaints", icon: FileText, tab: "my-complaints" },
      { name: "FAQs", icon: HelpCircle, tab: "faqs" },
    ],
    "Display and Accessibility": [
      { name: "Theme", icon: Eye, tab: "theme" },
      { name: "Language", icon: MapPin, tab: "language" },
    ],
    "Give Feedback": [
      { name: "History", icon: HistoryIcon, tab: "history" },
      { name: "Feedback", icon: MessageSquare, tab: "feedback" },
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

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <nav>
            <ul className="space-y-2">
              {Object.entries(menuStructure).map(([category, items]) => (
                <li key={category} className="mb-4">
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === category ? null : category)}
                    className="flex items-center justify-between w-full text-left text-gray-700 hover:text-orange-500 py-2"
                  >
                    <span>{category}</span>
                    <ChevronRight className={`h-5 w-5 transform transition-transform ${expandedMenu === category ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedMenu === category && (
                    <ul className="ml-4 mt-2 space-y-2">
                      {items.map((item) => (
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
              ))}
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
  );
}