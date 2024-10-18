import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow, format } from "date-fns";
import Map from "../components/Map";
import Loader from "../components/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronUp,
  ChevronDown,
  Send,
  Tag,
  Share2,
  Link,
  Smile,
  Frown,
} from "lucide-react";

const ImageGallery = ({ pictures }) => {
  const [mainImage, setMainImage] = useState(pictures[0]);
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setStartIndex((prevIndex) => Math.min(pictures.length - 5, prevIndex + 1));
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/5 relative">
        <div className="h-full overflow-hidden">
          {pictures.length > 5 && (
            <button
              onClick={handlePrev}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full z-10"
              disabled={startIndex === 0}
              aria-label="Previous images"
            >
              <ChevronUp size={20} />
            </button>
          )}
          <div className="flex flex-col gap-2">
            {pictures.slice(startIndex, startIndex + 5).map((pic, index) => (
              <img
                key={index}
                src={pic}
                alt={`Activity image ${startIndex + index + 1}`}
                className="w-full h-[calc(20%-8px)] object-cover rounded-lg cursor-pointer"
                onClick={() => setMainImage(pic)}
              />
            ))}
          </div>
          {pictures.length > 5 && (
            <button
              onClick={handleNext}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full z-10"
              disabled={startIndex >= pictures.length - 5}
              aria-label="Next images"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>
      <div className="w-4/5">
        <img
          src={mainImage}
          alt="Main activity image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 ${readOnly ? "" : "cursor-pointer"} ${
            star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
          onClick={() => !readOnly && setRating(star)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        />
      ))}
    </div>
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
  const [currentUser, setCurrentUser] = useState("");
  const [activityRating, setActivityRating] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [paymentType, setPaymentType] = useState("CreditCard");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [open, setOpen] = useState(false); // Added state for popover
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsToastOpen(true);
    setOpen(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this activity: ${activity.name}`);
    const body = encodeURIComponent(`I thought you might be interested in this activity:\n\n${activity.name}\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false); // Close the popover
  };

  const handleBookNowClick = () => {
    setShowBookingDialog(true);
    setBookingError("");
  };

  const calculateTotalPrice = () => {
    const discountedPrice = calculateDiscountedPrice(activity.price, activity.specialDiscount);
    return (discountedPrice * numberOfTickets).toFixed(2);
  };

  const handleBooking = async () => {
    setIsBooking(true);
    setBookingError("");
    try {
      const token = Cookies.get("jwt");
      const totalPrice = calculateTotalPrice();

      const response = await fetch(`http://localhost:4000/${userRole}/activityBooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity: id,
          paymentType,
          paymentAmount: totalPrice,
          numberOfTickets,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Insufficient funds in wallet") {
          setBookingError("Insufficient funds, please choose a different payment method or update your wallet.");
        } else {
          throw new Error(errorData.message || "Failed to book activity");
        }
      } else {
        const data = await response.json();
        setShowBookingDialog(false);
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error("Error booking activity:", error);
      setBookingError(error.message || "An error occurred while booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };


  // Comment Carousel State
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [showFullComment, setShowFullComment] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    liked: "",
    disliked: "",
    visitDate: "",
    isAnonymous: false,
  });

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
          const decodedToken = jwtDecode(token);
          setCanModify(decodedToken.id === data.advertiser._id);
          setCurrentUser(decodedToken.id);

          if (data.attended && Array.isArray(data.attended)) {
            setHasAttended(
              data.attended.some((tourist) => tourist._id === decodedToken.id)
            );
          }
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

  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return ((originalPrice * (100 - discountPercentage)) / 100).toFixed(2);
  };

  const handleAddComment = (newComment) => {
    setActivity((prevActivity) => ({
      ...prevActivity,
      comments: [...(prevActivity.comments || []), newComment],
    }));
  };

  const handleActivityRating = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/${userRole}/activities/rate/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("jwt")}`,
          },
          body: JSON.stringify({ rating: activityRating }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit activity rating");
      }

      const data = await response.json();
      setActivity((prevActivity) => ({
        ...prevActivity,
        rating: data.newRating,
      }));
      setShowRatingDialog(false);

      window.location.reload();
    } catch (error) {
      console.error("Error submitting activity rating:", error);
    }
  };

  // Comment Carousel Functions
  const handlePrevComment = () =>
    setCurrentCommentIndex((prev) => Math.max(0, prev - 3));
  const handleNextComment = () =>
    setCurrentCommentIndex((prev) =>
      Math.min(activity.comments.length - 3, prev + 3)
    );

  const handleAddReview = async () => {
    try {
      const token = Cookies.get("jwt");
      let username = newReview.isAnonymous ? "Anonymous" : "User";

      const newComment = {
        username,
        rating: newReview.rating,
        content: {
          liked: newReview.liked,
          disliked: newReview.disliked,
        },
        date: new Date(),
      };

      const response = await fetch(
        `http://localhost:4000/${userRole}/activities/comment/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newComment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const data = await response.json();

      setShowAddReview(false);
      window.location.reload();
      setNewReview({
        rating: 0,
        liked: "",
        disliked: "",
        visitDate: "",
        isAnonymous: false,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const isReviewValid = () => {
    return newReview.liked.trim() !== "" || newReview.disliked.trim() !== "";
  };

  const formatCommentDate = (date) => {
    // Check if the date is valid
    const commentDate = new Date(date);

    // Check if the date is valid
    if (isNaN(commentDate.getTime())) {
      return "Date unavailable"; // Return if the date is invalid
    }

    const now = new Date();
    const diffInDays = Math.floor((now - commentDate) / (1000 * 60 * 60 * 24));

    if (diffInDays < 30) {
      return formatDistanceToNow(commentDate, { addSuffix: true });
    } else {
      return format(commentDate, "MMM d, yyyy");
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

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">No activity found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1a202c] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {activity.name}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-[2] bg-white shadow-md rounded-lg p-8 flex flex-col justify-center h-full">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-bold">{activity.name}</h1>
                <div className="flex items-center">
                  {/* Rating Badge */}
                  <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                    <Star className="w-8 h-8 text-yellow-500 mr-2" />
                    <span className="text-2xl font-semibold">
                      {activity.rating ? activity.rating.toFixed(1) : "N/A"}
                    </span>
                  </div>

                  {/* Rating Count outside the badge */}
                  <span className="text-sm font-normal ml-2">
                    {activity.allRatings
                      ? `(${activity.allRatings.length})`
                      : "(0)"}
                  </span>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-1 space-y-4"></div>
                <div className="lg:w-2/3">
                  <ImageGallery pictures={activity.pictures} />
                  <div className="h-6"></div>
                  <p className="text-lg text-gray-600 mb-6">
                    {activity.description}
                  </p>
                </div>

                <div className="lg:w-1/3 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div>
                        <div className="bg-red-600 text-white text-sm font-bold px-3 py-2 rounded mb-2 inline-block">
                          Limited time deal
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900">
                              $
                              {calculateDiscountedPrice(
                                activity.price,
                                activity.specialDiscount
                              )}
                            </span>
                            <span className="ml-3  text-xl font-semibold text-red-600">
                              -{activity.specialDiscount}% Discount
                            </span>
                          </div>
                          <div className="text-xl text-gray-500 line-through mt-2">
                            ${activity.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Location: {activity.location.address}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Date: {new Date(activity.timing).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-500" />
                      <span className="text-gray-700">
                        Time:{" "}
                        {new Date(activity.timing).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>



                    <div>
                    <ToastProvider>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        onClick={handleCopyLink}
                        className="flex items-center justify-start px-4 py-2 hover:text-green-500"
                      >
                        <Link className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleEmailShare}
                        className="flex items-center justify-start px-4 py-2 hover:text-green-500"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Share by Email
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <ToastViewport />

                {isToastOpen && (
                  <Toast onOpenChange={setIsToastOpen} open={isToastOpen} duration={3000}> {/* Auto close after 3 seconds */}
                    <ToastTitle>Link Copied</ToastTitle>
                    <ToastDescription>
                      The link has been copied to your clipboard.
                    </ToastDescription>
                    <ToastClose />
                  </Toast>
                )}
              </ToastProvider>
                    </div>



                    <div className="flex items-center">
                      <Map
                        position={[
                          activity.location.coordinates.latitude,
                          activity.location.coordinates.longitude,
                        ]}
                        height="125px"
                        width="100%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-col gap-8">
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                <div className="flex items-center mb-6">
                  <Avatar className="w-12 h-12 mr-2">
                    <AvatarImage
                      src={advertiserProfile.logo}
                      alt={advertiserProfile.username}
                    />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-xl font-bold">Advertiser Profile</h1>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <User className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Advertiser:{" "}
                      {advertiserProfile
                        ? advertiserProfile.username
                        : "Loading..."}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Email:{" "}
                      {advertiserProfile
                        ? advertiserProfile.email
                        : "Loading..."}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-gray-700">
                      Hotline:{" "}
                      {advertiserProfile
                        ? advertiserProfile.hotline
                        : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
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
                        <span className="text-gray-500 italic">
                          No tags available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Carousel */}
          <div className="mt-8 relative bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">What our customers say</h2>
            {activity.comments && activity.comments.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={handlePrevComment}
                    variant="ghost"
                    disabled={currentCommentIndex === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <div className="flex-1 flex justify-between px-4">
                    {activity.comments
                      .slice(currentCommentIndex, currentCommentIndex + 3)
                      .map((comment, index) => (
                        <Card
                          key={index}
                          className="w-[30%] bg-gray-100 shadow-none border-none p-4 rounded-lg"
                        >
                          <CardHeader className="flex items-start">
                            <div className="flex">
                              {/* User icon with larger first letter */}
                              <div className="flex items-center justify-center w-12 h-12 bg-gray-300 text-gray-700 rounded-full mr-4 text-xl font-bold">
                                {comment.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                {/* Larger Username */}
                                <CardTitle className="text-xl font-semibold">
                                  {comment.username}
                                </CardTitle>
                                {/* Date under the username */}
                                <p className="text-sm text-gray-500">
                                  {formatCommentDate(comment.date)}
                                </p>
                              </div>
                            </div>
                            {/* Star Rating below username and date */}
                            <div className="mt-2">
                              <StarRating
                                rating={comment.rating}
                                readOnly={true}
                              />
                            </div>
                          </CardHeader>

                          <CardContent>
                            {/* Liked content */}
                            <p className="text-gray-700 line-clamp-3">
                              {comment.content.liked ||
                                comment.content.disliked ||
                                "No comment provided"}
                            </p>
                            {/* View more link */}
                            <a
                              href="#"
                              className="text-blue-500 hover:underline mt-2 inline-block"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowFullComment(comment);
                              }}
                            >
                              View more
                            </a>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  <Button
                    onClick={handleNextComment}
                    variant="ghost"
                    disabled={
                      currentCommentIndex >= activity.comments.length - 3
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </>
            ) : (
              <p>No comments yet.</p>
            )}
            {hasAttended && (
              <>
                <Button onClick={() => setShowAddReview(true)} className="mt-4">
                  Write a review
                </Button>
                <Button
                  onClick={() => setShowRatingDialog(true)}
                  className="mt-2 ml-3"
                >
                  Rate Activity
                </Button>
              </>
            )}
          </div>
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

        {userRole === 'tourist'  && activity.isBookingOpen && (<Button
        onClick={handleBookNowClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Book Now
      </Button>
        )}

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Activity: {activity.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tickets" className="text-right">
                Tickets
              </Label>
              <Input
                id="tickets"
                type="number"
                value={numberOfTickets}
                onChange={(e) => setNumberOfTickets(Math.max(1, parseInt(e.target.value)))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total Price</Label>
              <div className="col-span-3">${calculateTotalPrice()}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Payment Type</Label>
              <RadioGroup
                value={paymentType}
                onValueChange={setPaymentType}
                className="col-span-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CreditCard" id="CreditCard" />
                  <Label htmlFor="CreditCard">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DebitCard" id="DebitCard" />
                  <Label htmlFor="DebitCard">Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Wallet" id="Wallet" />
                  <Label htmlFor="Wallet">Wallet</Label>
                </div>
              </RadioGroup>
            </div>
            {bookingError && (
              <div className="text-red-500 text-sm">{bookingError}</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBookingDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleBooking} disabled={isBooking}>
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      {/* Flexbox container to align icon and title horizontally */}
      <div className="flex items-center">
        {/* Check Circle Icon */}
        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
        {/* Title */}
        <DialogTitle>Booking Successful</DialogTitle>
      </div>
    </DialogHeader>
    
    <div className="py-4">
      <p>You have successfully booked {numberOfTickets} ticket(s) for {activity.name}.</p>
    </div>
    
    <DialogFooter>
      <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      </div>

      {/* Full Comment Dialog */}
      <Dialog
        open={!!showFullComment}
        onOpenChange={() => setShowFullComment(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{showFullComment?.username}'s Review</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-auto">
            <div className="space-y-4">
              <div>
                <StarRating rating={showFullComment?.rating} readOnly={true} />
                <p className="text-sm text-gray-500 mt-1">
                  {showFullComment && formatCommentDate(showFullComment.date)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold flex items-center">
                  <Smile className="w-5 h-5 mr-2 text-green-500" />
                  Liked:
                </h4>
                <p>{showFullComment?.content?.liked || "Nothing mentioned"}</p>
              </div>
              <div>
                <h4 className="font-semibold flex items-center">
                  <Frown className="w-5 h-5 mr-2 text-red-500" />
                  Disliked:
                </h4>
                <p>
                  {showFullComment?.content?.disliked || "Nothing mentioned"}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Rating
              </label>
              <StarRating
                rating={newReview.rating}
                setRating={(rating) =>
                  setNewReview((prev) => ({ ...prev, rating }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="liked"
                className="block text-sm font-medium text-gray-700"
              >
                <Smile className="w-5 h-5 inline mr-2 text-green-500" />
                Something you liked
              </label>
              <Textarea
                id="liked"
                value={newReview.liked}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, liked: e.target.value }))
                }
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <label
                htmlFor="disliked"
                className="block text-sm font-medium text-gray-700"
              >
                <Frown className="w-5 h-5 inline mr-2 text-red-500" />
                Something you didn't like
              </label>
              <Textarea
                id="disliked"
                value={newReview.disliked}
                onChange={(e) =>
                  setNewReview((prev) => ({
                    ...prev,
                    disliked: e.target.value,
                  }))
                }
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <label
                htmlFor="visitDate"
                className="block text-sm font-medium text-gray-700"
              >
                When did you visit?
              </label>
              <select
                id="visitDate"
                value={newReview.visitDate}
                onChange={(e) =>
                  setNewReview((prev) => ({
                    ...prev,
                    visitDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a time</option>
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
                <option value="holiday">Public holiday</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-mode"
                checked={newReview.isAnonymous}
                onCheckedChange={(checked) =>
                  setNewReview((prev) => ({ ...prev, isAnonymous: checked }))
                }
              />
              <Label htmlFor="anonymous-mode">Post anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowAddReview(false);
                setNewReview({
                  rating: 0,
                  liked: "",
                  disliked: "",
                  visitDate: "",
                  isAnonymous: false,
                });
              }}
              style={{
                marginLeft: "10px",
                backgroundColor: "#D3D3D3",
                color: "black",
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddReview} disabled={!isReviewValid()}>
              Post Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Activity Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate this Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Your Rating
            </label>
            <StarRating rating={activityRating} setRating={setActivityRating} />
          </div>
          <DialogFooter>
            <Button onClick={handleActivityRating}>Submit My Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
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
