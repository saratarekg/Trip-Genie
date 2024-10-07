import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, User, Phone, Globe, CheckCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";

export function AdvertiserProfileComponent() {
    const [advertiser, setAdvertiser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedAdvertiser, setEditedAdvertiser] = useState(null);
    const [validationMessages, setValidationMessages] = useState({});
    const getUserRole = () => {
        let role = Cookies.get("role");
        if (!role) role = "guest";
        return role;
    };

    useEffect(() => {
        const fetchAdvertiserProfile = async () => {
            try {
                const token = Cookies.get("jwt");
                const role = getUserRole();

                const api = `http://localhost:4000/${role}`;
                const response = await axios.get(api, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAdvertiser(response.data);
                setEditedAdvertiser(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvertiserProfile();
    }, []);

    const handleInputChange = (e) => {
        if (typeof e === 'string') {
          // This is a phone number change
          setEditedAdvertiser((prev) => ({ ...prev, hotline: e }));
          setValidationMessages((prev) => ({ ...prev, hotline: "" }));
        } else {
          // This is a regular input change
          const { name, value } = e.target;
          setEditedAdvertiser((prev) => ({ ...prev, [name]: value }));
          setValidationMessages((prev) => ({ ...prev, [name]: "" }));
        }
      };
    const isValidURL = (string) => {
        const res = string.match(/^(https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*$/i);
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

        }
        if (hotline.length>5) {
            messages.hotline = "Hotline should be 5 digits only.";

        }

        if (!/^\d+$/.test(hotline)) {
            messages.hotline = "Cannot include characters in the hotline.";

        }
        

        if (isEditing) {
            if (!website) {
                messages.website = "Website is required."; // Set required validation message
            } else if (!isValidURL(website)) {
                messages.website = "Invalid website format.";
            }
        } else if (!hotlineRegex.test(hotline) ) {
            messages.hotline = "Hotline must contain only numbers.";
        }
       

        setValidationMessages(messages);
        return Object.keys(messages).length === 0;
    };
    const handleDiscard = () => {
        setEditedAdvertiser(advertiser); // Reset to the original advertiser data
        setIsEditing(false); // Exit editing mode
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
                ...editedAdvertiser,
                description: editedAdvertiser.description || "", // Default to an empty string if description is null
            };

            const response = await axios.put(api, dataToUpdate, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
   

            if(response.statusText==="OK"){

                setAdvertiser(response.data.advertiser);
                setIsEditing(false);
                setError(""); // Clear previous errors
            }
           
        } catch (err) {
            if(err.response.data.message ==="Email already exists" ){
                const email="Email already exists";
                setValidationMessages({email});

            }
            else if(err.response.data.message ==="Username already exists"){
                const username="Username already exists";
                setValidationMessages({username});


            }
            else{
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
                <p className="text-lg font-semibold">No advertiser profile information is available.</p>
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
                        {isEditing ? (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="name"
                                    value={editedAdvertiser.name}
                                    onChange={handleInputChange}
                                    className={`text-3xl font-bold mb-1 border rounded px-2 py-1 ${validationMessages.name ? "border-red-500" : ""
                                        }`}
                                    placeholder="Full Name"
                                />
                                {validationMessages.name && (
                                    <span className="text-red-500 text-sm">{validationMessages.name}</span>
                                )}
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold mb-1">{advertiser.name}</h2>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-gray-500" />
                            {isEditing ? (
                                <div className="flex flex-col">
                                    <input
                                        type="text"
                                        name="username"
                                        value={editedAdvertiser.username}
                                        onChange={handleInputChange}
                                        className={`text-2xl font-semibold border rounded px-2 py-1 flex-1 ${validationMessages.username ? "border-red-500" : ""
                                            }`}
                                        placeholder="Username"
                                    />
                                    {validationMessages.username && (
                                        <span className="text-red-500 text-sm">{validationMessages.username}</span>
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
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editedAdvertiser.email}
                                    onChange={handleInputChange}
                                    className={`border rounded px-2 py-1 flex-1 ${validationMessages.email ? "border-red-500" : ""
                                        }`}
                                    placeholder="Email"
                                />
                            ) : (
                                <span>{advertiser.email}</span>
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
              <input
                type="hotline"
                name="hotline"
                value={editedAdvertiser.hotline}
                onChange={handleInputChange}
                className={`border rounded px-2 py-1 flex-1 ${
                  validationMessages.hotline ? "border-red-500" : ""
                }`}
                placeholder="Hotline"
              />
            ) : (
              <span>{advertiser.hotline}</span>
            )}
          </div>
          {validationMessages.hotline && (
            <span className="text-red-500 text-sm">{validationMessages.hotline}</span>
          )}
        </div>
                    {/* <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="w-full">
                  <PhoneInput
                    country={"eg"}
                    value={editedAdvertiser.hotline}
                    onChange={handleInputChange}
                    excludeCountries={["il"]}
                    inputProps={{
                      name: "mobile",
                      required: true,
                      placeholder: advertiser.hotline,
                      className: `w-full p-2 ${validationMessages.hotline ? "border-red-500" : "border-gray-300"}`,
                    }}
                    containerClass="w-full"
                    inputStyle={{ width: '60%', marginLeft: '45px' }}
                  />
                </div>
              ) : (
                <span>{advertiser.hotline}</span>
              )}
            </div>
            {validationMessages.mobile && (
              <span className="text-red-500 text-sm">{validationMessages.hotline}</span>
            )}
          </div> */}

                    {advertiser.website && (
    <div className="flex flex-col mb-4">
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            {isEditing ? (
                <input
                    type="text"
                    name="website"
                    value={editedAdvertiser.website}
                    onChange={handleInputChange}
                    className={`border rounded px-2 py-1 flex-1 ${validationMessages.website ? "border-red-500" : ""}`}
                    placeholder="Website"
                />
            ) : (
                <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {advertiser.website}
                </a>
            )}
        </div>
        {isEditing && validationMessages.website && (
            <span className="text-red-500 text-sm">{validationMessages.website}</span>
        )}
    </div>
)}

                    

                    <div>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${advertiser.isAccepted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}
                        >
                            <CheckCircle className="inline w-4 h-4 mr-1" />
                            {advertiser.isAccepted ? "Account Accepted" : "Account Pending"}
                        </span>
                    </div>
                </div>

                {(advertiser.description || isEditing) && (
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">Description</h3>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={editedAdvertiser.description || ""}
                                onChange={handleInputChange}
                                className="w-full border rounded px-2 py-1"
                                rows="3"
                                placeholder="Description"
                            />
                        ) : (
                            advertiser.description && <p className="text-gray-600">{advertiser.description}</p>
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
