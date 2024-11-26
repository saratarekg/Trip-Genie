import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Star, Clock, MapPin, Calendar, Bookmark,Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/Loader";
import defaultImage from "@/assets/images/default-image.jpg";

const ItineraryCard = ({ itinerary, onSelect, onItineraryUnsaved, userInfo, exchangeRates }) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
  
    const handleUnsave = async (e) => {
      e.stopPropagation();
      try {
        const token = Cookies.get("jwt");
        const response = await axios.post(
          `http://localhost:4000/tourist/save-itinerary/${itinerary._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          onItineraryUnsaved(itinerary._id);
        }
      } catch (error) {
        console.error("Error unsaving itinerary:", error);
      }
    };
  
    const getFormattedPrice = (price) => {
      if (!userInfo || !exchangeRates) return `$${price.toFixed(2)}`;
  
      const baseRate = exchangeRates[itinerary.currency] || 1;
      const targetRate = exchangeRates[userInfo.preferredCurrency.code] || 1;
      const exchangedPrice = (price / baseRate) * targetRate;
  
      return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
    };
  
    return (
      <Card
        className="group relative flex items-center gap-4 p-2 transition-all hover:shadow-lg cursor-pointer"
        onClick={() => onSelect(itinerary._id)}
      >
        {/* Bookmark Icon on Top of Image with Tooltip */}
        <div className="relative h-36 w-36 shrink-0 rounded-sm">
          <img
            src={itinerary.activities?.[0]?.pictures?.[0]?.url || defaultImage}
            alt={itinerary.title}
            className="object-cover w-full h-full rounded-sm"
          />
          <div
            className="absolute top-0 left-0 z-50"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <Bookmark
              className="fill-[#388A94] text-[#388A94] hover:fill-[#2e6b77] hover:text-[#2e6b77]"
              size={36}
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
              <h3 className="font-semibold text-[#1A3B47]">{itinerary.title}</h3>
              
            </div>
            <div className="flex items-center gap-1 text-base">
              <Star className="h-6 w-6 fill-[#F88C33] text-[#F88C33]" />
              <span className="text-[#F88C33]">{itinerary.rating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
  
          <div className="flex items-center gap-4 text-sm text-[#5D9297]">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-[#5D9297]" />
              <span>{itinerary.language || "Language not specified"}</span>
            </div>
          </div>
  
          <div className="mt-2 flex items-center justify-between">
            <div className="text-lg font-bold text-[#1A3B47]">
              {getFormattedPrice(itinerary.price)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-[#388A94] hover:bg-[#2e6b77]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(itinerary._id);
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
  
export default function SavedItineraries() {
  const [savedItineraries, setSavedItineraries] = useState([]);
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
  }, [fetchUserInfo, fetchExchangeRates]);

  const fetchSavedItineraries = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get("http://localhost:4000/tourist/saved-itineraries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedItineraries(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching saved itineraries:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedItineraries();
  }, [fetchSavedItineraries]);

  const handleItinerarySelect = (id) => {
    navigate(`/itinerary/${id}`);
  };

  const handleItineraryUnsaved = (itineraryId) => {
    setSavedItineraries((prev) => prev.filter((itinerary) => itinerary._id !== itineraryId));
    setAlertMessage({
      type: "success",
      message: "Itinerary removed from saved list successfully!",
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Loader />
        ) : savedItineraries.length === 0 ? (
          <div className="text-center py-8">No Itineraries Saved Yet!</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary._id}
                itinerary={itinerary}
                onSelect={handleItinerarySelect}
                onItineraryUnsaved={handleItineraryUnsaved}
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

