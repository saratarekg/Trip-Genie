import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  User,
  AtSign,
  Flag,
  Calendar,
  Wallet,
  GraduationCap,
  Award,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import { ImageCropper } from "@/components/ImageCropper";
import { X } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import zIndex from "@mui/material/styles/zIndex";

// Custom validator for mobile number
const phoneValidator = (value) => {
  console.log(value);
  const phoneNumber = parsePhoneNumberFromString("+" + value);
  return phoneNumber ? phoneNumber.isValid() : false;
};

const ImageViewer = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="w-full h-full relative flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/40 to-transparent absolute top-0 left-0 right-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt="Full screen view"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const Modal = ({ show, onClose, children, isImageViewer = false, imageUrl = "" }) => {
  if (!show) return null;

  if (isImageViewer) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Full screen view"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          X
        </button>
        {children}
      </div>
    </div>
  );
};
export function TouristProfileComponent() {
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTourist, setEditedTourist] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});
  const [nationalities, setNationalities] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);



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
        setEditedTourist(response.data);
        setSelectedImage(response.data.profilePicture);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTouristProfile();
  }, []);

  const openModal = () => {
    setModalOpen(true);
    setDropdownOpen(false); // Close the dropdown when opening the modal
  };

  // const closeModal = () => {
  //   setModalOpen(false);
  // };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const fetchExchangeRate = useCallback(async () => {
    if (tourist) {
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `http://localhost:4000/tourist/populate`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base: "withEGP",
              target: tourist.preferredCurrency,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setExchangeRate(data.conversion_rate);
        } else {
          console.error('Error in fetching exchange rate:', data.message);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    }
  }, [tourist]);

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(`http://localhost:4000/tourist/getCurrency/${tourist.preferredCurrency}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrencySymbol(response.data.symbol);
    } catch (error) {
      console.error("Error fetching currency symbol:", error);
    }
  }, [tourist]);

  const formatWallet = (price) => {
    fetchExchangeRate();
    getCurrencySymbol();
    if (tourist && exchangeRate && currencySymbol) {
      const exchangedPrice = price * exchangeRate;
      return `${currencySymbol}${exchangedPrice.toFixed(2)}`;
    }
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
    console.log("newImage");
  };
  const handleFirstSave = () => {
    setSelectedImage(newImage);
    setShowModal(false);

  };

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
    setEditedTourist((prev) => ({ ...prev, [name]: value }));
    setValidationMessages((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNationalityChange = (value) => {
    setEditedTourist((prev) => ({ ...prev, nationality: value }));
    setValidationMessages((prev) => ({ ...prev, nationality: "" }));
  };

  const handleDiscard = () => {
    setEditedTourist(tourist);
    setIsEditing(false);
  };

  const validateFields = () => {
    const { email, mobile, nationality, jobOrStudent } = editedTourist;
    const messages = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!nationality) messages.nationality = "Nationality is required.";
    if (!jobOrStudent)
      messages.jobOrStudent = "Job or student status is required.";

    setValidationMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      editedTourist.mobile = "+" + editedTourist.mobile;
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const api = `http://localhost:4000/${role}`;
      const response = await axios.put(api, editedTourist, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setTourist(response.data.tourist);
        setIsEditing(false);
        setError("");
      }
    } catch (err) {
      if (err.response?.data?.message === "Email already exists") {
        setValidationMessages({ email: "Email already exists" });
      } else {
        setError(err.message);
      }
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

  if (!tourist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No tourist profile information is available.
        </p>
      </div>
    );
  }

  const getBadgeColor = () => {
    switch (tourist.loyaltyBadge) {
      case "Bronze":
        return "bg-amber-600 text-white";
      case "Silver":
        return "bg-gray-400 text-white";
      case "Gold":
        return "bg-yellow-400 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div >


      <div className="p-8">
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="flex-shrink-0 relative">
            <button
              className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              onClick={toggleDropdown}
              disabled={!isEditing}
            >
              {selectedImage ? (selectedImage.public_id ? (<img src={selectedImage.url} alt="User" className="w-20 h-20 rounded-full" />) : (<img src={selectedImage} alt="User" className="w-20 h-20 rounded-full" />))
                : (
                  <User className="w-12 h-12 text-white" />
                )}            </button>

            <div className="absolute top-full mt-2 left-0 bg-white  rounded-lg shadow-lg z-10 w-32">
              <Modal show={showModal} onClose={closeModal}>
                <h2 className="text-lg font-bold mb-4">Update Profile Picture</h2>
                <ImageCropper onImageCropped={handleImageCropped} currentImage={selectedImage ? (selectedImage.public_id ? selectedImage.url : (selectedImage)) : null} />
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
                  {tourist.profilePicture && (
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

                  <div>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={handleUpdateClick}
                    >
                      Update
                    </li>
                  </div>
                  {tourist.profilePicture && (

                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                      onClick={() => console.log("Delete user")}
                    >
                      Delete
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow">
            <h2 className="text-3xl font-bold mb-1">{tourist.username}</h2>
            <div className="flex items-center gap-2 mb-4">
              <AtSign className="w-4 h-4 text-gray-500" />
              <p className="text-2xl font-semibold">{tourist.username}</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Badge
              className={`${getBadgeColor()} hover:${getBadgeColor()} px-3 py-2 text-xl font-semibold rounded-full flex items-center gap-2`}
            >
              <Award className="w-6 h-6" />
              {tourist.loyaltyBadge}
            </Badge>
          </div>

          {/* {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              <User className="w-24 h-24 text-white" />
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )} */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <Input
                  type="email"
                  name="email"
                  value={editedTourist.email}
                  onChange={handleInputChange}
                  className={validationMessages.email ? "border-red-500" : ""}
                  placeholder="Email"
                />
              ) : (
                <span>{tourist.email}</span>
              )}
            </div>
            {validationMessages.email && (
              <span className="text-red-500 text-sm">
                {validationMessages.email}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="w-full" style={{ zIndex: 0 }}>
                  <PhoneInput
                    style={{ zIndex: 0 }}
                    country={"eg"}
                    value={editedTourist.mobile}
                    onChange={handleInputChange}
                    excludeCountries={["il"]}
                    inputProps={{
                      name: "mobile",
                      required: true,
                      placeholder: tourist.mobile,
                      className: `w-full p-2 ${validationMessages.mobile
                        ? "border-red-500"
                        : "border-gray-300"
                        }`,
                    }}
                    containerClass="w-full"
                    inputStyle={{ width: "60%", marginLeft: "45px" }}
                  />
                </div>
              ) : (
                <span>{tourist.mobile}</span>
              )}
            </div>
            {validationMessages.mobile && (
              <span className="text-red-500 text-sm">
                {validationMessages.mobile}
              </span>
            )}
          </div>

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
                    <SelectValue placeholder={tourist.nationality.name} />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nat) => (
                      <SelectItem key={nat._id} value={nat._id}>
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
                {tourist.nationality
                  ? tourist.nationality.name
                  : "Nationality not set"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{new Date(tourist.dateOfBirth).toLocaleDateString()}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <Input
                  type="jobOrStudent"
                  name="jobOrStudent"
                  value={editedTourist.jobOrStudent}
                  onChange={handleInputChange}
                  // className={validationMessages.email ? "border-red-500" : ""}
                  placeholder="Occupation/Student"
                />
              ) : (
                <span>{tourist.jobOrStudent}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <span>{formatWallet(tourist.wallet)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span>{tourist.loyaltyPoints.toLocaleString()} points</span>
          </div>
        </div>

        <div className="mt-6">
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleUpdate} variant="default">
                Save Changes
              </Button>
              <Button onClick={handleDiscard} variant="destructive">
                Discard Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="default">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      <Modal
        show={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        isImageViewer={true}
        imageUrl={selectedImage?.url || selectedImage}
      />
    </div>
  );
}
