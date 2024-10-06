import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Map from "../components/Map";
import * as jwtDecode from "jwt-decode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  XCircle,
  CheckCircle,
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  User,
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
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ImageCarousel = ({ pictures }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= pictures.length ? 0 : prevIndex + 3
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 3 < 0 ? Math.max(pictures.length - 3, 0) : prevIndex - 3
    );
  };

  if (!pictures || pictures.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex space-x-4 overflow-hidden">
              {[0, 1, 2].map((offset) => {
                const index = (currentIndex + offset) % pictures.length;
                return (
                  <img
                    key={index}
                    src={pictures[index]}
                    alt={`Activity image ${index + 1}`}
                    className="w-1/3 h-64 object-cover rounded-lg"
                  />
                );
              })}
            </div>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [advertiserProfile, setAdvertiserProfile] = useState(null);
  const [canModify, setCanModify] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivityDetails = async () => {
      if (!id) {
        setError("Invalid activity ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `http://localhost:4000/${userRole}/activities/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activity details");
        }

        const data = await response.json();
        setActivity(data);
        setError(null);

        if (data.advertiser) {
          setAdvertiserProfile(data.advertiser);
        }
        if (token) {
          const decodedToken = jwtDecode.jwtDecode(token);
          setCanModify(decodedToken.id === data.advertiser._id);
        }
      } catch (err) {
        setError("Error fetching activity details. Please try again later.");
        console.error("Error fetching activity details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [id, userRole]);

  const handleUpdate = () => {
    navigate(`/update-activity/${id}`);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/activities/${id}`,
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
        throw new Error("Failed to delete activity");
      }

      setShowDeleteSuccess(true);
    } catch (err) {
      setError("Error deleting activity. Please try again later.");
      console.error("Error deleting activity:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
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
      <div className="bg-[#1a202c] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{activity.name}</h1>
          <p className="text-xl md:text-2xl">{activity.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="p-6">
          {/* Container for Activity Details and Advertiser Profile */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Activity Details Card */}
            <div className="flex-[2] bg-white shadow-md rounded-lg p-8 flex flex-col justify-center h-full">
              {/* Title and Rating */}
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-bold">{activity.name}</h1>
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full ml-4">
                  <Star className="w-8 h-8 text-yellow-500 mr-2" />
                  <span className="text-2xl font-semibold">
                    {activity.rating || "N/A"}
                  </span>
                </div>
              </div>

              {/* Gap between Title and Details */}
              <div className="mb-4" />

              {/* Details Section Title */}
              <h2 className="text-2xl font-semibold mb-6">Activity Details</h2>

              {/* Map and Details */}
              <div className="flex gap-8">
                {/* Map Section */}
                <div className="flex-none">
                  <Map
                    position={[
                      activity.location.coordinates.latitude,
                      activity.location.coordinates.longitude,
                    ]}
                    height={"200px"}
                    width={"200px"}
                  />
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center">
                    <Globe className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Location: {activity.location.address}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">Price: ${activity.price}</span>
                  </div>
                  <div className="flex items-center">
                    <Accessibility className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Booking: {activity.isBookingOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Date: {new Date(activity.timing).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Special Discount: {activity.specialDiscount}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Time:{" "}
                      {new Date(activity.timing).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-col gap-8">
              {/* Advertiser Profile Card */}
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                {/* Logo Section */}
                <div className="flex items-center mb-6">
                  <Avatar className="w-12 h-12 mr-2">
                    <AvatarImage src={advertiserProfile.logoUrl} />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-xl font-bold">Advertiser Profile</h1>
                </div>

                <div className="space-y-4">
                  {/* Advertiser Details */}
                  <div className="flex items-center mb-4">
                    <User className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Advertiser:{" "}
                      {advertiserProfile ? advertiserProfile.username : "Loading..."}
                    </span>
                  </div>

                  {/* Email Section */}
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Email:{" "}
                      {advertiserProfile ? advertiserProfile.email : "Loading..."}
                    </span>
                  </div>

                  {/* Hotline Section */}
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Hotline:{" "}
                      {advertiserProfile ? advertiserProfile.hotline : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                {/* Categories and Tags Section */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">Categories</h2>
                    <div className="flex flex-wrap gap-2">
                      {activity.category && activity.category.length > 0 ? (
                        activity.category.map((cat, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {cat.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">
                          No categories available
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-1">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {activity.tags && activity.tags.length > 0 ? (
                        activity.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center"
                          >
                            <Tag className="w-4 h-4 mr-1" />
                            {tag.type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No tags available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Carousel Card */}
          <ImageCarousel pictures={activity.pictures} />
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end mt-8">
            {canModify && (
              <div className="flex space-x-2">
                <Button onClick={handleUpdate} variant="default">
                  <Edit className="mr-2" /> Update
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs for Deletion */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              The activity has been deleted successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate("/activity")} variant="default">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityDetail;