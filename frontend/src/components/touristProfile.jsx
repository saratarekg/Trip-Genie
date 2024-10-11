import React, { useEffect, useState } from "react";
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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
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

// Custom validator for mobile number
const phoneValidator = (value) => {
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
        const response = await axios.get("http://localhost:4000/api/nationalities");
        setNationalities(response.data);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
      }
    };
    fetchNationalities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e && e.target ? e.target : { name: "mobile", value: e };
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
    if (!jobOrStudent) messages.jobOrStudent = "Job or student status is required.";

    setValidationMessages(messages);
    return Object.keys(messages).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
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
    return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold">Loading profile...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold text-red-500">Error: {error}</p></div>;
  }

  if (!tourist) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold">No tourist profile information is available.</p></div>;
  }

  const getBadgeColor = () => {
    switch (tourist.loyaltyBadge) {
      case 'Bronze':
        return 'bg-amber-600 text-white';
      case 'Silver':
        return 'bg-gray-400 text-white';
      case 'Gold':
        return 'bg-yellow-400 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-32 bg-white shadow-lg rounded-lg overflow-hidden relative">
      <div className="absolute top-4 right-4 pt-6 pr-10">
          <Badge className={`${getBadgeColor()} hover:${getBadgeColor()} px-3 py-2 text-xl font-semibold rounded-full flex items-center gap-2`}>
            <Award className="w-6 h-6" />
            {tourist.loyaltyBadge}
          </Badge>
        </div>

      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{tourist.username}</h2>
            <div className="flex items-center gap-2 mb-4">
              <AtSign className="w-4 h-4 text-gray-500" />
              <p className="text-2xl font-semibold">{tourist.username}</p>
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
              <span className="text-red-500 text-sm">{validationMessages.email}</span>
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
                      className: `w-full p-2 ${validationMessages.mobile ? "border-red-500" : "border-gray-300"}`,
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
              <span className="text-red-500 text-sm">{validationMessages.mobile}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-gray-500" />
            {isEditing ? (
              <div className="flex flex-col w-full">
                <Select onValueChange={handleNationalityChange}>
                  <SelectTrigger className={validationMessages.nationality ? "border-red-500" : ""}>
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
                  <span className="text-red-500 text-sm">{validationMessages.nationality}</span>
                )}
              </div>
            ) : (
              <span>{tourist.nationality ? tourist.nationality.name : "Nationality not set"}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{new Date(tourist.dateOfBirth).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            {isEditing ? (
              <div className="flex flex-col w-full">
                <Select
                  name="jobOrStudent"
                  onValueChange={(value) => handleInputChange({ target: { name: "jobOrStudent", value } })}
                >
                  <SelectTrigger className={validationMessages.jobOrStudent ? "border-red-500" : ""}>
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
                  <span className="text-red-500 text-sm">{validationMessages.jobOrStudent}</span>
                )}
              </div>
            ) : (
              <span>{tourist.jobOrStudent}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <span>${tourist.wallet.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span>{tourist.loyaltyPoints.toLocaleString()} points</span>
          </div>
        </div>

        <div className="mt-6">
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleUpdate} variant="default">Save Changes</Button>
              <Button onClick={handleDiscard} variant="destructive">Discard Changes</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="default">Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  );
}