import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ActivityDetail from "./SingleActivity";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const fetchData = async (userRole, dataType) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/${userRole}/${dataType}`,
      {
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return [];
    }
    console.error(`Error fetching ${dataType}:`, error);
    throw error;
  }
};

export default function TouristAttendedActivities() {
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest");
  const [activities, setActivities] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleActivityClick = (activity) => {
    if (activity.isDeleted) {
      return toast({
        title: "Activity Unavailable",
        description: "This activity no longer exists",
        duration: 3000,
      });
    }
    navigate(`/activity/${activity._id}`);
  };
  // const handleItineraryClick = (itinerary) => {
  //   if (itinerary.isDeleted) {
  //     return toast({
  //       title: "Itinerary Unavailable",
  //       description: "This itinerary no longer exists",
  //       duration: 3000,
  //     });
  //   }
  //   navigate(`/itinerary/${itinerary._id}`);
  // };

  const handleItineraryClick = (itinerary) => {
    if (!itinerary) {
      return toast({
        title: "Itinerary Unavailable",
        description: "This itinerary no longer exists",
        duration: 3000,
      });
    }
    navigate(`/itinerary/${itinerary._id}`);
  };

  useEffect(() => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [activitiesData, itinerariesData] = await Promise.all([
          fetchData(role, "touristActivityAttendedBookings"),
          fetchData(role, "touristItineraryAttendedBookings"),
        ]);
        setActivities(activitiesData);
        console.log(activitiesData);
        setItineraries(itinerariesData);
      } catch (err) {
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const noBookingsMessage = (
    <div className="text-center py-8">
      <p className="text-xl font-semibold text-gray-600">
        No bookings for you yet
      </p>
      <p className="text-gray-500 mt-2">
        Start exploring and book your first activity!
      </p>
    </div>
  );

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">My Activities and Itineraries</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itineraries</CardTitle>
              <CardDescription>Your travel plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {itineraries.length > 0
                  ? itineraries.map((booking) => (
                      <div key={booking?._id} className="mb-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left whitespace-normal"
                          onClick={() =>
                            handleItineraryClick(booking.itinerary)
                          }
                        >
                          <div className="flex items-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            <div>
                              <span>{booking.itinerary?.title}</span>
                              <div className="text-sm text-gray-500 mt-1">
                                <span>
                                  {` ${new Date(
                                    booking?.date.split("T")[0]
                                  ).toLocaleDateString()}  -  ${
                                    booking?.numberOfTickets
                                  } Ticket(s) Booked`}
                                </span>

                                <span className="block"></span>
                              </div>
                            </div>
                          </div>
                        </Button>
                        <Separator className="my-2" />
                      </div>
                    ))
                  : noBookingsMessage}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Attended Activities</CardTitle>
              <CardDescription>
                Click on an activity to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {activities.length > 0
                  ? activities.map((booking) => (
                      <div key={booking._id} className="mb-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left whitespace-normal"
                          onClick={() => handleActivityClick(booking.activity)}
                        >
                          <div className="flex items-start">
                            <ChevronRight className="mr-2 h-4 w-4" />
                            <div>
                              <span>{booking.activity.name}</span>
                              <div className="text-sm text-gray-500 mt-1">
                                <span>
                                  {`${new Date(
                                    booking.activity.timing.split("T")[0]
                                  ).toLocaleDateString()} - ${
                                    booking.numberOfTickets
                                  } Ticket(s) Booked`}
                                </span>

                                <span className="block"></span>
                              </div>
                            </div>
                          </div>
                        </Button>
                        <Separator className="my-2" />
                      </div>
                    ))
                  : noBookingsMessage}
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedActivity && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityDetail id1={selectedActivity._id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
