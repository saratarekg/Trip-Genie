"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, User, Phone, Globe, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "@/components/ImageCropper";
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

export function AdvertiserProfileComponent() {
  const [advertiser, setAdvertiser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedAdvertiser, setEditedAdvertiser] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});
  const [logo, setLogo] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [base64Image, setBase64Image] = useState(null);

  const getUserRole = () => Cookies.get("role") || "guest";

  useEffect(() => {
    const fetchAdvertiserProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdvertiser(response.data);
        setEditedAdvertiser(response.data);
        setLogo(response.data.logo);
       
        if (response.data.logo && response.data.logo.url) {
          convertUrlToBase64(response.data.logo.url).then((base64) => {
            setBase64Image(base64)
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertiserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAdvertiser((prev) => ({ ...prev, [name]: value }));
    setValidationMessages((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUpdateClick = () => {
    setShowModal(true);
    setDropdownOpen(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleImageCropped = (newImage) => {
    setNewImage(newImage);
  };

  const handleFirstSave = () => {
    setLogo(newImage);
    setShowModal(false);
  };

  const handleDiscard = () => {
    setEditedAdvertiser(advertiser);
    setLogo(advertiser.logo);
    setIsEditing(false);
  };

  const isValidURL = (string) => {
    const res = string.match(
      /^(https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*$/i
    );
    return res !== null;
  };

  const validateFields = () => {
    const { email, username, name, hotline, website } = editedAdvertiser;
    const messages = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hotlineRegex = /^\d{5}$/;

    if (!name) messages.name = "Name is required.";
    if (!username) messages.username = "Username is required.";
    if (!email) {
      messages.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      messages.email = "Invalid email format.";
    }
    if (!hotline) {
      messages.hotline = "Hotline is required.";
    } else if (hotline.length !== 5 || !/^\d+$/.test(hotline)) {
      messages.hotline = "Hotline should be 5 digits only.";
    }

    if (website && !isValidURL(website)) {
      messages.website = "Invalid website format.";
    }

    setValidationMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();

      setDropdownOpen(false);

      const { email, username, name, hotline, website, description } =
        editedAdvertiser;
      const formData = new FormData();
      formData.append("name", name);
      logo && formData.append("logo",JSON.stringify(logo));
      formData.append("username", username);
      formData.append("email", email);
      formData.append("hotline", hotline);
      formData.append("description", description || "");
      formData.append("website", website || "");

      const api = `http://localhost:4000/${role}`;
      const response = await axios.put(api, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.statusText === "OK") {
        setAdvertiser(response.data.advertiser);
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

  if (!advertiser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No advertiser profile information is available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="flex-shrink-0 relative">
            <button
              className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              disabled={!isEditing && !logo}
            >
              {logo ? (
                logo.public_id ? (
                  <img
                    src={logo.url}
                    alt="User"
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <img
                    src={logo}
                    alt="User"
                    className="w-20 h-20 rounded-full"
                  />
                )
              ) : (
                <User className="w-12 h-12 text-white" />
              )}{" "}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
                <ul className="py-2">
                  {logo && (
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
                  {logo && isEditing && (
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                      onClick={() => {
                        setLogo(null);
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

          <div className="flex flex-col flex-grow">
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                name="name"
                value={editedAdvertiser.name}
                onChange={handleInputChange}
                className={validationMessages.name ? "border-red-500" : ""}
              />
            ) : (
              <h2 className="text-3xl font-bold mb-1">{advertiser.name}</h2>
            )}
            {validationMessages.name && (
              <span className="text-red-500 text-sm">
                {validationMessages.name}
              </span>
            )}

            <div className="flex items-center gap-2 mt-2">
              <User className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col w-full">
                  <Input
                    id="username"
                    name="username"
                    value={editedAdvertiser.username}
                    onChange={handleInputChange}
                    className={
                      validationMessages.username ? "border-red-500" : ""
                    }
                  />
                  {validationMessages.username && (
                    <span className="text-red-500 text-sm">
                      {validationMessages.username}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-semibold">{advertiser.username}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                name="email"
                value={editedAdvertiser.email}
                onChange={handleInputChange}
                className={validationMessages.email ? "border-red-500" : ""}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{advertiser.email}</span>
              </div>
            )}
            {validationMessages.email && (
              <span className="text-red-500 text-sm">
                {validationMessages.email}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="hotline">Hotline</Label>
            {isEditing ? (
              <Input
                id="hotline"
                name="hotline"
                value={editedAdvertiser.hotline}
                onChange={handleInputChange}
                className={validationMessages.hotline ? "border-red-500" : ""}
                maxLength={5}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{advertiser.hotline}</span>
              </div>
            )}
            {validationMessages.hotline && (
              <span className="text-red-500 text-sm">
                {validationMessages.hotline}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="website">Website</Label>
            {isEditing ? (
              <Input
                id="website"
                name="website"
                value={editedAdvertiser.website}
                onChange={handleInputChange}
                className={validationMessages.website ? "border-red-500" : ""}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                {advertiser.website ? (
                  <a
                    href={advertiser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {advertiser.website}
                  </a>
                ) : (
                  <span>No website provided</span>
                )}
              </div>
            )}
            {validationMessages.website && (
              <span className="text-red-500 text-sm">
                {validationMessages.website}
              </span>
            )}
          </div>

          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                advertiser.isAccepted
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <CheckCircle className="inline w-4 h-4 mr-1" />
              {advertiser.isAccepted ? "Account Accepted" : "Account Pending"}
            </span>
          </div>
        </div>

        <div className="flex flex-col mb-6">
          <Label htmlFor="description">Description</Label>
          {isEditing ? (
            <Textarea
              id="description"
              name="description"
              value={editedAdvertiser.description || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Description"
            />
          ) : advertiser.description ? (
            <p className="text-gray-600">{advertiser.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided</p>
          )}
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

      <Modal show={showModal} onClose={closeModal}>
        <h2 className="text-lg font-bold mb-4">Update Profile Picture</h2>
        <ImageCropper
          onImageCropped={handleImageCropped}
          currentImage={logo ? (logo.public_id ? base64Image : logo) : null}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleFirstSave} className="mr-2">
            Save
          </Button>
          <Button onClick={closeModal} variant="destructive">
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        show={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        isImageViewer={true}
        imageUrl={logo?.url || logo}
      />
    </div>
  );
}
