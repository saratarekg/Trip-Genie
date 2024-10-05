import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Trash, Plus, Star, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const UpdateProducts = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState({
    title: '',
    activities: [],
    timeline: '',
    language: '',
    price: 0,
    availableDates: [],
    accessibility: false,
    pickUpLocation: '',
    dropOffLocation: '',
    isBooked: false,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [availableActivities, setAvailableActivities] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraryDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const [itineraryResponse, activitiesResponse] = await Promise.all([
          fetch(`http://localhost:4000/${userRole}/itineraries/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:4000/tour-guide/activities', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!itineraryResponse.ok || !activitiesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [itineraryData, activitiesData] = await Promise.all([
          itineraryResponse.json(),
          activitiesResponse.json()
        ]);

        setItinerary(itineraryData);
        setAvailableActivities(activitiesData);
        setError(null);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraryDetails();
  }, [id, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name) => {
    setItinerary((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDateChange = (value, index) => {
    const newDates = [...itinerary.availableDates];
    newDates[index].date = value;
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const handleTimeChange = (value, dateIndex, timeIndex, field) => {
    const newDates = [...itinerary.availableDates];
    newDates[dateIndex].times[timeIndex][field] = value;
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const addDate = () => {
    setItinerary((prev) => ({
      ...prev,
      availableDates: [...prev.availableDates, { date: new Date().toISOString().split('T')[0], times: [] }],
    }));
  };

  const removeDate = (index) => {
    setItinerary((prev) => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index),
    }));
  };

  const addTime = (dateIndex) => {
    const newDates = [...itinerary.availableDates];
    newDates[dateIndex].times.push({ startTime: '', endTime: '' });
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const removeTime = (dateIndex, timeIndex) => {
    const newDates = [...itinerary.availableDates];
    newDates[dateIndex].times = newDates[dateIndex].times.filter((_, i) => i !== timeIndex);
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const addActivity = (activityId) => {
    const activityToAdd = availableActivities.find(a => a._id === activityId);
    if (activityToAdd && !itinerary.activities.some(a => a._id === activityId)) {
      setItinerary((prev) => ({
        ...prev,
        activities: [...prev.activities, activityToAdd],
      }));
    }
  };

  const removeActivity = (activityId) => {
    setItinerary((prev) => ({
      ...prev,
      activities: prev.activities.filter(a => a._id !== activityId),
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itinerary),
      });

      if (!response.ok) {
        throw new Error('Failed to update itinerary');
      }

      setShowSuccessPopup(true);
    } catch (err) {
      setError('Error updating itinerary. Please try again later.');
      console.error('Error updating itinerary:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Update Itinerary</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={itinerary.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Textarea
                    id="timeline"
                    name="timeline"
                    value={itinerary.timeline}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    value={itinerary.language}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={itinerary.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pickUpLocation">Pick-up Location</Label>
                  <Input
                    id="pickUpLocation"
                    name="pickUpLocation"
                    value={itinerary.pickUpLocation}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="dropOffLocation">Drop-off Location</Label>
                  <Input
                    id="dropOffLocation"
                    name="dropOffLocation"
                    value={itinerary.dropOffLocation}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="accessibility"
                    checked={itinerary.accessibility}
                    onCheckedChange={() => handleSwitchChange('accessibility')}
                  />
                  <Label htmlFor="accessibility">Accessibility</Label>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="isBooked"
                    checked={itinerary.isBooked}
                    onCheckedChange={() => handleSwitchChange('isBooked')}
                  />
                  <Label htmlFor="isBooked">Is Booked</Label>
                </div> */}
                {/* <div>
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={itinerary.rating}
                      onChange={handleChange}
                    />
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                </div> */}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-semibold mb-2">Available Activities</h4>
                  {availableActivities.map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between mb-2">
                      <span>{activity.name}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addActivity(activity._id)}
                        disabled={itinerary.activities.some(a => a._id === activity._id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-2">Selected Activities</h4>
                  {itinerary.activities.map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between mb-2">
                      <span>{activity.name}</span>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeActivity(activity._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Available Dates</h3>
              {itinerary.availableDates.map((dateObj, dateIndex) => (
                <div key={dateIndex} className="mb-4 p-4 border rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      type="date"
                      value={dateObj.date.split('T')[0]}
                      onChange={(e) => handleDateChange(e.target.value, dateIndex)}
                    />
                    <Button variant="destructive" size="icon" onClick={() => removeDate(dateIndex)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  {dateObj.times.map((timeObj, timeIndex) => (
                    <div key={timeIndex} className="flex items-center space-x-2 mb-2">
                      <Input
                        type="time"
                        value={timeObj.startTime}
                        onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'startTime')}
                      />
                      <Input
                        type="time"
                        value={timeObj.endTime}
                        onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'endTime')}
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeTime(dateIndex, timeIndex)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => addTime(dateIndex)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Time
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addDate}>
                <Plus className="mr-2 h-4 w-4" /> Add Date
              </Button>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => navigate(`/itinerary/${id}`)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button variant="default" onClick={handleUpdate}>
                Update Itinerary
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
              Itinerary Updated
            </DialogTitle>
            <DialogDescription>
              The itinerary has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate('/all-itineraries')}>
              Back to All Itineraries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProducts;