import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Calendar, MapPin, Users, DollarSign, Globe, Accessibility, Star, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const UpdateItinerary = () => {
  const { id } = useParams(); // Get itinerary ID from URL
  const [itinerary, setItinerary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraryDetails = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${id}`, {
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
  }, [id, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary((prevItinerary) => ({
      ...prevItinerary,
      [name]: value,
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

      // Notify the user of successful update
      alert('Itinerary updated successfully.');

      // Navigate back to the itinerary detail page
      navigate(`/itinerary/${id}`);
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
      {/* Navigation Bar (placeholder) */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Your Logo</div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#1a202c] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Update Itinerary</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-semibold">Edit Itinerary Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-700">Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={itinerary.title || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Description:</label>
                  <textarea
                    name="description"
                    value={itinerary.description || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Language:</label>
                  <input
                    type="text"
                    name="language"
                    value={itinerary.language || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Price:</label>
                  <input
                    type="number"
                    name="price"
                    value={itinerary.price || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Pick-up Location:</label>
                  <input
                    type="text"
                    name="pickUpLocation"
                    value={itinerary.pickUpLocation || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Drop-off Location:</label>
                  <input
                    type="text"
                    name="dropOffLocation"
                    value={itinerary.dropOffLocation || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-700">Accessibility:</label>
                  <select
                    name="accessibility"
                    value={itinerary.accessibility ? 'true' : 'false'}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700">Activities:</label>
                  {itinerary.activities && itinerary.activities.map((activity, index) => (
                    <input
                      key={index}
                      type="text"
                      value={activity.name}
                      onChange={(e) => {
                        const newActivities = [...itinerary.activities];
                        newActivities[index].name = e.target.value;
                        setItinerary((prev) => ({ ...prev, activities: newActivities }));
                      }}
                      className="border border-gray-300 p-2 rounded mb-2"
                      placeholder="Activity Name"
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
            >
              Confirm Update
            </button>
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

export default UpdateItinerary;
