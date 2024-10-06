import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Check, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const UpdateHistoricalPlace = () => {
  const { id } = useParams();
  const [historicalPlace, setHistoricalPlace] = useState({
    description: '',
    location: {
      address: '',
      city: '',
      country: '',
    },
    openingHours: {
      weekdays: '',
      weekends: '',
    },
    ticketPrices: {
      native: 0,
      student: 0,
      foreigner: 0,
    },
    pictures: [],
  });
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false); // Separate loading state for cities
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newPictureUrl, setNewPictureUrl] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoricalPlaceDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const historicalPlaceData = await response.json();
        setHistoricalPlace(historicalPlaceData);
        setError(null);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalPlaceDetails();
    fetchCountries();
  }, [id, userRole]);

  useEffect(() => {
    if (historicalPlace.location.country) {
      fetchCities(historicalPlace.location.country);
    } else {
      setCities([]);
    }
  }, [historicalPlace.location.country]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      const sortedCountries = data.map(country => country.name.common).sort();
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCities = async (country) => {
    setCitiesLoading(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg || 'Failed to fetch cities');
      }

      const sortedCities = data.data.sort();
      setCities(sortedCities);
    } catch (err) {
      setError('Error fetching cities. Please try again later.');
      console.error('Error fetching cities:', err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setHistoricalPlace((prev) => {
      const newState = { ...prev };
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        newState[parent] = { ...newState[parent], [child]: value };
      } else {
        newState[name] = value;
      }

      // Prevent negative values for ticket prices
      if (name.startsWith('ticketPrices.')) {
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          newState.ticketPrices = { ...newState.ticketPrices, [name.split('.')[1]]: 0 };
        }
      }

      return newState;
    });

    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name, value) => {
    setHistoricalPlace((prev) => {
      const newState = { ...prev };
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        newState[parent] = { ...newState[parent], [child]: value };
      } else {
        newState[name] = value;
      }
      return newState;
    });

    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};

    if (!historicalPlace.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!historicalPlace.location.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!historicalPlace.location.country) {
      errors.country = 'Country is required';
    }
    if (!historicalPlace.location.city) {
      errors.city = 'City is required';
    }
    if (historicalPlace.ticketPrices.native < 0) {
      errors.nativePrice = 'Native ticket price cannot be negative';
    }
    if (historicalPlace.ticketPrices.student < 0) {
      errors.studentPrice = 'Student ticket price cannot be negative';
    }
    if (historicalPlace.ticketPrices.foreigner < 0) {
      errors.foreignerPrice = 'Foreigner ticket price cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(historicalPlace),
      });

      if (!response.ok) {
        throw new Error('Failed to update historical place');
      }

      setShowSuccessPopup(true);
    } catch (err) {
      setError('Error updating historical place. Please try again later.');
      console.error('Error updating historical place:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPicture = () => {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlPattern.test(newPictureUrl)) {
      setFormErrors((prev) => ({ ...prev, pictureUrl: 'Invalid picture URL' }));
      return;
    }

    if (newPictureUrl.trim()) {
      setHistoricalPlace((prev) => ({
        ...prev,
        pictures: [...prev.pictures, newPictureUrl.trim()],
      }));
      setNewPictureUrl('');
      setFormErrors((prev) => ({ ...prev, pictureUrl: '' }));
    }
  };

  const handleRemovePicture = (index) => {
    setHistoricalPlace((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Update Historical Place</h1>

        <Card>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={historicalPlace.description} onChange={handleChange} />
                {formErrors.description && <p className="text-red-500">{formErrors.description}</p>}
              </div>

              {/* Address Fields */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="location.address" value={historicalPlace.location.address} onChange={handleChange} />
                {formErrors.address && <p className="text-red-500">{formErrors.address}</p>}
              </div>

              {/* Select Country */}
              <div>
                <Label htmlFor="country">Country</Label>
                <Select name="location.country" onValueChange={(value) => handleSelectChange('location.country', value)} value={historicalPlace.location.country}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.country && <p className="text-red-500">{formErrors.country}</p>}
              </div>

              {/* Select City */}
              <div>
                <Label htmlFor="city">City</Label>
                {citiesLoading ? (
                  <p>Loading cities...</p>
                ) : (
                  <Select name="location.city" onValueChange={(value) => handleSelectChange('location.city', value)} value={historicalPlace.location.city}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formErrors.city && <p className="text-red-500">{formErrors.city}</p>}
              </div>

              {/* Ticket Prices */}
              <div>
                <Label htmlFor="nativePrice">Ticket Price (Native)</Label>
                <Input type="number" id="nativePrice" name="ticketPrices.native" value={historicalPlace.ticketPrices.native} onChange={handleChange} />
                {formErrors.nativePrice && <p className="text-red-500">{formErrors.nativePrice}</p>}
              </div>

              <div>
                <Label htmlFor="studentPrice">Ticket Price (Student)</Label>
                <Input type="number" id="studentPrice" name="ticketPrices.student" value={historicalPlace.ticketPrices.student} onChange={handleChange} />
                {formErrors.studentPrice && <p className="text-red-500">{formErrors.studentPrice}</p>}
              </div>

              <div>
                <Label htmlFor="foreignerPrice">Ticket Price (Foreigner)</Label>
                <Input type="number" id="foreignerPrice" name="ticketPrices.foreigner" value={historicalPlace.ticketPrices.foreigner} onChange={handleChange} />
                {formErrors.foreignerPrice && <p className="text-red-500">{formErrors.foreignerPrice}</p>}
              </div>

              {/* Add Picture Section */}
              <div>
                <Label htmlFor="newPictureUrl">Add Picture URL</Label>
                <div className="flex space-x-2">
                  <Input type="text" id="newPictureUrl" value={newPictureUrl} onChange={(e) => setNewPictureUrl(e.target.value)} />
                  <Button onClick={handleAddPicture}>Add</Button>
                </div>
                {formErrors.pictureUrl && <p className="text-red-500">{formErrors.pictureUrl}</p>}

                {/* Display Added Pictures */}
                {historicalPlace.pictures.length > 0 && (
                  <div className="mt-4">
                    <Label>Added Pictures</Label>
                    <div className="flex space-x-2">
                      {historicalPlace.pictures.map((pic, index) => (
                        <div key={index} className="relative">
                          <img src={pic} alt={`Historical Place ${index}`} className="w-32 h-32 object-cover" />
                          <button onClick={() => handleRemovePicture(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Popup */}
        <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>Historical place has been successfully updated.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => navigate('/historical-places')}>Go to Historical Places</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UpdateHistoricalPlace;
