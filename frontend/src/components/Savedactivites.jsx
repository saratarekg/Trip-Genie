import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { ChevronLeft, ChevronRight, Star, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Loader from "@/components/Loader";
import defaultImage from "@/assets/images/default-image.jpg";
import activityImage from "@/assets/images/sam.png";

const renderStars = (rating) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= rating ? "text-[#F88C33] fill-current" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const ActivityCard = ({ activity, onSelect, onActivityUnsaved }) => {
  const [isSaved, setIsSaved] = useState(true);

  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    try {
      const token = Cookies.get("jwt");
      const response = await axios.post(
        `http://localhost:4000/tourist/save-activity/${activity._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setIsSaved(false);
        onActivityUnsaved(activity._id);
      }
    } catch (error) {
      console.error("Error unsaving activity:", error);
    }
  };

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
      onClick={() => onSelect(activity._id)}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={activity.pictures?.[0]?.url || defaultImage}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          className="absolute top-2 right-2 p-2 bg-white text-primary rounded-full hover:bg-gray-100"
          onClick={handleSaveToggle}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? "fill-yellow-400" : ""} stroke-black`} />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg text-[#1A3B47]">{activity.name}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {activity.location?.address || 'Location not available'}
        </p>
        <div className="mt-2 flex items-center">
          {renderStars(activity.rating)}
          <span className="ml-2 text-sm text-gray-600">
            {activity.rating?.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {activity.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex justify-between w-full">
          <span className="text-lg font-bold text-primary">
            ${activity.price || 0}
          </span>
          <span className="text-sm text-muted-foreground">
            {activity.duration || 0} hours
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function SavedActivities() {
  const [savedActivities, setSavedActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();

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
    <div className="bg-gray-100">
      <div className="relative h-[250px] bg-[#5D9297] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 mt-8 h-full flex items-center">
          <h1 className="text-5xl font-bold text-white">Saved Activities</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Loader />
        ) : savedActivities.length === 0 ? (
          <div className="text-center py-8">No Activities Saved Yet!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedActivities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                onSelect={handleActivitySelect}
                onActivityUnsaved={handleActivityUnsaved}
              />
            ))}
          </div>
        )}
      </div>
      {alertMessage && (
        <Alert className="fixed bottom-4 right-4 w-96 bg-green-500 text-white">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{alertMessage.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

