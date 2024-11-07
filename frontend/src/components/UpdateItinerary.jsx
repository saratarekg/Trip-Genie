import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash, Plus, CheckCircle, XCircle, Trash2 , Edit} from "lucide-react";
import signUpPicture from "../assets/images/signUpPicture.jpeg";

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

const ActivityForm = ({ onSave, onClose, initialData = {} }) => {
  const [activity, setActivity] = useState({
    name: '',
    description: '',
    location: { address: '', coordinates: { longitude: '', latitude: '' } },
    duration: '',
    timing: '',
    tags: [],
    categories: [],
    ...initialData, // This allows initialData to overwrite the defaults, but will fall back to the defaults if missing
  });
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);

  useEffect(() => {
    setActivity((prevActivity) => ({
      ...prevActivity,
      ...initialData, // Ensure that initialData properly updates activity if changed
    }));
  }, [initialData]);

  const fetchTags = async () => {
    const response = await axios.get("http://localhost:4000/api/getAllTags");
    setTags(response.data.map((tag) => ({ value: tag._id, label: tag.type })));
  };

  const fetchCategories = async () => {
    const response = await axios.get("http://localhost:4000/api/getAllCategories");
    setCategories(response.data.map((cat) => ({ value: cat._id, label: cat.name })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Helper function to handle deeply nested updates
    const updateNestedValue = (obj, path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const lastObj = keys.reduce((acc, key) => acc[key] = acc[key] || {}, obj);
      lastObj[lastKey] = value;
      return { ...obj };
    };

    setActivity((prev) => {
      // Check if the name includes dots, indicating nested structure
      if (name.includes('.')) {
        return updateNestedValue(prev, name, value);
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCheckboxChange = (field, value) => {
    setActivity(prev => {
      const currentValues = prev[field] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: updatedValues };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(activity);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={activity?.name || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={activity?.description || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="location.address" value={activity?.location?.address || ''} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="location.coordinates.longitude" type="number" step="any" value={activity?.location?.coordinates?.longitude || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="location.coordinates.latitude" type="number" step="any" value={activity?.location?.coordinates?.latitude || ''} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" name="duration" type="number" value={activity?.duration || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="timing">Timing</Label>
        <Input id="timing" name="timing" type="datetime-local" value={activity?.timing || ''} onChange={handleChange} />
      </div>
      <div>
        <Label>Tags</Label>
        <div className="grid grid-cols-2 gap-2">
          {tags.map((tag) => (
            <label key={tag.value} className="flex items-center space-x-2">
              <Checkbox
                checked={activity?.tags?.includes(tag.value)}
                onCheckedChange={(checked) => handleCheckboxChange('tags', tag.value)}
              />
              <span>{tag.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Categories</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <label key={category.value} className="flex items-center space-x-2">
              <Checkbox
                checked={activity?.categories?.includes(category.value)}
                onCheckedChange={(checked) => handleCheckboxChange('categories', category.value)}
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </div>
    
      <Button type="submit">Save Activity</Button>
    </form>
  );
};


export default function UpdateItinerary() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState({
    title: '',
    timeline: '',
    language: '',
    price: '',
    pickUpLocation: '',
    dropOffLocation: '',
    accessibility: false,
    availableDates: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraryDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await axios.get(`http://localhost:4000/tour-guide/itineraries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItinerary(response.data);
        setError(null);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraryDetails();
  }, [id]);

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

  const addDate = (e) => {
    e.preventDefault();
    const newDate = {
      date: "",
      times: [{ startTime: "", endTime: "" }]
    };
    setItinerary((prev) => ({
      ...prev,
      availableDates: [...prev.availableDates, newDate],
    }));
  };

  const removeDate = (index) => {
    setItinerary((prev) => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index),
    }));
  };

  const addTime = (e, dateIndex) => {
    e.preventDefault();
    const newDates = [...itinerary.availableDates];
    newDates[dateIndex].times.push({ startTime: '', endTime: '' });
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const removeTime = (dateIndex, timeIndex) => {
    const newDates = [...itinerary.availableDates];
    newDates[dateIndex].times.splice(timeIndex, 1);
    if (newDates[dateIndex].times.length === 0) {
      newDates.splice(dateIndex, 1);
    }
    setItinerary((prev) => ({ ...prev, availableDates: newDates }));
  };

  const handleAddActivity = (activity) => {
    setItinerary((prev) => ({
      ...prev,
      activities: [...prev.activities, activity],
    }));
    setShowActivityForm(false);
  };

  const handleEditActivity = (activity) => {
    setItinerary((prev) => ({
      ...prev,
      activities: prev.activities.map(a => a._id === activity._id ? activity : a),
    }));
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const removeActivity = (activityId) => {
    setItinerary((prev) => ({
      ...prev,
      activities: prev.activities.filter(a => a._id !== activityId),
    }));
  };

  const isFormValid = useMemo(() => {
    return (
      itinerary.title.trim() !== '' &&
      itinerary.timeline.trim() !== '' &&
      itinerary.language !== '' &&
      itinerary.price !== '' &&
      !isNaN(itinerary.price) &&
      Number(itinerary.price) >= 0 &&
      itinerary.pickUpLocation.trim() !== '' &&
      itinerary.dropOffLocation.trim() !== '' &&
      itinerary.availableDates.length > 0 &&
      itinerary.availableDates.every(date => 
        date.date && 
        date.times.length > 0 && 
        date.times.every(time => time.startTime && time.endTime)
      ) &&
      itinerary.activities.length > 0
    );
  }, [itinerary]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setShowErrorPopup("Please fill in all required fields before updating.");
      return;
    }
    
    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await axios.put(`http://localhost:4000/tour-guide/itineraries/${id}`, itinerary, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccessPopup(true);
    } catch (err) {
      setShowErrorPopup('Error updating itinerary. Please try again later.');
      console.error('Error updating itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-2"
        style={{
          backgroundImage: `linear-gradient(rgba(93, 146, 151, 0.5), rgba(93, 146, 151, 0.5)), url(${signUpPicture})`,
        }}
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-7xl flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 bg-[#B5D3D1] p-6">
            <h2 className="text-3xl font-bold text-[#1A3B47] mb-2">
              Update Itinerary
            </h2>
            <p className="text-sm mb-6 text-[#1A3B47]">
              Update the details of your itinerary. Make sure all information is accurate and up-to-date.
            </p>
          </div>
          <div className="w-full md:w-3/4 p-6">
            <form onSubmit={handleUpdate} className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Itinerary Title</Label>
                <Input id="title" name="title" value={itinerary.title} onChange={handleChange} />
                {!itinerary.title.trim() && <span className="text-red-500 text-xs">Title is required.</span>}
              </div>

              <div className="col-span-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input id="timeline" name="timeline" value={itinerary.timeline} onChange={handleChange} />
                {!itinerary.timeline.trim() && <span className="text-red-500 text-xs">Timeline is required.</span>}
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={itinerary.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {worldLanguages.map((language) => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!itinerary.language && <span className="text-red-500 text-xs">Language is required.</span>}
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
                {(itinerary.price === '' || isNaN(itinerary.price) || Number(itinerary.price) < 0) && 
                  <span className="text-red-500 text-xs">Price must be a positive number.</span>}
              </div>

              <div>
                <Label htmlFor="pickUpLocation">Pick-Up Location</Label>
                <Input id="pickUpLocation" name="pickUpLocation" value={itinerary.pickUpLocation} onChange={handleChange} />
                {!itinerary.pickUpLocation.trim() && <span className="text-red-500 text-xs">Pick-up location is required.</span>}
              </div>

              <div>
                <Label htmlFor="dropOffLocation">Drop-off Location</Label>
                <Input id="dropOffLocation" name="dropOffLocation" value={itinerary.dropOffLocation} onChange={handleChange} />
                {!itinerary.dropOffLocation.trim() && <span className="text-red-500 text-xs">Drop-off location is required.</span>}
              </div>

              <div className="col-span-4 flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={itinerary.accessibility}
                  onCheckedChange={() => handleSwitchChange('accessibility')}
                />
                <Label htmlFor="accessibility">Accessible for Disabled</Label>
              </div>

              

              <div className="col-span-3 space-y-4">
                <Label className="text-sm font-medium">Available Dates</Label>
                {itinerary.availableDates.map((dateObj, dateIndex) => (
                  <div key={dateIndex} className="mb-4 p-4 border rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        type="date"
                        value={dateObj.date.split('T')[0]}
                        onChange={(e) => handleDateChange(e.target.value, dateIndex)}
                        className={`w-40 ${!dateObj.date ? 'border-red-500' : ''}`}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeDate(dateIndex)}   className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    {dateObj.times.map((timeObj, timeIndex) => (
                      <div key={timeIndex} className="flex items-center space-x-2 mb-2">
                        <Input
                          type="time"
                          value={timeObj.startTime}
                          onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'startTime')}
                          className={`w-32 ${!timeObj.startTime ? 'border-red-500' : ''}`}
                        />
                        <Input
                          type="time"
                          value={timeObj.endTime}
                          onChange={(e) => handleTimeChange(e.target.value, dateIndex, timeIndex, 'endTime')}
                          className={`w-32 ${!timeObj.endTime ? 'border-red-500' : ''}`}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeTime(dateIndex, timeIndex)}   className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={(e) => addTime(e, dateIndex)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Time
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDate}>
                  <Plus className="mr-2 h-4 w-4" /> Add Date
                </Button>
                {itinerary.availableDates.length === 0 && <span className="text-red-500 block mt-2">At least one date is required.</span>}
              </div>
              <div className="col-span-1">
                <Label className="text-sm font-medium">Activities</Label>
                <ul className="list-disc pl-5 space-y-1">
                  {itinerary.activities.map((activity, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{activity.name}</span>
                      <div>
                      <button
                          type="button"
                          onClick={() => {
                            setEditingActivity(activity);
                            setShowActivityForm(true);
                          }}
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition duration-300 ease-in-out mr-2"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeActivity(activity._id)}
                          className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingActivity(null);
                    setShowActivityForm(true);
                  }}
                  className="w-full mt-2 bg-[#1A3B47]"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
                {itinerary.activities.length === 0 && (
                  <p className="text-red-500 text-xs mt-2">Please add at least one activity</p>
                )}
              </div>

              {!isFormValid && (
                <Alert variant="destructive" className="col-span-4">
                  <AlertDescription>
                    Please fill in all required fields before updating the itinerary.
                  </AlertDescription>
                </Alert>
              )}

              <div className="col-span-4 flex justify-end">
                <Button 
                  type="submit"
                  className="bg-[#5D9297] text-white hover:bg-[#1A3B47]"
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Updating..." : "Update Itinerary"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <ActivityForm 
              onSave={editingActivity ? handleEditActivity : handleAddActivity} 
              onClose={() => {
                setShowActivityForm(false);
                setEditingActivity(null);
              }}
              initialData={editingActivity}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

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

      <Dialog open={showErrorPopup !== null} onOpenChange={() => setShowErrorPopup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Update Itinerary
            </DialogTitle>
            <DialogDescription>
              {showErrorPopup || 'An error occurred while updating the itinerary.'}
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