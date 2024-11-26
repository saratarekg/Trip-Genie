import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Star, Clock, MapPin, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/Loader";
import defaultImage from "@/assets/images/default-image.jpg";



const ActivityCard = ({ activity, onSelect, onActivityUnsaved, userInfo, exchangeRates }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleUnsave = async (e) => {
    e.stopPropagation();
    try {
      const token = Cookies.get("jwt");
      const response = await axios.post(
        `http://localhost:4000/tourist/save-activity/${activity._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        onActivityUnsaved(activity._id);
      }
    } catch (error) {
      console.error("Error unsaving activity:", error);
    }
  };

  const getFormattedPrice = (price) => {
    if (!userInfo || !exchangeRates) return `$${price.toFixed(2)}`;

    const baseRate = exchangeRates[activity.currency] || 1;
    const targetRate = exchangeRates[userInfo.preferredCurrency.code] || 1;
    const exchangedPrice = (price / baseRate) * targetRate;

    return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
  };

  return (
    <Card
      className="group relative flex items-center gap-4 p-2 transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onSelect(activity._id)}
    >
      {/* Bookmark Icon on Top of Image with Tooltip */}
      <div className="relative h-36 w-36 shrink-0  rounded-sm ">
        <img
          src={activity.pictures?.[0]?.url || defaultImage}
          alt={activity.name}
          className="object-cover w-full h-full rounded-sm"
        />
        {/* Bookmark Icon on Top of Image with Tooltip */}
        <div
          className="absolute top-1 left-1 z-50 bg-white p-1 rounded-full"
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <Bookmark
            className="fill-[#1A3B47] text-[#1A3B47] hover:fill-[#2e6b77] hover:text-[#2e6b77]"
            size={25}
            onClick={handleUnsave}
          />
          {tooltipVisible && (
            <div className="absolute bottom-10 left-0 bg-[#B5D3D1] font-semibold text-black text-xs px-2 py-1 rounded-lg">
              Unsave?
            </div>
          )}
        </div>

      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[#1A3B47]">{activity.name}</h3>
            <div className="flex items-center text-sm text-[#5D9297] font-semibold pt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{activity.location?.address || "Location not available"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-base">
            <Star className="h-6 w-6 fill-[#F88C33] text-[#F88C33]" />
            <span className="text-[#F88C33]">{activity.rating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#5D9297]">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-[#5D9297]" />
            <span>{activity.duration === 1 ? "1 hour" : `${activity.duration} hours`}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-[#5D9297]" />
            <span>{new Date(activity.timing).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold text-[#1A3B47]">
            {getFormattedPrice(activity.price)}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-[#388A94] hover:bg-[#2e6b77]"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activity._id);
              }}
            >
              View
            </Button>
            <Button size="sm" variant="default" className="bg-gray-200 hover:bg-gray-300 text-black font-semibold" onClick={handleUnsave}>
              Unsave
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};


export default function SavedActivities() {
  const [savedActivities, setSavedActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const navigate = useNavigate();

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates");
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    const role = Cookies.get("role");
    if (role !== "tourist") return;
    try {
      const response = await axios.get(
        "http://localhost:4000/tourist/currencies",
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
      // Note: setCurrencies is not defined in the original code, so I've commented it out
      // setCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    const token = Cookies.get("jwt");

    if (role === "tourist") {
      try {
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currencyId = response.data.preferredCurrency;

        const currencyResponse = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${currencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserInfo({
          role,
          preferredCurrency: currencyResponse.data,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({ role });
      }
    } else {
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserInfo({
          role,
          userId: decodedToken.id,
        });
      } else {
        setUserInfo({ role });
      }
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
    fetchExchangeRates();
    fetchCurrencies();
  }, [fetchUserInfo, fetchExchangeRates, fetchCurrencies]);

  const fetchSavedActivities = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get("http://localhost:4000/tourist/saved-activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedActivities(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching saved activities:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedActivities();
  }, [fetchSavedActivities]);

  const handleActivitySelect = (id) => {
    navigate(`/activity/${id}`);
  };

  const handleActivityUnsaved = (activityId) => {
    setSavedActivities((prev) => prev.filter((activity) => activity._id !== activityId));
    setAlertMessage({
      type: "success",
      message: "Activity removed from saved list successfully!",
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Loader />
        ) : savedActivities.length === 0 ? (
          <div className="text-center py-8">No Activities Saved Yet!</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedActivities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                onSelect={handleActivitySelect}
                onActivityUnsaved={handleActivityUnsaved}
                userInfo={userInfo}
                exchangeRates={exchangeRates}
              />
            ))}
          </div>
        )}
      </div>
      {alertMessage && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow">
          {alertMessage.message}
        </div>
      )}
    </div>
  );
}

