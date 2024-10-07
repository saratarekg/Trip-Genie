"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  User,
  CheckCircle,
  AtSign,
  Briefcase,
  Flag,
  Plus,
  Calendar,
  Wallet,
  GraduationCap,
} from "lucide-react";
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

// Custom validator for mobile number
const phoneValidator = (value) => {
  const phoneNumber = parsePhoneNumberFromString("+" + value);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return false;
  }
  return true;
};

export function TouristProfileComponent() {
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTourist, setEditedTourist] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});
  const [showWorkDialog, setShowWorkDialog] = useState(false);
  const [currentWork, setCurrentWork] = useState({
    title: "",
    company: "",
    duration: "",
    description: "",
  });
  const [nationalities, setNationalities] = useState([]);

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    const fetchTouristProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();

        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTourist(response.data);
        setEditedTourist(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTouristProfile();
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
    const {
      username,
      email,
      mobile,
      nationality,
      dateOfBirth,
      jobOrStudent,
      wallet,
    } = editedTourist;
    const messages = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{7,15}$/;

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
    if (!nationality) messages.nationality = "Nationality is required.";
    if (!dateOfBirth) messages.dateOfBirth = "Date of birth is required.";
    if (!jobOrStudent)
      messages.jobOrStudent = "Job or student status is required.";
    if (wallet < 0) messages.wallet = "Wallet balance cannot be negative.";

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
      const api = `http://localhost:4000/${role}`;
      const response = await axios.put(api, editedTourist, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTourist(response.data.tourist);
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
    setCurrentWork(editedTourist.previousWorks[index]);
    setShowWorkDialog(true);
  };

  const handleRemoveWork = (index) => {
    const newWorks = [...editedTourist.previousWorks];
    newWorks.splice(index, 1);
    setEditedTourist((prev) => ({ ...prev, previousWorks: newWorks }));
  };

  const handleSaveWork = () => {
    if (currentWork.title && currentWork.company && currentWork.duration) {
      const newWorks = [...(editedTourist.previousWorks || [])];
      const existingIndex = newWorks.findIndex(
        (w) =>
          w.title === currentWork.title && w.company === currentWork.company
      );
      if (existingIndex !== -1) {
        newWorks[existingIndex] = currentWork;
      } else {
        newWorks.push(currentWork);
      }
      setEditedTourist((prev) => ({ ...prev, previousWorks: newWorks }));
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

  if (!tourist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No tourist profile information is available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-32 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{tourist.username}</h2>
            <div className="flex items-center gap-2 mb-4">
              <AtSign className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col">
                  <Input
                    type="text"
                    name="username"
                    value={editedTourist.username}
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
                <p className="text-2xl font-semibold">{tourist.username}</p>
              )}
            </div>
          </div>
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
                <div className="w-full">
                  <PhoneInput
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
            {isEditing ? (
              <div className="flex flex-col">
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={
                    editedTourist.dateOfBirth
                      ? new Date(editedTourist.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className={
                    validationMessages.dateOfBirth ? "border-red-500" : ""
                  }
                />
                {validationMessages.dateOfBirth && (
                  <span className="text-red-500 text-sm">
                    {validationMessages.dateOfBirth}
                  </span>
                )}
              </div>
            ) : (
              <span>{new Date(tourist.dateOfBirth).toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            {isEditing ? (
              <div className="flex flex-col w-full">
                <Select
                  name="jobOrStudent"
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "jobOrStudent", value },
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      validationMessages.jobOrStudent ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder={tourist.jobOrStudent} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Job">Job</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
                {validationMessages.jobOrStudent && (
                  <span className="text-red-500 text-sm">
                    {validationMessages.jobOrStudent}
                  </span>
                )}
              </div>
            ) : (
              <span>{tourist.jobOrStudent}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            {isEditing ? (
              <div className="flex flex-col">
                <Input
                  type="number"
                  name="wallet"
                  value={editedTourist.wallet}
                  onChange={handleInputChange}
                  className={validationMessages.wallet ? "border-red-500" : ""}
                  placeholder="Wallet Balance"
                />
                {validationMessages.wallet && (
                  <span className="text-red-500 text-sm">
                    {validationMessages.wallet}
                  </span>
                )}
              </div>
            ) : (
              <span>${tourist.wallet.toFixed(2)}</span>
            )}
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
                  setCurrentWork((prev) => ({ ...prev, title: e.target.value }))
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
  );
}
