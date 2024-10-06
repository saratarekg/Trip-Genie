import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  XCircle,
  CheckCircle,
  ChevronLeft,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  Accessibility,
  Star,
  Edit,
  Trash2,
  Info,
  Ticket,
  Calendar,
} from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);

const HistoricalPlaceDetail = () => {
  const { id } = useParams();
  const [historicalPlace, setHistoricalPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [mainImage, setMainImage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoricalPlaceDetails = async () => {
      if (!id) {
        setError('Invalid historical place ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get('jwt');
        const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch historical place details');
        }

        const data = await response.json();
        setHistoricalPlace(data);
        if (data.pictures && data.pictures.length > 0) {
          setMainImage(data.pictures[0]);
        }
        setError(null);
      } catch (err) {
        setError('Error fetching historical place details. Please try again later.');
        console.error('Error fetching historical place details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalPlaceDetails();
  }, [id, userRole]);

  const handleUpdate = () => {
    navigate(`/update-historical-place/${id}`);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
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
        throw new Error('Failed to delete historical place');
      }

      setShowDeleteSuccess(true);
    } catch (err) {
      setError('Error deleting historical place. Please try again later.');
      console.error('Error deleting historical place:', err);
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

  if (!historicalPlace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">No Data:</strong>
          <span className="block sm:inline"> Historical place not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#1a202c] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-white">Historical Places</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{historicalPlace.title}</h1>
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="text-lg font-semibold">{historicalPlace.rating || 'N/A'}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <div className="relative pb-[56.25%] h-0">
                  <img src={mainImage} alt={historicalPlace.title} className="absolute top-0 left-0 w-full h-full object-cover rounded-lg" />
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {historicalPlace.pictures && historicalPlace.pictures.map((pic, index) => (
                    <img
                      key={index}
                      src={pic}
                      alt={`${historicalPlace.title} - ${index + 1}`}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                      onClick={() => setMainImage(pic)}
                    />
                  ))}
                </div>
              </div>

              <div className="md:w-1/3 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                      <span>{historicalPlace.location?.address || 'N/A'}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Globe className="w-5 h-5 mr-2 text-gray-500" />
                      <span>{historicalPlace.location?.city}, {historicalPlace.location?.country}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Prices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Foreigner:</span>
                      <span>€{historicalPlace.ticketPrices?.foreigner || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Native:</span>
                      <span>€{historicalPlace.ticketPrices?.native || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Student:</span>
                      <span>€{historicalPlace.ticketPrices?.student || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Opening Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Weekdays:</span>
                      <span>{historicalPlace.openingHours?.weekdays || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Weekends:</span>
                      <span>{historicalPlace.openingHours?.weekends || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{historicalPlace.description || 'No description available.'}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Accessibility className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Accessibility: {historicalPlace.accessibility ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Guided Tours Available</span>
                </div>
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Information Center</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Special Events</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {historicalPlace.historicalTag && historicalPlace.historicalTag.length > 0 ? (
                  historicalPlace.historicalTag.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Info className="w-4 h-4 mr-1" />
                      {tag.type}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">No tags available</span>
                )}
              </div>
            </div>

            {(userRole === 'admin' || userRole === 'tourism-governor') && (
              <div className="mt-8 flex justify-end space-x-4">
                <Button onClick={handleUpdate} variant="default" className="flex items-center bg-[#1a202c] hover:bg-[#2d3748]">
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Historical Place</DialogTitle>
            <DialogDescription>Are you sure you want to delete this historical place?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Historical Place Deleted
            </DialogTitle>
            <DialogDescription>
              The historical place has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => navigate('/all-historical-places')}>
              Back to All Historical Places
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteError !== null} onOpenChange={() => setDeleteError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Delete Historical Place
            </DialogTitle>
            <DialogDescription>
              {deleteError || 'An error occurred while deleting the historical place.'}
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

export default HistoricalPlaceDetail;