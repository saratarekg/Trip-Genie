import React, { useEffect, useState } from "react";
// import { ObjectId } from "mongodb";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  XCircle,
  CheckCircle,
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  AtSign,
  Briefcase,
  Flag,
  Plus,
  DollarSign,
  Globe,
  Accessibility,
  Star,
  Edit,
  Trash2,
  Award,
  Clock,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Send,
  Tag,
  Smile,
  Frown,
} from "lucide-react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { ImageCropper } from "@/components/ImageCropper";
import { Modal } from "@/components/Modal";

const phoneValidator = (value) => {
  // Check if the input starts with a "+"

  const phoneNumber = parsePhoneNumberFromString("+" + value);

  if (!phoneNumber || !phoneNumber.isValid()) {
    return false;
  }
  return true;
};

const convertUrlToBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
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

export function TourGuideProfileComponent() {
  const [tourGuide, setTourGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTourGuide, setEditedTourGuide] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [currentWork, setCurrentWork] = useState({
    title: "",
    company: "",
    duration: "",
    description: "",
  });
  const [nationalities, setNationalities] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [showFullComment, setShowFullComment] = useState(false);
  const [base64Image, setBase64Image] = useState(null);

  const handlePrevComment = () =>
    setCurrentCommentIndex((prev) => Math.max(0, prev - 3));
  const handleNextComment = () =>
    setCurrentCommentIndex((prev) =>
      Math.min(tourGuide.comments.length - 3, prev + 3)
    );
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

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    const fetchTourGuideProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();

        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        response.data.mobile = response.data.mobile.slice(1); // Remove the "+" sign from the mobile number
        setTourGuide(response.data);
        setEditedTourGuide(response.data);
        setProfilePicture(response.data.profilePicture);
        convertUrlToBase64(response.data.profilePicture.url).then((base64) => {
          setBase64Image(base64);
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourGuideProfile();
  }, []);

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/nationalities"
        );
        setNationalities(response.data);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
      }
    };
    fetchNationalities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } =
      e && e.target ? e.target : { name: "mobile", value: e };
    setEditedTourGuide((prev) => ({ ...prev, [name]: value }));
    setValidationMessages((prev) => ({ ...prev, [name]: "" }));
  };

  // const handlePictureUpload = (e) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setProfilePicture(reader.result);
  //       setEditedTourGuide((prev) => ({
  //         ...prev,
  //         profilePicture: reader.result,
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleNationalityChange = (value) => {
    // const objectId = new ObjectId(value); // Convert string to ObjectId
    setEditedTourGuide((prev) => ({ ...prev, nationality: value }));
    setValidationMessages((prev) => ({ ...prev, nationality: "" }));
  };

  const handleDiscard = () => {
    setEditedTourGuide(tourGuide);
    setProfilePicture(tourGuide.profilePicture);
    setDropdownOpen(false);
    setIsEditing(false);
  };

  const validateFields = () => {
    const { name, username, email, mobile, yearsOfExperience, nationality } =
      editedTourGuide;
    const messages = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{7,15}$/;

    if (!name) messages.name = "Name is required.";
    if (!username) messages.username = "Username is required.";
    if (!email) {
      messages.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      messages.email = "Invalid email format.";
    }
    if (!mobile) {
      messages.mobile = "Phone number is required.";
    } else if (!phoneValidator(mobile)) {
      messages.mobile = "Invalid phone number.";
    }
    if (yearsOfExperience === undefined || yearsOfExperience === null) {
      messages.yearsOfExperience = "Years of experience is required.";
    } else if (yearsOfExperience < 0 || yearsOfExperience > 50) {
      messages.yearsOfExperience =
        "Years of experience must be between 0 and 50.";
    }
    if (!nationality) messages.nationality = "Nationality is required.";

    setValidationMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();
      //const formattedMobile = mobile.startsWith("+") ? mobile : "+" + mobile;
      const {
        username,
        email,
        mobile, // Destructure mobile as it is
        yearsOfExperience,
        nationality,
        name,
        previousWorks,
      } = editedTourGuide;

      setDropdownOpen(false);

      // Modify the mobile field in the editedTourGuide object directly

      const formData = new FormData();
      formData.append("name", name);
      profilePicture && formData.append("profilePicture", profilePicture);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("mobile", "+" + mobile);
      formData.append("yearsOfExperience", yearsOfExperience);
      formData.append("nationality", nationality._id);
      formData.append("previousWorks", JSON.stringify(previousWorks));

      const api = `http://localhost:4000/${role}`;
      const response = await axios.put(api, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setTourGuide(response.data.tourGuide);
        setIsEditing(false);
        setError("");
      }
    } catch (err) {
      if (err.response?.data?.message === "Email already exists") {
        setValidationMessages({ email: "Email already exists" });
      } else if (err.response?.data?.message === "Username already exists") {
        setValidationMessages({ username: "Username already exists" });
      } else {
        setError(err.message);
      }
    }
  };

  const handleAddWork = () => {
    setCurrentWork({ title: "", company: "", duration: "", description: "" });
    setShowWorkDialog(true);
  };

  const handleEditWork = (index) => {
    setCurrentWork(editedTourGuide.previousWorks[index]);
    setShowWorkDialog(true);
  };

  const handleRemoveWork = (index) => {
    const newWorks = [...editedTourGuide.previousWorks];
    newWorks.splice(index, 1);
    setEditedTourGuide((prev) => ({ ...prev, previousWorks: newWorks }));
  };

  const handleSaveWork = () => {
    if (currentWork.title && currentWork.company && currentWork.duration) {
      const newWorks = [...(editedTourGuide.previousWorks || [])];
      const existingIndex = newWorks.findIndex(
        (w) =>
          w.title === currentWork.title && w.company === currentWork.company
      );
      if (existingIndex !== -1) {
        newWorks[existingIndex] = currentWork;
      } else {
        newWorks.push(currentWork);
      }
      setEditedTourGuide((prev) => ({ ...prev, previousWorks: newWorks }));
      setShowWorkDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!tourGuide) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No tour guide profile information is available.
        </p>
      </div>
    );
  }

  const openModal = () => {
    setModalOpen(true);
    setDropdownOpen(false); // Close the dropdown when opening the modal
  };

  const handleUpdateClick = () => {
    setShowModal(true);
    setDropdownOpen(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalOpen(false);
    setImageModalOpen(false);
  };
  const handleImageCropped = (newImage) => {
    setNewImage(newImage);
  };
  const handleFirstSave = () => {
    setProfilePicture(newImage);
    setShowModal(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  return (
    <div>
      <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Changed max-w-3xl to max-w-4xl */}
        <div className="p-8">
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 relative">
              <button
                className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                onClick={toggleDropdown}
                disabled={!profilePicture && !isEditing}
              >
                {profilePicture ? (
                  profilePicture.public_id ? (
                    <img
                      src={profilePicture.url}
                      alt="User"
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <img
                      src={profilePicture}
                      alt="User"
                      className="w-20 h-20 rounded-full"
                    />
                  )
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </button>

              <div className="absolute top-full mt-2 left-0 bg-white  rounded-lg shadow-lg z-10 w-32">
                <Modal show={showModal} onClose={closeModal}>
                  <h2 className="text-lg font-bold mb-4">
                    Update Profile Picture
                  </h2>
                  <ImageCropper
                    onImageCropped={handleImageCropped}
                    currentImage={
                      profilePicture
                        ? profilePicture.public_id
                          ? base64Image
                          : profilePicture
                        : null
                    }
                  />
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleFirstSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Save
                    </Button>

                    <Button
                      onClick={closeModal}
                      className="px-4 py-2 ml-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                    >
                      Close
                    </Button>
                  </div>
                </Modal>
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
                  <ul className="py-2">
                    {profilePicture && (
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setIsImageViewerOpen(true);

                          setDropdownOpen(false);
                        }}
                      >
                        View
                      </li>
                    )}

                    {isEditing && (
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleUpdateClick}
                      >
                        Update
                      </li>
                    )}
                    {isEditing && profilePicture && (
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                        onClick={() => {
                          setProfilePicture(null);
                        }}
                      >
                        Delete
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div>
              {isEditing ? (
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    value={editedTourGuide.name}
                    onChange={handleInputChange}
                    className={`text-3xl font-bold mb-1 border rounded px-2 py-1 ${
                      validationMessages.name ? "border-red-500" : ""
                    }`}
                    placeholder="Full Name"
                  />
                  {validationMessages.name && (
                    <span className="text-red-500 text-sm">
                      {validationMessages.name}
                    </span>
                  )}
                </div>
              ) : (
                <h2 className="text-3xl font-bold mb-1">
                  {editedTourGuide.name}
                </h2>
              )}
              <div className="flex items-center gap-2 mb-4">
                <AtSign className="w-4 h-4 text-gray-500" />
                {isEditing ? (
                  <div className="flex flex-col">
                    <Input
                      type="text"
                      name="username"
                      value={editedTourGuide.username}
                      onChange={handleInputChange}
                      className={
                        validationMessages.username ? "border-red-500" : ""
                      }
                      placeholder="Username"
                    />
                    {validationMessages.username && (
                      <span className="text-red-500 text-sm">
                        {validationMessages.username}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-2xl font-semibold">{tourGuide.username}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Email Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={editedTourGuide.email}
                    onChange={handleInputChange}
                    className={validationMessages.email ? "border-red-500" : ""}
                    placeholder="Email"
                  />
                ) : (
                  <span>{tourGuide.email}</span>
                )}
              </div>
              {validationMessages.email && (
                <span className="text-red-500 text-sm">
                  {validationMessages.email}
                </span>
              )}
            </div>

            {/* Mobile Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {isEditing ? (
                  <div className="w-full">
                    <PhoneInput
                      country={"eg"}
                      value={editedTourGuide.mobile}
                      onChange={handleInputChange}
                      excludeCountries={["il"]}
                      inputProps={{
                        name: "mobile",
                        required: true,
                        placeholder: tourGuide.mobile,
                        className: `w-full p-2 ${
                          validationMessages.mobile
                            ? "border-red-500"
                            : "border-gray-300"
                        }`,
                      }}
                      containerClass="w-full"
                      inputStyle={{ width: "60%", marginLeft: "45px" }}
                    />
                  </div>
                ) : (
                  <span>{tourGuide.mobile}</span>
                )}
              </div>
              {validationMessages.mobile && (
                <span className="text-red-500 text-sm">
                  {validationMessages.mobile}
                </span>
              )}
            </div>

            {/* Years of Experience Section */}
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col">
                  <Input
                    type="number"
                    name="yearsOfExperience"
                    value={editedTourGuide.yearsOfExperience}
                    onChange={handleInputChange}
                    className={
                      validationMessages.yearsOfExperience
                        ? "border-red-500"
                        : ""
                    }
                    placeholder="Years of Experience"
                  />
                  {validationMessages.yearsOfExperience && (
                    <span className="text-red-500 text-sm">
                      {validationMessages.yearsOfExperience}
                    </span>
                  )}
                </div>
              ) : (
                <span>{tourGuide.yearsOfExperience} years of experience</span>
              )}
            </div>

            {/* Nationality Section */}
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col w-full">
                  <Select onValueChange={handleNationalityChange}>
                    <SelectTrigger
                      className={
                        validationMessages.nationality ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder={tourGuide.nationality.name} />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((nat) => (
                        <SelectItem key={nat._id} value={nat}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationMessages.nationality && (
                    <span className="text-red-500 text-sm">
                      {validationMessages.nationality}
                    </span>
                  )}
                </div>
              ) : (
                <span>
                  {tourGuide.nationality
                    ? tourGuide.nationality.name
                    : "Nationality not set"}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Star className="w-6 h-6 text-yellow-500 " />
              <span className="ml-2">{tourGuide.rating.toFixed(1)} / 5.0</span>
            </div>

            {/* Account Status Section */}
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  tourGuide.isAccepted
                    ? "bg-green-100 text-green-800 text-lg"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <CheckCircle className="inline w-4 h-4 mr-1" />
                {tourGuide.isAccepted ? "Account Accepted" : "Account Pending"}
              </span>
            </div>
          </div>

          {/* Previous Work Experience Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Previous Work Experience</h3>
            {editedTourGuide.previousWorks &&
              editedTourGuide.previousWorks.map((work, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <h4 className="font-semibold">{work.title}</h4>
                  <p>{work.company}</p>
                  <p>{work.duration}</p>
                  {work.description && (
                    <p className="text-gray-600">{work.description}</p>
                  )}
                  {isEditing && (
                    <div className="mt-2">
                      <Button
                        onClick={() => handleEditWork(index)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleRemoveWork(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            {isEditing && (
              <Button
                onClick={handleAddWork}
                variant="outline"
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Work Experience
              </Button>
            )}
          </div>

          {/* Buttons for Saving and Discarding Changes */}
          <div className="mt-6">
            {isEditing ? (
              <div className="flex flex-col gap-4">
                {/* <div>
                  <label
                    htmlFor="picture-upload"
                    className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Upload Logo
                  </label>
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </div> */}
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} variant="default">
                    Save Changes
                  </Button>
                  <Button onClick={handleDiscard} variant="destructive">
                    Discard Changes
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="default">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <div className="mt-8 relative bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {tourGuide.comments && tourGuide.comments.length > 0 ? (
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
                  {tourGuide.comments
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
                    currentCommentIndex >= tourGuide.comments.length - 3
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          ) : (
            <p>No comments yet.</p>
          )}
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
                    <StarRating
                      rating={showFullComment?.rating}
                      readOnly={true}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {showFullComment &&
                        formatCommentDate(showFullComment.date)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center">
                      <Smile className="w-5 h-5 mr-2 text-green-500" />
                      Liked:
                    </h4>
                    <p>
                      {showFullComment?.content?.liked || "Nothing mentioned"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center">
                      <Frown className="w-5 h-5 mr-2 text-red-500" />
                      Disliked:
                    </h4>
                    <p>
                      {showFullComment?.content?.disliked ||
                        "Nothing mentioned"}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={showWorkDialog} onOpenChange={setShowWorkDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentWork.title
                    ? "Edit Work Experience"
                    : "Add Work Experience"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={currentWork.title}
                    onChange={(e) =>
                      setCurrentWork((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={currentWork.company}
                    onChange={(e) =>
                      setCurrentWork((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={currentWork.duration}
                    onChange={(e) =>
                      setCurrentWork((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={currentWork.description}
                  onChange={(e) =>
                    setCurrentWork((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSaveWork}
                  disabled={
                    !currentWork.title ||
                    !currentWork.company ||
                    !currentWork.duration
                  }
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Modal
        show={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        isImageViewer={true}
        imageUrl={profilePicture?.url || profilePicture}
      />
    </div>
  );
}
