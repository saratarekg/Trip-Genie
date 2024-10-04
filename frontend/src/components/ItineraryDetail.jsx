import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, DollarSign, Globe, Accessibility } from 'lucide-react';

const ItineraryDetail = (props) => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ensure selectedItinerary and its _id are defined
  const id = props.itinerary ? props.itinerary._id : null;

  useEffect(() => {
    if (!id) {
      console.log(id);
      setError('Invalid itinerary ID.');
      setLoading(false);
      return;
    }

    const fetchItineraryDetails = async () => {
      setLoading(true);
      try {
        const role = Cookies.get('role') || 'guest';
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${role}/itineraries/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("line 1");

        if (!response.ok) { 
          throw new Error('Failed to fetch itinerary details');
        }
        
        console.log("line 2");

        // Log the response text
        const responseText = await response.text();
        console.log("Response Text:", responseText);

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = JSON.parse(responseText);
        
        console.log("line 3");
        setItinerary(data);
        
        console.log("line 4");
        setError(null);
        
        console.log("line 5");
      } catch (err) {
        setError('Error fetching itinerary details. Please try again later.');
        console.error('Error fetching itinerary details:', err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchItineraryDetails();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (itinerary?.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (itinerary?.images?.length || 1)) % (itinerary?.images?.length || 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
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
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center">
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">{itinerary.title}</h1>
        </div>
        <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full" aria-label="Previous image">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full" aria-label="Next image">
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Itinerary Details */}
          <div className="p-6">
            <h2 className="text-3xl font-semibold mb-4">Itinerary Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Timeline: {itinerary.timeline}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Language: {itinerary.language}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Price: ${itinerary.price}</span>
                </div>
                <div className="flex items-center">
                  <Accessibility className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Accessibility: {itinerary.accessibility ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Pick-up: {itinerary.pickUpLocation}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Drop-off: {itinerary.dropOffLocation}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Tour Guide: {itinerary.tourGuide.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Activities</h3>
            <ul className="list-disc list-inside space-y-2">
              {itinerary.activities.map((activity, index) => (
                <li key={index} className="text-gray-700">{activity.name}</li>
              ))}
            </ul>
          </div>

          {/* Available Dates */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Available Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itinerary.availableDates.map((dateInfo, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                    <span className="font-semibold">{new Date(dateInfo.date).toLocaleDateString()}</span>
                  </div>
                  <ul className="space-y-1">
                    {dateInfo.times.map((time, timeIndex) => (
                      <li key={timeIndex} className="text-sm text-gray-600">
                        {time.startTime} - {time.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Book This Itinerary</h3>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetail;
