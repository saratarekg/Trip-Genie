import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Flag from 'react-world-flags';
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  User,
  AtSign,

  Calendar,
  Wallet,
  GraduationCap,
  Award,
  Star,
  BriefcaseBusiness,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import { ImageCropper } from "@/components/ImageCropper";
import { X, ZoomIn, ZoomOut } from "lucide-react";
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
import { Modal } from "@/components/Modal";

const convertUrlToBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

// Custom validator for mobile number
const phoneValidator = (value) => {
  console.log("value", value);
  const phoneNumber = parsePhoneNumberFromString("+" + value);
  return phoneNumber ? phoneNumber.isValid() : false;
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
  const [base64Image, setBase64Image] = useState(null);

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
        response.data.mobile = response.data.mobile.slice(1);
        console.log("response.data", response.data);
        setTourist(response.data);
        setEditedTourist(response.data);
        setSelectedImage(response.data.profilePicture);

        if (response.data.profilePicture && response.data.profilePicture.url) {
          convertUrlToBase64(response.data.profilePicture.url).then((res) => {
            setBase64Image(res);
          });
        }
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
        const response = await fetch(`http://localhost:4000/tourist/populate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base: "67140446ee157ee4f239d523",
            target: tourist.preferredCurrency,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setExchangeRate(data.conversion_rate);
        } else {
          console.error("Error in fetching exchange rate:", data.message);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    }
  }, [tourist]);

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/tourist/getCurrency/${tourist.preferredCurrency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    setSelectedImage(tourist.profilePicture)
    setDropdownOpen(false);
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
      console.log("editedTourist", editedTourist);
      const finalTourist = { ...editedTourist };
      finalTourist.mobile = "+" + editedTourist.mobile;
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const api = `http://localhost:4000/${role}`;
      finalTourist.profilePicture = selectedImage;
      setDropdownOpen(false);

      const response = await axios.put(api, finalTourist, {
        headers: { Authorization: `Bearer ${token}` },
      });
      response.data.tourist.mobile = response.data.tourist.mobile.slice(1);

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
        return "bg-amber-600 text-white hover:bg-amber-600 hover:text-white";
      case "Silver":
        return "bg-gray-400 text-white hover:bg-gray-400 hover:text-white";
      case "Gold":
        return "bg-yellow-400 text-white hover:bg-yellow-400 hover:text-white";
      default:
        return "bg-gray-200 text-gray-800 hover:bg-gray-200 hover:text-gray-800";
    }
  };

  return (
    <div className="bg-beige-100 min-h-screen py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-8">
        {/* Profile Image Section */}
        <div className="flex justify-center mb-8 relative">
          <button
            className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden shadow-xl flex justify-center items-center"
            onClick={toggleDropdown}
            disabled={!selectedImage && !isEditing}
          >
            {selectedImage ? (
              selectedImage.public_id ? (
                <img
                  src={selectedImage.url}
                  alt="User"
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="User"
                  className="w-32 h-32 rounded-full"
                />
              )
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </button>
          <div className="absolute top-full mt-2 left-0 bg-white  rounded-lg shadow-lg z-10 w-32">
            <Modal show={showModal} onClose={closeModal}>
              <h2 className="text-lg font-bold mb-4">Update Profile Picture</h2>
              <ImageCropper
                onImageCropped={handleImageCropped}
                currentImage={
                  selectedImage
                    ? selectedImage.public_id
                      ? base64Image
                      : selectedImage
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

          {/* Camera Icon */}
          {isEditing && (
            <div className="absolute top-20 left-0.4  bg-white p-1 rounded-full shadow-md cursor-pointer">
              <Camera
                className="w-5 h-5 text-gray-600"
                style={{ cursor: "pointer" }}
                onClick={toggleDropdown}
              />
            </div>
          )}

          {/* Dropdown Menu (View, Update, Delete) */}
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 top-15 left-0.4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
              <ul className="py-2">
                {selectedImage && (
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
                {isEditing && selectedImage && (
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                    onClick={() => {
                      setSelectedImage(null);
                      setDropdownOpen(false);
                    }}
                  >
                    Delete
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-black-600">
            {tourist.username}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <AtSign className="w-4 h-4 text-gray-500" />
            <p className="text-lg font-semibold text-black-600">
              {tourist.username}
            </p>
          </div>
        </div>

        {/* Badge Section */}
        <div className="text-center mb-6">
          <Badge
            className={`${getBadgeColor()} px-3 py-1 text-lg font-semibold rounded-full inline-flex items-center gap-2 cursor-default`}
          >
            <Award className="w-5 h-5" />
            {tourist.loyaltyBadge}
          </Badge>
        </div>

        {/* Dividing sections */}
        <div className="space-y-8">
          {/* Contact Info Section */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-black-600">
              Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="email" className="font-semibold text-teal-600">
                  Email
                </label>
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
                {validationMessages.email && (
                  <span className="text-red-500 text-sm">
                    {validationMessages.email}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="mobile" className="font-semibold text-teal-600">
                  Phone Number
                </label>
                {isEditing ? (
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
                      className: `w-full p-2 ${
                        validationMessages.mobile
                          ? "border-red-500"
                          : "border-gray-300"
                      }`,
                    }}
                    className="w-full"
                    inputStyle={{ width: "60%", marginLeft: "45px" }}
                  />
                ) : (
                  <span>{tourist.mobile}</span>
                )}
                {validationMessages.mobile && (
                  <span className="text-red-500 text-sm">
                    {validationMessages.mobile}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-black-600">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <label htmlFor="dob" className="font-semibold text-teal-600">
                    Date of Birth
                  </label>
                  <span>
                    {new Date(tourist.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
  <label htmlFor="nationality" className="font-semibold text-teal-600">
    Nationality
  </label>
  {isEditing ? (
    <div className="flex flex-col w-full">
      <Select onValueChange={handleNationalityChange}>
        <SelectTrigger
          className={validationMessages.nationality ? "border-red-500" : ""}
        >
          <SelectValue placeholder={tourist.nationality.name} />
        </SelectTrigger>
        <SelectContent>
          {nationalities.map((nat) => (
            <SelectItem key={nat._id} value={nat._id}>
              {/* Display the flag next to the nationality name */}
              <div className="flex items-center gap-2">
                <Flag code={nat.countryCode} style={{
    width: 25,
    height: 17,
    borderRadius: '4px',  // Adds rounded corners to the flag
    overflow: 'hidden',   // Ensures the image content is clipped to the border radius
  }} />
                {nat.name}
              </div>
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
    <div className="flex items-center gap-2">
<Flag
  code={tourist.nationality.countryCode}
  style={{
    width: 30,
    height: 20,
    borderRadius: '4px',  // Adds rounded corners to the flag
    overflow: 'hidden',   // Ensures the image content is clipped to the border radius
  }}
/>
      <span>{tourist.nationality ? tourist.nationality.name : "Nationality not set"}</span>
    </div>
  )}
</div>
            </div>
          </div>

          {/* Account Status Section */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-black-600">
              Account Status
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="wallet" className="font-semibold text-teal-600">
                Wallet Balance
              </label>
              <span>{formatWallet(tourist.wallet)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="loyaltyPoints"
                className="font-semibold text-teal-600"
              >
                Loyalty Points
              </label>
              <span>{tourist.loyaltyPoints.toLocaleString()} points</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleUpdate}
                className="w-32 bg-orange-500 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleDiscard}
                className="w-32 bg-gray-500 text-white"
              >
                Discard
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center  py-2 bg-[#F88C33] text-white rounded-md hover:bg-orange-500 transition duration-300 ease-in-out mb-4"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Image Viewer Modal */}
        <Modal
          show={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          isImageViewer={true}
          imageUrl={selectedImage?.url || selectedImage}
        />
      </div>
    </div>
  );
}
