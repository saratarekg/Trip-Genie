import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, Phone, User, CheckCircle, AtSign } from "lucide-react";
import PhoneInput from "react-phone-input-2";
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

export function SellerProfileComponent() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedSeller, setEditedSeller] = useState(null);
  const [validationMessages, setValidationMessages] = useState({});

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();

        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSeller(response.data);
        setEditedSeller(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } =
      e && e.target ? e.target : { name: "mobile", value: e };
    setEditedSeller((prev) => ({ ...prev, [name]: value })); // Update editedSeller state
    setValidationMessages((prev) => ({ ...prev, [name]: "" })); // Clear validation message on change
  };

  const handleDiscard = () => {
    setEditedSeller(seller); // Reset to the original seller data
    setIsEditing(false); // Exit editing mode
  };
  const validateFields = () => {
    const { name, username, email, mobile } = editedSeller;
    const messages = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setValidationMessages(messages);
    return Object.keys(messages).length === 0; // Return true if no validation messages
  };

  const handleUpdate = async () => {
    if (!validateFields()) {
      return; // If validation fails, do not proceed
    }

    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();

      const api = `http://localhost:4000/${role}`;
      // Ensure description is either the user's input or an empty string
      const dataToUpdate = {
        ...editedSeller,
        description: editedSeller.description || "", // Default to an empty string if description is null
      };

      const response = await axios.put(api, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusText === "OK") {
        setSeller(response.data.seller);
        setIsEditing(false);
        setError(""); // Clear previous errors
      }
    } catch (err) {
      if (err.response.data.message === "Email already exists") {
        const email = "Email already exists";
        setValidationMessages({ email });
      } else if (err.response.data.message === "Username already exists") {
        const username = "Username already exists";
        setValidationMessages({ username });
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

  if (!seller) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">
          No seller profile information is available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-32 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            <User className="w-12 h-12 text-white" />{" "}
            {/* Adjust the size of the icon here */}
          </div>

          <div>
            {/* Name - Displayed above the username */}
            {isEditing ? (
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  value={editedSeller.name}
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
              <h2 className="text-3xl font-bold mb-1">{seller.name}</h2>
            )}

            {/* Username - with icon */}
            <div className="flex items-center gap-2 mb-4">
              <AtSign className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="username"
                    value={editedSeller.username}
                    onChange={handleInputChange}
                    className={`text-2xl font-semibold border rounded px-2 py-1 flex-1 ${
                      validationMessages.username ? "border-red-500" : ""
                    }`}
                    placeholder="Username"
                  />
                  {validationMessages.username && (
                    <span className="text-red-500 text-sm">
                      {validationMessages.username}
                    </span>
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
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedSeller.email}
                  onChange={handleInputChange}
                  className={`border rounded px-2 py-1 flex-1 ${
                    validationMessages.email ? "border-red-500" : ""
                  }`}
                  placeholder="Email"
                />
              ) : (
                <span>{seller.email}</span>
              )}
            </div>
            {validationMessages.email && (
              <span className="text-red-500 text-sm">
                {validationMessages.email}
              </span>
            )}
          </div>

          {/* <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <input
                  type="text"
                  name="mobile"
                  value={editedSeller.mobile}
                  onChange={handleInputChange}
                  className={`border rounded px-2 py-1 flex-1 ${
                    validationMessages.mobile ? "border-red-500" : ""
                  }`}
                  placeholder="Phone Number"
                />
              ) : (
                <span>{seller.mobile}</span>
              )}
            </div>
            {validationMessages.mobile && (
              <span className="text-red-500 text-sm">{validationMessages.mobile}</span>
            )}
          </div> */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="w-full">
                  <PhoneInput
                    country={"eg"}
                    value={editedSeller.mobile}
                    onChange={handleInputChange}
                    excludeCountries={["il"]}
                    inputProps={{
                      name: "mobile",
                      required: true,
                      placeholder: seller.mobile,
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
                <span>{seller.mobile}</span>
              )}
            </div>
            {validationMessages.mobile && (
              <span className="text-red-500 text-sm">
                {validationMessages.mobile}
              </span>
            )}
          </div>
          {/* Mobile */}
          {/* <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="w-full relative">
                  <PhoneInput
                    country={"eg"}
                    value={seller.mobile}
                    onChange={handleInputChange}
                    excludeCountries={["il"]}
                    inputProps={{
                      name: "mobile",
                      required: true,
                      placeholder: seller.mobile,
                      className: `w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-grey-500 ${
                        validationMessages.mobile ? "border-red-500" : "border-gray-300"
                      }`,
                    }}
                    containerClass="w-full"
                    buttonClass="bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-l-md"
                    dropdownClass="rounded-md shadow-lg"
                    inputStyle={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      paddingLeft: "50px", // To align with the flag
                    }}
                    buttonStyle={{
                      border: "none",
                      outline: "none",
                    }}
                  />
                  {validationMessages.mobile && (
                    <span className="text-red-500 text-sm absolute top-full left-0 mt-1">
                      {validationMessages.mobile}
                    </span>
                  )}
                </div>
              ) : (
                <span>{seller.mobile}</span>
              )}
            </div>
          </div> */}

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

        {(seller.description || isEditing) && (
          <div className="flex flex-col">
            <h3 className="font-semibold mb-2">Description</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={editedSeller.description || ""}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-1"
                rows="3"
                placeholder="Description"
              />
            ) : (
              seller.description && (
                <p className="text-gray-600">{seller.description}</p>
              )
            )}
          </div>
        )}

        <div className="mt-6">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
