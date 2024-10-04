import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Calendar, MapPin, Users, DollarSign, Globe, Accessibility, Star, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from './Loader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ItineraryDetail = ({ onBack }) => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false); // For the success message dialog

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraryDetails = async () => {
      if (!id) {
        setError('Invalid itinerary ID.');
        setLoading(false);
        return;
      }

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

  const handleUpdate = () => {
    navigate(`/update-itinerary/${id}`);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }

      // Show success dialog after deletion
      setShowDeleteSuccess(true);
    } catch (err) {
      setError('Error deleting itinerary. Please try again later.');
      console.error('Error deleting itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
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
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Your Logo</div>
          </div>
        </div>
      </nav>

      <div className="bg-[#1a202c] text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{itinerary.title}</h1>
          <p className="text-xl md:text-2xl">{itinerary.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
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

          <div className="p-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Activities</h3>
            <ul className="list-disc list-inside space-y-2">
              {itinerary.activities.map((activity, index) => (
                <li key={index} className="text-gray-700">{activity.name}</li>
              ))}
            </ul>
          </div>

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

          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold">Book This Itinerary</h3>
              {userRole === 'tour-guide' && (
                <div className="space-x-2">
                  <Button onClick={handleUpdate} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                  <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            {(userRole === 'tourist' || userRole === 'guest') && (
              <Button className="mt-4" variant="default">
                Book Now
              </Button>
            )}
          </div>
        </div>

        <Button className="mt-6" variant="outline" onClick={() => navigate('/all-itineraries')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to All Itineraries
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              Are you sure you want to delete this itinerary?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              Success
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Itinerary deleted successfully. You can navigate back to all itineraries.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSuccess(false)}>Close</Button>
            <Button onClick={() => navigate('/all-itineraries')} variant="default">Go to All Itineraries</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItineraryDetail;
