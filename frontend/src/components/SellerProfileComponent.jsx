'use client'

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Mail, Phone, User, AtSign, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { ImageCropper } from "@/components/ImageCropper"

const phoneValidator = (value) => {
  const phoneNumber = parsePhoneNumberFromString(value);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return false;
  }
  return true;
};

const Modal = ({ show, onClose, children, isImageViewer = false, imageUrl = "" }) => {
  if (!show) return null

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
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function SellerProfileComponent() {
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedSeller, setEditedSeller] = useState(null)
  const [validationMessages, setValidationMessages] = useState({})
  const [logo, setLogo] = useState(null)
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newImage, setNewImage] = useState(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  const getUserRole = () => Cookies.get("role") || "guest"

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const token = Cookies.get("jwt")
        const role = getUserRole()
        const api = `http://localhost:4000/${role}`
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSeller(response.data)
        setEditedSeller(response.data)
        setLogo(response.data.logo)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSellerProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e && e.target ? e.target : { name: "mobile", value: e }
    setEditedSeller((prev) => ({ ...prev, [name]: value }))
    setValidationMessages((prev) => ({ ...prev, [name]: "" }))
  }

  const handleUpdateClick = () => {
    setShowModal(true)
    setDropdownOpen(false)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleImageCropped = (newImage) => {
    setNewImage(newImage)
  }

  const handleFirstSave = () => {
    setLogo(newImage)
    setShowModal(false)
  }

  const handleDiscard = () => {
    setEditedSeller(seller)
    setLogo(seller.logo)
    setIsEditing(false)
  }

  const validateFields = () => {
    const { name, username, email, mobile } = editedSeller
    const messages = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name) messages.name = "Name is required."
    if (!username) messages.username = "Username is required."
    if (!email) {
      messages.email = "Email is required."
    } else if (!emailRegex.test(email)) {
      messages.email = "Invalid email format."
    }
    if (!mobile) {
      messages.mobile = "Phone number is required."
    } else if (!phoneValidator(mobile)) {
      messages.mobile = "Invalid phone number."
    }

    setValidationMessages(messages)
    return Object.keys(messages).length === 0
  }

  const handleUpdate = async () => {
    if (!validateFields()) return

    try {
      const token = Cookies.get("jwt")
      const role = getUserRole()

      const { name, username, email, mobile, description } = editedSeller
      const formData = new FormData()
      formData.append("name", name)
      logo && formData.append("logo", logo)
      formData.append("username", username)
      formData.append("email", email)
      formData.append("mobile", mobile)
      formData.append("description", description || "")

      const api = `http://localhost:4000/${role}`
      const response = await axios.put(api, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.statusText === "OK") {
        setSeller(response.data.seller)
        setIsEditing(false)
        setError("")
      }
    } catch (err) {
      if (err.response.data.message === "Email already exists") {
        setValidationMessages({ email: "Email already exists" })
      } else if (err.response.data.message === "Username already exists") {
        setValidationMessages({ username: "Username already exists" })
      } else {
        setError(err.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">No seller profile information is available.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-32 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="flex-shrink-0 relative">
            <button
              className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              disabled={!isEditing}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32">
                <ul className="py-2">
                  {logo && (
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setIsImageViewerOpen(true)
                        setDropdownOpen(false)
                      }}
                    >
                      View
                    </li>
                  )}
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleUpdateClick}
                  >
                    Update
                  </li>
                  {logo && (
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                      onClick={() => {
                        setLogo(null)
                        setDropdownOpen(false)
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
                value={editedSeller.name}
                onChange={handleInputChange}
                className={validationMessages.name ? "border-red-500" : ""}
              />
            ) : (
              <h2 className="text-3xl font-bold mb-1">{seller.name}</h2>
            )}
            {validationMessages.name && (
              <span className="text-red-500 text-sm">{validationMessages.name}</span>
            )}

            <div className="flex items-center gap-2 mt-2">
              <AtSign className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col w-full">
                  <Input
                    id="username"
                    name="username"
                    value={editedSeller.username}
                    onChange={handleInputChange}
                    className={validationMessages.username ? "border-red-500" : ""}
                  />
                  {validationMessages.username && (
                    <span className="text-red-500 text-sm">{validationMessages.username}</span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-semibold">{seller.username}</p>
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
                value={editedSeller.email}
                onChange={handleInputChange}
                className={validationMessages.email ? "border-red-500" : ""}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{seller.email}</span>
              </div>
            )}
            {validationMessages.email && (
              <span className="text-red-500 text-sm">{validationMessages.email}</span>
            )}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="mobile">Phone</Label>
            {isEditing ? (
              <div className="w-full">
                <PhoneInput
                  country={"eg"}
                  value={editedSeller.mobile}
                  onChange={(value) => handleInputChange({ target: { name: "mobile", value } })}
                  excludeCountries={["il"]}
                  inputProps={{
                    name: "mobile",
                    required: true,
                    className: `w-full p-2 ${
                      validationMessages.mobile ? "border-red-500" : "border-gray-300"
                    }`,
                  }}
                  containerClass="w-full"
                  inputStyle={{ width: "100%" }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{seller.mobile}</span>
              </div>
            )}
            {validationMessages.mobile && (
              <span className="text-red-500 text-sm">{validationMessages.mobile}</span>
            )}
          </div>

          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                seller.isAccepted
                  ? "bg-green-100 text-green-800 text-lg"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <CheckCircle className="inline w-4 h-4 mr-1" />
              {seller.isAccepted ? "Account Accepted" : "Account Pending"}
            </span>
          </div>
        </div>

        <div className="flex flex-col mb-6">
          <Label htmlFor="description">Description</Label>
          {isEditing ? (
            <Textarea
              id="description"
              name="description"
              value={editedSeller.description || ""}
              onChange={handleInputChange}
              rows={3}
              placeholder="Description"
            />
          ) : seller.description ? (
            <p className="text-gray-600">{seller.description}</p>
          ) : null}
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
          currentImage={logo}
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
        imageUrl={logo}
      />
    </div>
  )
}