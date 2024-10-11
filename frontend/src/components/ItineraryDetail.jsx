import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as jwtDecode from "jwt-decode";
import { TimelinePreviewComponent } from "@/components/timeline-preview";
import {
  XCircle,
  CheckCircle,
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Accessibility,
  Star,
  Edit,
  Trash2,
  Mail,
  Phone,
  Award,
  Clock,
  Info,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg
      className="spinner"
      width="65px"
      height="65px"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="path"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    </svg>
  </div>
);

const TourguideProfileCard = ({ profile }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tourguide Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatarUrl} alt={profile.username} />
            <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="mt-2 text-xl font-semibold">{profile.username}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>{profile.mobile}</span>
          </div>
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>{profile.yearsOfExperience} years of experience</span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" aria-hidden="true" />
            <span>{profile.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge key={index} variant="secondary">{lang}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">{specialty}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ItineraryDetail = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [tourGuideProfile, setTourGuideProfile] = useState(null);
  const [canModify, setCanModify] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraryDetails = async () => {
      if (!id) {
        setError("Invalid itinerary ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `http://localhost:4000/${userRole}/itineraries/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        

        if (!response.ok) {
          throw new Error("Failed to fetch itinerary details");
        }

        const data = await response.json();
        setItinerary(data);
        setError(null);

        if (data.tourGuide) {
          setTourGuideProfile({
            ...data.tourGuide,
            languages: ['English', 'Spanish', 'French'], // Example data, replace with actual data
            specialties: ['Historical Tours', 'Food Tours', 'Adventure Tours'], // Example data, replace with actual data
            rating: 4.8, // Example data, replace with actual data
          });
        }

        setActivities(data.activities);
        if (token) {
          const decodedToken = jwtDecode.jwtDecode(token);
          setCanModify(decodedToken.id === data.tourGuide._id);
        }
      } catch (err) {
        setError("Error fetching itinerary details. Please try again later.");
        console.error("Error fetching itinerary details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraryDetails();
  }, [id, userRole]);

  const handleUpdate = () => {
    navigate(`/update-itinerary/${id}`);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/itineraries/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setDeleteError(errorData.message);
          return;
        }
        if (response.status === 403) {
          setDeleteError(errorData.message);
          return;
        }
        throw new Error("Failed to delete itinerary");
      }

      setShowDeleteSuccess(true);
    } catch (err) {
      setError("Error deleting itinerary. Please try again later.");
      console.error("Error deleting itinerary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#1a202c] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-white"></div>
          </div>
        </div>
      </nav>

      <div className="bg-[#1a202c] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {itinerary.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-4xl font-bold">Itinerary Details</h1>

                  <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                      <DollarSign className="w-8 h-8 text-blue-500 mr-2" />
                      <span className="text-2xl font-semibold">
                        {itinerary.price || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                      <Star className="w-8 h-8 text-yellow-500 mr-2" />
                      <span className="text-2xl font-semibold">
                        {itinerary.rating || "N/A"}
                      </span>
                    </div>

                   
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Globe className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Language: {itinerary.language}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Price: ${itinerary.price}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Accessibility className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Accessibility: {itinerary.accessibility ? "Yes" : "No"}
                      </span>
                    </div>
                    
                  </div>
                  <div className="space-y-4">
                  <div className="flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Pick-up: {itinerary.pickUpLocation}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Drop-off: {itinerary.dropOffLocation}
                      </span>
                    </div>
                   
                   
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Timeline: {""}
                        {itinerary.timeline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 mt-6">
                  <h3 className="text-2xl font-semibold mb-4">Available Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itinerary.availableDates.map((dateInfo, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                          <span className="font-semibold">
                            {new Date(dateInfo.date).toLocaleDateString()}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {dateInfo.times.map((time, timeIndex) => (
                            <li key={timeIndex} className="text-sm text-gray-600">
                              {time.startTime} - {time.endTime}
                            </li>
                          ))}
                        </ul>
                      </div>
                
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4">Activities</h2>
                  {activities.length === 0 ? (
                    <p>No activities found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activities.map((activity, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle>{activity.name}</CardTitle>
                            <CardDescription>
                              {activity.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">{activity.location.address}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  Duration: {activity.duration} hours
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  {new Date(activity.timing).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  Price: ${activity.price}
                                </span>
                              </div>
                              {activity.specialDiscount > 0 && (
                                <div className="flex items-center">
                                  <Info className="w-4 h-4 mr-2 text-green-500" />
                                  <span className="text-sm text-green-500">
                                    Special Discount: {activity.specialDiscount}%
                                    off
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                <span className="text-sm">
                                  Rating: {activity.rating || "N/A"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {activity.category &&
                                  activity.category.map((cat, catIndex) => (
                                    <Badge key={catIndex} variant="secondary">
                                      {cat.name}
                                    </Badge>
                                  ))}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {activity.tags &&
                                  activity.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline">
                                      {tag.type}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {itinerary.location && (
                  <div className="mt-8">
                    <TimelinePreviewComponent  />
                  </div>
                )}

                {userRole === "tour-guide" && canModify && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <Button
                      onClick={handleUpdate}
                      variant="default"
                      className="flex items-center bg-[#1a202c] hover:bg-[#2d3748]"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                      className="flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            {tourGuideProfile && (
              <TourguideProfileCard profile={tourGuideProfile} />
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Itinerary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this itinerary?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Itinerary Deleted
            </DialogTitle>
            <DialogDescription>
              The itinerary has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => navigate("/all-itineraries")}
            >
              Back to All Itineraries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteError !== null}
        onOpenChange={() => setDeleteError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Delete Itinerary
            </DialogTitle>
            <DialogDescription>
              {deleteError || "Itinerary is already booked!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setDeleteError(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItineraryDetail;