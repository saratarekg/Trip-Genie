import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios"; // Ensure axios is installed
import * as jwtDecode from 'jwt-decode';
import {
  CheckCircle,
  XCircle,
  Star,
  Edit,
  Trash2,
  Mail,
  Phone,
  Award,
  Globe,
  Accessibility,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Info,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Smile,
  Frown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimelinePreviewComponent } from "@/components/timeline-preview";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 ${readOnly ? '' : 'cursor-pointer'} ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          onClick={() => !readOnly && setRating(star)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        />
      ))}
    </div>
  );
};

const TourguideProfileCard = ({ profile }) => (
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
          <Star className="w-6 h-6 text-yellow-500 " />
          <span className="ml-2">{profile.rating.toFixed(1)} / 5.0</span>
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
  const [rating, setRating] = useState(0);
  const [showRatingSubmit, setShowRatingSubmit] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 0,
    liked: '',
    disliked: '',
    visitDate: '',
    isAnonymous: false
  });
  const [username, setUsername] = useState('');
  const [showRateItineraryDialog, setShowRateItineraryDialog] = useState(false);
  const [itineraryRating, setItineraryRating] = useState(0);
  const [itineraryReview, setItineraryReview] = useState('');
  const [showFullComment, setShowFullComment] = useState(null);
  const [activityRating, setActivityRating] = useState(0);
  const [hasAttendedTourGuide, setHasAttendedTourGuide] = useState(false);
  const [hasAttendedItinerary, setHasAttendedItinerary] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAppropriate, setIsAppropriate] = useState(true); // Track the current status



  const navigate = useNavigate();


  const fetchUsername = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/${userRole}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch username');
      }
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  };
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleConfirmFlag = async () => {
    try {
      const updatedStatus = !isAppropriate; // Toggle status

      // Update the backend
      
      const token = Cookies.get("jwt");
      
      const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${itinerary._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({  appropriate: updatedStatus, }),
      });
      

      setIsAppropriate(updatedStatus); // Update state to reflect the new status
      setDialogOpen(false); // Close the dialog

    } catch (error) {
      console.error("Failed to update itinerary status:", error);
    }
  };

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
            languages: ['English', 'Spanish', 'French'],
            specialties: ['Historical Tours', 'Food Tours', 'Adventure Tours'],
          });
        }
        setIsAppropriate(data.appropriate);



        setActivities(data.activities);
        if (token) {
          const decodedToken = jwtDecode.jwtDecode(token);
          setCanModify(decodedToken.id === data.tourGuide._id);
         

          if (data.attended && Array.isArray(data.attended)) {
            data.attended.forEach(tourist => {
              console.log("Tourist:", tourist, "Tourist ID:", tourist._id);
            });

            setHasAttendedItinerary(data.attended.some(tourist => tourist === decodedToken.id));
          }


          if (data.tourGuide.attended && Array.isArray(data.tourGuide.attended)) {
            setHasAttendedTourGuide(data.tourGuide.attended.some(tourist => tourist === decodedToken.id));
          }
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
        if (response.status === 400 || response.status === 403) {
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

  const handleRating = (newRating) => {
    setRating(newRating);
    setShowRatingSubmit(true);
  };

  const submitRating = async () => {
    try {
      const response = await fetch(`http://localhost:4000/${userRole}/tourguide/rate/${tourGuideProfile._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
        body: JSON.stringify({ rating }),
      });
      if (!response.ok) throw new Error('Failed to submit rating');
      setShowRatingSubmit(false);
      window.location.reload();
      // Handle success (e.g., show a success message)
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const handleAddReview = async () => {
    try {
      const newComment = {
        username: newReview.isAnonymous ? 'Anonymous' : 'User',
        rating: newReview.rating,
        content: {
          liked: newReview.liked,
          disliked: newReview.disliked
        },
        date: new Date(),
      };
      console.log(newComment);
      const response = await fetch(`http://localhost:4000/${userRole}/tourguide/comment/${tourGuideProfile._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
        body: JSON.stringify(newComment),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      setShowAddReview(false);
      setNewReview({
        rating: 0,
        liked: "",
        disliked: "",
        visitDate: '',
        isAnonymous: false
      });
      window.location.reload();
      // Handle success (e.g., show a success message, refresh comments)
    } catch (error) {
      console.error('Error submitting review:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const isReviewValid = () => {
    return (newReview.liked.trim() !== '' || newReview.disliked.trim() !== '');
  };

  const handlePrevComment = () => {
    setCurrentCommentIndex(Math.max(0, currentCommentIndex - 3));
  };

  const handleNextComment = () => {
    setCurrentCommentIndex(Math.min(itinerary.comments.length - 3, currentCommentIndex + 3));
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
      return format(commentDate, 'MMM d, yyyy');
    }
  };

  const handleRateItinerary = async () => {
    try {
      const response = await fetch(`http://localhost:4000/${userRole}/itinerary/comment/${itinerary._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
        body: JSON.stringify({
          rating: itineraryRating,
          content: {
            liked: newReview.liked,
            disliked: newReview.disliked
          },
          isAnonymous: newReview.isAnonymous,
          date: new Date().toISOString(),
          username: newReview.isAnonymous ? 'Anonymous' : 'User'
        }),
      });
      if (!response.ok) throw new Error('Failed to submit itinerary rating');
      setShowRateItineraryDialog(false);
      setNewReview({
        rating: 0,
        liked: '',
        disliked: '',
        isAnonymous: false
      });
      setItineraryRating(0);
      window.location.reload();

      // Handle success (e.g., show a success message, refresh itinerary details)
    } catch (error) {
      console.error('Error submitting itinerary rating:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const handleActivityRating = async () => {
    try {
      const response = await fetch(`http://localhost:4000/${userRole}/itinerary/rate/${itinerary._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('jwt')}`,
        },
        body: JSON.stringify({
          rating: activityRating,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit activity rating');
      setShowRatingDialog(false);
      setActivityRating(0);
      window.location.reload();
      // Handle success (e.g., show a success message, refresh activity details)
    } catch (error) {
      console.error('Error submitting activity rating:', error);
      // Handle error (e.g., show an error message)
    }
  };



  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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
                        {itinerary.rating ? itinerary.rating.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <span className="text-sm font-normal ml-2">
                      {itinerary.allRatings ? `(${itinerary.allRatings.length})` : "(0)"}
                    </span>
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
                        Timeline: {itinerary.timeline}
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
                    <TimelinePreviewComponent />
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
            {userRole === "tourist" && hasAttendedTourGuide && hasAttendedItinerary && (
              <>
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Rate Tour Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StarRating rating={rating} setRating={handleRating} />
                    {showRatingSubmit && (
                      <Button onClick={submitRating} className="mt-4 mr-4">
                        Submit Rating
                      </Button>
                    )}
                    <Button onClick={() => setShowAddReview(true)} className="mt-4 ml-4">
                      Write a Review
                    </Button>
                  </CardContent>
                </Card>
              </>

            )}
            {userRole === "admin" && (
              <>
              <Button
                className={`w-4/5 mx-auto mt-2 text-white ${
                  isAppropriate
                    ? "bg-red-500 hover:bg-red-600" // Appropriate: Red Button
                    : "bg-green-500 hover:bg-green-600" // Inappropriate: Green Button
                }`}
                onClick={handleOpenDialog}
              >
                {isAppropriate ? "Flag as Inappropriate" : "Flag as Appropriate"}
              </Button>
        
              {dialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">Confirm Action</h2>
                      <p className="text-gray-600 mt-2">
                        Are you sure you want to change the status of this itinerary/event?
                      </p>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outlined"
                        onClick={handleCloseDialog}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        color="secondary"
                        onClick={handleConfirmFlag}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>

            )}

          </div>
        </div>

        <div className="mt-8 relative bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">What our customers say</h2>
          {itinerary.comments && itinerary.comments.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <Button onClick={handlePrevComment} variant="ghost" disabled={currentCommentIndex === 0}>
                  <ChevronLeft />
                </Button>
                <div className="flex-1 flex justify-between px-4">
                  {itinerary.comments.slice(currentCommentIndex, currentCommentIndex + 3).map((comment, index) => (
                    <Card key={index} className="w-[30%] bg-gray-100 shadow-none border-none p-4 rounded-lg">
                      <CardHeader className="flex items-start">
                        <div className="flex">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-300 text-gray-700 rounded-full mr-4 text-xl font-bold">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <CardTitle className="text-xl font-semibold">{comment.username}</CardTitle>
                            <p className="text-sm text-gray-500">{formatCommentDate(comment.date)}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <StarRating rating={comment.rating} readOnly={true} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 line-clamp-3">{comment.content.liked || comment.content.disliked || "No comment provided"}</p>
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
                  disabled={currentCommentIndex >= itinerary.comments.length - 3}
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          ) : (
            <p>No comments yet.</p>
          )}

          {userRole !== "admin" && hasAttendedItinerary && hasAttendedTourGuide && (
            <>
              <Button onClick={() => setShowRateItineraryDialog(true)} className="mt-4 mr-4">
                Add a Review
              </Button>
              <Button onClick={() => setShowRatingDialog(true)} className="mt-4">
                Add a Rating
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate this Itinerary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Your Rating</label>
            <StarRating rating={activityRating} setRating={setActivityRating} />
          </div>
          <DialogFooter>
            <Button onClick={handleActivityRating}>Submit My Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review for Tour Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Rating</label>
              <StarRating rating={newReview.rating} setRating={(rating) => setNewReview(prev => ({ ...prev, rating }))} />
            </div>
            <div>
              <label htmlFor="liked" className="block text-sm font-medium text-gray-700">
                <Smile className="w-5 h-5 inline mr-2 text-green-500" />
                Something you liked
              </label>
              <Textarea
                id="liked"
                value={newReview.liked}
                onChange={(e) => setNewReview(prev => ({ ...prev, liked: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <label htmlFor="disliked" className="block text-sm font-medium text-gray-700">
                <Frown className="w-5 h-5 inline mr-2 text-red-500" />
                Something you didn't like
              </label>
              <Textarea
                id="disliked"
                value={newReview.disliked}
                onChange={(e) => setNewReview(prev => ({ ...prev, disliked: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-mode"
                checked={newReview.isAnonymous}
                onCheckedChange={(checked) => setNewReview(prev => ({ ...prev, isAnonymous: checked }))}
              />
              <Label htmlFor="anonymous-mode">Post anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowAddReview(false)}
              style={{ marginLeft: '10px', backgroundColor: '#D3D3D3', color: 'black' }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddReview} disabled={!isReviewValid()}>Post Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRateItineraryDialog} onOpenChange={setShowRateItineraryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review for Itinerary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Rating</label>
              <StarRating rating={itineraryRating} setRating={setItineraryRating} />
            </div>
            <div>
              <label htmlFor="liked" className="block text-sm font-medium text-gray-700">
                <Smile className="w-5 h-5 inline mr-2 text-green-500" />
                Something you liked
              </label>
              <Textarea
                id="liked"
                value={newReview.liked}
                onChange={(e) => setNewReview(prev => ({ ...prev, liked: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <label htmlFor="disliked" className="block text-sm font-medium text-gray-700">
                <Frown className="w-5 h-5 inline mr-2 text-red-500" />
                Something you didn't like
              </label>
              <Textarea
                id="disliked"
                value={newReview.disliked}
                onChange={(e) => setNewReview(prev => ({ ...prev, disliked: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-mode"
                checked={newReview.isAnonymous}
                onCheckedChange={(checked) => setNewReview(prev => ({ ...prev, isAnonymous: checked }))}
              />
              <Label htmlFor="anonymous-mode">Post anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowRateItineraryDialog(false); // Hide the Add Review form
                setNewReview({
                  rating: 0,
                  liked: "",
                  disliked: "",
                  visitDate: '',
                  isAnonymous: false
                }); // Reset the new review form
              }}
              style={{ marginLeft: '10px', backgroundColor: '#D3D3D3', color: 'black' }}
            >
              Cancel
            </Button>

            <Button onClick={handleRateItinerary}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Dialog open={!!showFullComment} onOpenChange={() => setShowFullComment(null)}>
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
                <p>{showFullComment?.content?.disliked || "Nothing mentioned"}</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItineraryDetail;
