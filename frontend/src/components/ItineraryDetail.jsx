import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { XCircle, CheckCircle, ChevronLeft, Calendar, MapPin, Users, DollarSign, Globe, Accessibility, Star, Edit, Trash2, Mail, Phone, Award } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from './Loader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ItineraryDetail = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [tourGuideProfile, setTourGuideProfile] = useState(null);

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

        if (data.tourGuide) {
          const guideResponse = await fetch(`http://localhost:4000/tour-guide`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!guideResponse.ok) {
            throw new Error('Failed to fetch tour guide profile');
          }

          const guideData = await guideResponse.json();
          setTourGuideProfile(guideData);
        }
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
    setDeleteError(null);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/itineraries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setDeleteError(errorData.message);
          return;
        }
        throw new Error('Failed to delete itinerary');
      }

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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold">Itinerary Details</h1>
              <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                <Star className="w-8 h-8 text-yellow-500 mr-2" />
                <span className="text-2xl font-semibold">{itinerary.rating || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Pick-up: {itinerary.pickUpLocation}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Drop-off: {itinerary.dropOffLocation}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Tour Guide: {tourGuideProfile ? tourGuideProfile.username : 'Loading...'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Email: {tourGuideProfile ? tourGuideProfile.email : 'Loading...'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Phone: {tourGuideProfile ? tourGuideProfile.phoneNumber : 'Loading...'}</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-6 h-6 mr-2 text-orange-500" />
                  <span className="text-gray-700">Experience: {tourGuideProfile ? `${tourGuideProfile.yearsOfExperience} years` : 'Loading...'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
         
            <h3 className="text-2xl font-semibold mb-4">Activities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ul className="list-disc list-inside space-y-2">
              {itinerary.activities.map((activity, index) => (
                <li key={index} className="text-gray-700"> hy {activity.name}</li>
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
            <div className="flex justify-between mt-8">
              <Button onClick={() => navigate('/all-itineraries')} variant="outline">
                <ChevronLeft className="mr-2" /> Back to All Itineraries
              </Button>
              <div className="flex space-x-2">
                <Button onClick={handleUpdate} variant="default">
                  <Edit className="mr-2" /> Update
                </Button>
                <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive">
                  <Trash2 className="mr-2" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Itinerary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>  <CheckCircle className="w-10 h-10 text-green-500 inline-block mr-2" /> Itinerary Deleted</DialogTitle>
            <DialogDescription>
              The itinerary has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => navigate('/all-itineraries')}>
              Back to All Itineraries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteError} onOpenChange={setDeleteError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>  <XCircle className="w-10 h-10 text-red-500 inline-block mr-2" /> Failed to Delete Itinerary</DialogTitle>
            <DialogDescription>
              The itinerary is already booked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
          <Button variant="default" onClick={() => setDeleteError(null)}>
                Close
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItineraryDetail;
