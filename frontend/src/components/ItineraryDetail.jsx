import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Calendar, MapPin, Users, DollarSign, Globe, Accessibility, Star, Edit, Trash2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const ItineraryDetail = ({ itinerary: initialItinerary, onBack }) => {
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');

  useEffect(() => {
    if (!itinerary || !itinerary._id) {
      setError('Invalid itinerary data.');
      setLoading(false);
      return;
    }

    const fetchItineraryDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${itinerary._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch itinerary details');
        }

        const data = await response.json();
        setItinerary(data);
        setError(null);
      } catch (err) {
        setError('Error fetching itinerary details. Please try again later.');
        console.error('Error fetching itinerary details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraryDetails();
  }, [itinerary._id, userRole]);

  const handleUpdate = () => {
    // Implement update functionality
    console.log('Update itinerary');
  };

  const handleDelete = async () => {
    // Confirmation prompt before deletion
    const confirmDelete = window.confirm('Are you sure you want to delete this itinerary?');
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${itinerary._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }

      // Optionally, you can handle the response data if the API returns any
      // const data = await response.json();

      // Notify the user of successful deletion
      alert('Itinerary deleted successfully.');

      // Navigate back to the list of itineraries
      onBack();
    } catch (err) {
      setError('Error deleting itinerary. Please try again later.');
      console.error('Error deleting itinerary:', err);
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
      {/* Navigation Bar (placeholder) */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Your Logo</div>
            {/* Add navigation items here */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#1a202c] text-white py-20 px-4"> {/* Updated background color */}
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{itinerary.title}</h1>
          <p className="text-xl md:text-2xl">{itinerary.description}</p>
        </div>
      </div>

      {/* Hidden paragraph */}
      <div className="bg-gray-100 text-gray-100">
        <p>kkkkkkkkkkkkkkkkkk kkkkkkkkkkkkkkkkkkkkkkkkkkkk</p>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Itinerary Details */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-semibold">Itinerary Details</h2>
              <div className="flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-1" />
                <span className="text-lg font-semibold">{itinerary.rating || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold">Book This Itinerary</h3>
              {userRole === 'tourGuide' && (
                <div className="space-x-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
                  >
                    <Edit className="inline-block w-4 h-4 mr-2" />
                    Update
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
                  >
                    <Trash2 className="inline-block w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            {(userRole === 'tourist' || userRole === 'guest') && (
              <button className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300">
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .spinner {
          animation: rotator 1.4s linear infinite;
        }

        @keyframes rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(270deg); }
        }

        .path {
          stroke-dasharray: 187;
          stroke-dashoffset: 0;
          transform-origin: center;
          animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
        }

        @keyframes colors {
          0% { stroke: #3B82F6; }
          25% { stroke: #EF4444; }
          50% { stroke: #F59E0B; }
          75% { stroke: #10B981; }
          100% { stroke: #3B82F6; }
        }

        @keyframes dash {
          0% { stroke-dashoffset: 187; }
          50% {
            stroke-dashoffset: 46.75;
            transform: rotate(135deg);
          }
          100% {
            stroke-dashoffset: 187;
            transform: rotate(450deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ItineraryDetail;
