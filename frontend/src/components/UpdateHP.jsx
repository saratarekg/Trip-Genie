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
  };

  const handleUpdate = async () => {
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
    if (newPictureUrl.trim()) {
      setHistoricalPlace((prev) => ({
        ...prev,
        pictures: [...prev.pictures, newPictureUrl.trim()],
      }));
      setNewPictureUrl('');
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
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={historicalPlace.description}
                  onChange={handleChange}
                  rows={5}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Location</h2>
                <div>
                  <Label htmlFor="location.address">Address</Label>
                  <Input
                    id="location.address"
                    name="location.address"
                    value={historicalPlace.location.address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location.country">Country</Label>
                  <Select
                    value={historicalPlace.location.country}
                    onValueChange={(value) => handleSelectChange('location.country', value)}
                  >
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
                </div>
                <div>
                  <Label htmlFor="location.city">City</Label>
                  <Select
                    value={historicalPlace.location.city}
                    onValueChange={(value) => handleSelectChange('location.city', value)}
                    disabled={!historicalPlace.location.country || cities.length === 0 || citiesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {citiesLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading cities...</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Opening Hours</h2>
                <div>
                  <Label htmlFor="openingHours.weekdays">Weekdays</Label>
                  <Input
                    id="openingHours.weekdays"
                    name="openingHours.weekdays"
                    value={historicalPlace.openingHours.weekdays}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="openingHours.weekends">Weekends</Label>
                  <Input
                    id="openingHours.weekends"
                    name="openingHours.weekends"
                    value={historicalPlace.openingHours.weekends}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Ticket Prices</h2>
                <div>
                  <Label htmlFor="ticketPrices.native">Native</Label>
                  <Input
                    id="ticketPrices.native"
                    name="ticketPrices.native"
                    type="number"
                    min="0"
                    value={historicalPlace.ticketPrices.native}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPrices.student">Student</Label>
                  <Input
                    id="ticketPrices.student"
                    name="ticketPrices.student"
                    type="number"
                    min="0"
                    value={historicalPlace.ticketPrices.student}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ticketPrices.foreigner">Foreigner</Label>
                  <Input
                    id="ticketPrices.foreigner"
                    name="ticketPrices.foreigner"
                    type="number"
                    min="0"
                    value={historicalPlace.ticketPrices.foreigner}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Pictures</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {historicalPlace.pictures.map((pic, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-2">
                        <img src={pic} alt={`Historical Place ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemovePicture(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="New picture URL"
                          value={newPictureUrl}
                          onChange={(e) => setNewPictureUrl(e.target.value)}
                        />
                        <Button onClick={handleAddPicture} size="icon" disabled={!newPictureUrl.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="default" onClick={handleUpdate}>
                Update Historical Place
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Check className="w-6 h-6 text-green-500 mr-2" />
              Historical Place Updated
            </DialogTitle>
            <DialogDescription>
              The historical place has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate('/all-historical-places')}>
              Back to All Historical Places
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateHistoricalPlace;
