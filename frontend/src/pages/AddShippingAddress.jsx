import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Trash2, X, Edit } from 'lucide-react'; // Importing Edit icon

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [currentAddressId, setCurrentAddressId] = useState(null); // For tracking the address to update
  const [addressDetails, setAddressDetails] = useState({
    streetName: '',
    streetNumber: '',
    floorUnit: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    landmark: '',
    locationType: 'home', // Default value
    default: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.get('http://localhost:4000/tourist/shippingAdds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(Array.isArray(response.data.shippingAddresses) ? response.data.shippingAddresses : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setMessage({ text: "Failed to fetch addresses. Please try again.", type: "error" });
      setAddresses([]);
      hideMessageAfterDelay();
    }
  };

  const hideMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!addressDetails.streetName.trim()) {
      newErrors.streetName = "Street name is required";
    }
    if (!addressDetails.streetNumber.trim()) {
      newErrors.streetNumber = "Street number is required";
    }
    if (!addressDetails.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!addressDetails.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!addressDetails.postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d{5}(?:[-\s]\d{4})?$/.test(addressDetails.postalCode)) {
      newErrors.postalCode = "Please enter a valid postal code";
    }
    if (!addressDetails.country.trim()) {
      newErrors.country = "Country is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = Cookies.get('jwt');
      if (currentAddressId) {
        // Updating an existing address
        await axios.put(
          `http://localhost:4000/tourist/update-shippingAdd/${currentAddressId}`,
          addressDetails,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessage({ text: "Shipping address updated successfully", type: "success" });
      } else {
        // Adding a new address
        await axios.put(
          'http://localhost:4000/tourist/add-shippingAdd',
          addressDetails,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessage({ text: "Shipping address added successfully", type: "success" });
      }

      hideMessageAfterDelay();
      setShowAddForm(false);
      fetchAddresses();
      resetAddressDetails();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to process address. Please try again.", type: "error" });
      hideMessageAfterDelay();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressDetails(address); // Populate form with selected address details
    setCurrentAddressId(address._id); // Set the current address ID for updating
    setShowAddForm(true); // Show the add form
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = Cookies.get('jwt');
      await axios.put(
        `http://localhost:4000/tourist/add-default-shippingAdds/${addressId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchAddresses();
      setMessage({ text: "Default address updated successfully", type: "success" });
      hideMessageAfterDelay();
    } catch (error) {
      setMessage({ text: "Failed to update default address. Please try again.", type: "error" });
      hideMessageAfterDelay();
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      const token = Cookies.get('jwt');
      await axios.delete(
        `http://localhost:4000/tourist/shippingAdds/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchAddresses();
      setMessage({ text: "Address removed successfully", type: "success" });
      hideMessageAfterDelay();
    } catch (error) {
      setMessage({ text: "Failed to remove address. Please try again.", type: "error" });
      hideMessageAfterDelay();
    } finally {
      setShowRemoveConfirm(null);
    }
  };

  const resetAddressDetails = () => {
    setAddressDetails({
      streetName: '',
      streetNumber: '',
      floorUnit: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      landmark: '',
      locationType: 'home',
      default: false,
    });
    setCurrentAddressId(null); // Reset the current address ID
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Shipping Addresses</h2>

      {/* Notification Message */}
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-[#B5D3D1] text-[#1A3B47]' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Scrollable Addresses Container */}
      <div className="max-h-[220px] overflow-y-auto space-y-4 mb-4">
        {Array.isArray(addresses) && addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address._id} className="border rounded-md p-4 flex justify-between items-center bg-white shadow-sm">
              <div className="flex flex-col">
                <p className="font-semibold">
                  {address.streetName}, {address.streetNumber} {address.floorUnit && `(${address.floorUnit})`}, {address.city}, {address.state}, {address.postalCode}, {address.country}
                </p>
                {address.default && (
                  <span className="bg-[#B5D3D1] text-[#1A3B47] text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-2 items-center">
                {/* Set as Default Button */}
                {!address.default && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="px-2 py-1 text-white text-xs rounded-md bg-[#388A94] hover:bg-[#1A3B47] transition duration-300 ease-in-out"
                  >
                    Set as Default
                  </button>
                )}
                {/* Edit Address Button */}
                <button
                  onClick={() => handleEditAddress(address)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </button>
                {/* Delete Address Button */}
                <button
                  onClick={() => setShowRemoveConfirm(address._id)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No addresses available.</p>
        )}
      </div>

      {/* Confirm Removal of Address */}
      {showRemoveConfirm && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-4">
          <p>Are you sure you want to delete this address?</p>
          <div className="flex space-x-2 mt-2">
            <button onClick={() => handleRemoveAddress(showRemoveConfirm)} className="bg-red-600 text-white px-4 py-2 rounded-md">Yes</button>
            <button onClick={() => setShowRemoveConfirm(null)} className="bg-gray-300 text-black px-4 py-2 rounded-md">No</button>
          </div>
        </div>
      )}

      {/* Address Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mt-4 border border-gray-300 rounded-md p-4 bg-white">
          <h3 className="text-lg font-semibold">{currentAddressId ? "Update Address" : "Add New Address"}</h3>

          <div className="flex flex-col space-y-2 mt-2">
            <label>
              Street Name:
              <input
                type="text"
                name="streetName"
                value={addressDetails.streetName}
                onChange={handleInputChange}
                className={`border ${errors.streetName ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.streetName && <span className="text-red-500 text-sm">{errors.streetName}</span>}
            </label>
            <label>
              Street Number:
              <input
                type="text"
                name="streetNumber"
                value={addressDetails.streetNumber}
                onChange={handleInputChange}
                className={`border ${errors.streetNumber ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.streetNumber && <span className="text-red-500 text-sm">{errors.streetNumber}</span>}
            </label>
            <label>
              Floor/Unit:
              <input
                type="text"
                name="floorUnit"
                value={addressDetails.floorUnit}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </label>
            <label>
              City:
              <input
                type="text"
                name="city"
                value={addressDetails.city}
                onChange={handleInputChange}
                className={`border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.city && <span className="text-red-500 text-sm">{errors.city}</span>}
            </label>
            <label>
              State:
              <input
                type="text"
                name="state"
                value={addressDetails.state}
                onChange={handleInputChange}
                className={`border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.state && <span className="text-red-500 text-sm">{errors.state}</span>}
            </label>
            <label>
              Postal Code:
              <input
                type="text"
                name="postalCode"
                value={addressDetails.postalCode}
                onChange={handleInputChange}
                className={`border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.postalCode && <span className="text-red-500 text-sm">{errors.postalCode}</span>}
            </label>
            <label>
              Country:
              <input
                type="text"
                name="country"
                value={addressDetails.country}
                onChange={handleInputChange}
                className={`border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
              />
              {errors.country && <span className="text-red-500 text-sm">{errors.country}</span>}
            </label>
            <label>
              Landmark:
              <input
                type="text"
                name="landmark"
                value={addressDetails.landmark}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="default"
                checked={addressDetails.default}
                onChange={handleInputChange}
                className="rounded-md"
              />
              <span>Set as Default Address</span>
            </label>
          </div>

          <div className="flex justify-end mt-4">
            <button type="button" onClick={() => { setShowAddForm(false); resetAddressDetails(); }} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md mr-2 transition duration-300 ease-in-out">Cancel</button>
            <button type="submit" className={`px-4 py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-[#388A94] hover:bg-[#1A3B47] transition duration-300 ease-in-out'} text-white`}>
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Add New Address Button */}
      <button
        onClick={() => { setShowAddForm(true); resetAddressDetails(); }}
        className="mt-4 text-white bg-[#388A94] hover:bg-[#1A3B47] px-4 py-2 rounded-md transition duration-300 ease-in-out"
      >
        Add New Address
      </button>
    </div>
  );
}
