import React, { useEffect, useState } from "react";
// import { ObjectId } from "mongodb";
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
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
        setTourGuide(response.data);
        setEditedTourGuide(response.data);
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
    const { name, value } = e.target;
    setEditedTourGuide((prev) => ({ ...prev, [name]: value }));
    setValidationMessages((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNationalityChange = (value) => {
    console.log(value);
    if (!tourGuide.nationality) {
      // const objectId = new ObjectId(value); // Convert string to ObjectId
      setEditedTourGuide((prev) => ({ ...prev, nationality: value }));
      setValidationMessages((prev) => ({ ...prev, nationality: "" }));
    }
  };

  const handleDiscard = () => {
    setEditedTourGuide(tourGuide);
    setIsEditing(false);
  };

  const validateFields = () => {
    const { username, email, mobile, yearsOfExperience, nationality } =
      editedTourGuide;
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
    } else if (!phoneRegex.test(mobile)) {
      messages.mobile = "Invalid phone number format. Include 7-15 digits.";
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
      const api = `http://localhost:4000/${role}`;
      const response = await axios.put(api, editedTourGuide, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  return (
    <div className="w-full max-w-3xl mx-auto my-32 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{tourGuide.username}</h2>
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

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <Input
                  type="text"
                  name="mobile"
                  value={editedTourGuide.mobile}
                  onChange={handleInputChange}
                  className={validationMessages.mobile ? "border-red-500" : ""}
                  placeholder="Phone Number"
                />
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
                    validationMessages.yearsOfExperience ? "border-red-500" : ""
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
                    <SelectValue placeholder="Select nationality" />
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
                {tourGuide.nationality
                  ? tourGuide.nationality.name
                  : "Nationality not set"}
              </span>
            )}
          </div>

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
            <Button onClick={handleAddWork} variant="outline" className="mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add Work Experience
            </Button>
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
