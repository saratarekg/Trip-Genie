import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { XCircle, CheckCircle, ChevronLeft, Trash, Plus, Star, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const worldLanguages = [
  "Abkhaz", "Afar", "Afrikaans", "Akan", "Albanian", "Amharic", "Arabic", "Aragonese", "Armenian", "Assamese",
  "Avaric", "Avestan", "Aymara", "Azerbaijani", "Bambara", "Bashkir", "Basque", "Belarusian", "Bengali", "Bihari",
  "Bislama", "Bosnian", "Breton", "Bulgarian", "Burmese", "Catalan", "Chamorro", "Chechen", "Chichewa", "Chinese",
  "Chuvash", "Cornish", "Corsican", "Cree", "Croatian", "Czech", "Danish", "Divehi", "Dutch", "Dzongkha", "English",
  "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Finnish", "French", "Fula", "Galician", "Georgian", "German",
  "Greek", "Guaraní", "Gujarati", "Haitian", "Hausa", "Hebrew", "Herero", "Hindi", "Hiri Motu", "Hungarian",
  "Interlingua", "Indonesian", "Interlingue", "Irish", "Igbo", "Inupiaq", "Ido", "Icelandic", "Italian", "Inuktitut",
  "Japanese", "Javanese", "Kalaallisut", "Kannada", "Kanuri", "Kashmiri", "Kazakh", "Khmer", "Kikuyu", "Kinyarwanda",
  "Kirghiz", "Komi", "Kongo", "Korean", "Kurdish", "Kwanyama", "Latin", "Luxembourgish", "Luganda", "Limburgish",
  "Lingala", "Lao", "Lithuanian", "Luba-Katanga", "Latvian", "Manx", "Macedonian", "Malagasy", "Malay", "Malayalam",
  "Maltese", "Māori", "Marathi", "Marshallese", "Mongolian", "Nauru", "Navajo", "Norwegian Bokmål", "North Ndebele",
  "Nepali", "Ndonga", "Norwegian Nynorsk", "Norwegian", "Nuosu", "South Ndebele", "Occitan", "Ojibwe", "Old Church Slavonic",
  "Oromo", "Oriya", "Ossetian", "Panjabi", "Pāli", "Persian", "Polish", "Pashto", "Portuguese", "Quechua", "Romansh",
  "Kirundi", "Romanian", "Russian", "Sanskrit", "Sardinian", "Sindhi", "Northern Sami", "Samoan", "Sango", "Serbian",
  "Scottish Gaelic", "Shona", "Sinhala", "Slovak", "Slovene", "Somali", "Southern Sotho", "Spanish", "Sundanese",
  "Swahili", "Swati", "Swedish", "Tamil", "Telugu", "Tajik", "Thai", "Tigrinya", "Tibetan", "Turkmen", "Tagalog",
  "Tswana", "Tonga", "Turkish", "Tsonga", "Tatar", "Twi", "Tahitian", "Uighur", "Ukrainian", "Urdu", "Uzbek",
  "Venda", "Vietnamese", "Volapük", "Walloon", "Welsh", "Wolof", "Western Frisian", "Xhosa", "Yiddish", "Yoruba",
  "Zhuang", "Zulu"
];

export default function UpdateItinerary() {
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
  const [showErrorPopup, setShowErrorPopup] = useState(null);
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

  const handleLanguageChange = (value) => {
    setItinerary((prev) => ({ ...prev, language: value }));
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
        const errorData = await response.json();
        if (response.status === 400) {
          setShowErrorPopup(errorData.message);
          return;
        }
        if (response.status === 403){
          setShowErrorPopup(errorData.message);
          return;
        }
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
                  <Select value={itinerary.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {worldLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        className="w-20"
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
                      className="w-40"
                    />
                    <Button variant="destructive" size="icon" onClick={() => removeDate(dateIndex)} className="w-10 h-10">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  {dateObj.times.map((timeObj, timeIndex) => (
                    <div key={timeIndex} className="flex items-center space-x-2 mb-2">
                      <Input
                        type="time"
                        value={timeObj.startTime}
                        onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'startTime')}
                        className="w-32"
                      />
                      <Input
                        type="time"
                        value={timeObj.endTime}
                        onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'endTime')}
                        className="w-32"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeTime(dateIndex, timeIndex)} className="w-10 h-10">
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
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
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

      <Dialog open={showErrorPopup !== null} onOpenChange={() => setErrorPopup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Update Itinerary
            </DialogTitle>
            <DialogDescription>
              {showErrorPopup || 'Not your itinerary!'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setShowErrorPopup(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}