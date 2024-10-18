import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  CreditCard,
  MapPin,
  ShoppingBag,
  User,
  Wallet,
  Lock,
  AlertTriangle,
  HistoryIcon ,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PasswordChanger from "@/components/Passwords";
import { TouristProfileComponent } from "@/components/touristProfile";
import  FileComplaintForm  from '@/components/FileComplaintForm'
import TouristActivities from '@/pages/TouristActivities'
// Sub-components for each section
const AccountInfo = ({ tourist }) => (
    <TouristProfileComponent />
);

const History = ({ tourist }) => (
  <TouristActivities />
);

const Complaint = ({ tourist }) => (
  <div>
  <FileComplaintForm />
</div>
);

const Cart = ({ tourist }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
    <p>Your cart and order history goes here.</p>
  </div>
);

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Redeem Loyalty Points</CardTitle>
        <CardDescription>
          Convert your loyalty points to wallet balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Available Wallet Balance:{" "}
            <span className="text-green-600">{tourist.wallet} EGP</span>
          </p>
          <p className="text-sm font-medium">
            Loyalty Points:{" "}
            <span className="text-blue-600">
              {tourist.loyaltyPoints} points
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
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
          <p className="text-red-500 text-sm text-center">{redeemError}</p>
        )}
        {redeemSuccess && (
          <p className="text-green-500 text-sm text-center">{redeemSuccess}</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default function AccountTourist() {
  const [activeTab, setActiveTab] = useState("info");
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

      // Update the tourist state with the new data
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
    if (isLoading) {
      return <div className="text-center">Loading...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">Error: {error}</div>;
    }

    if (!tourist) {
      return <div className="text-center">No tourist data available.</div>;
    }

    switch (activeTab) {
      case "info":
        return <AccountInfo tourist={tourist} />;
        case "complain":
        return <Complaint tourist={tourist} />;
      case "cart":
        return <Cart tourist={tourist} />;
        case "history":
        return <TouristActivities tourist={tourist} />;
      case "redeem-points":
        return (
          <RedeemPoints tourist={tourist} onRedeemPoints={handleRedeemPoints} />
        );
      case "security":
        return <PasswordChanger />;
      default:
        return <AccountInfo tourist={tourist} />;
    }
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/account/${tab}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabClick("info")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "info"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabClick("history")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "history"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <HistoryIcon  className="h-5 w-5 mr-3" />
                  History
                </button>
              </li>
             
              <li>
                <button
                  onClick={() => handleTabClick("complain")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "complain"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  File a Complaint
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabClick("cart")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "cart"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Cart
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabClick("redeem-points")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "redeem-points"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <Wallet className="h-5 w-5 mr-3" />
                  Points and Wallet
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabClick("security")}
                  className={`flex items-center text-gray-700 hover:text-orange-500 py-2 w-full text-left ${
                    activeTab === "security"
                      ? "text-orange-500 font-medium border-l-4 border-orange-500 pl-2"
                      : ""
                  }`}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
