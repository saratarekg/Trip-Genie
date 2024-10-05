import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ChevronLeft, Star, Edit, Trash2, Mail, Phone, Award, User, DollarSign, Package, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { LocationMarkerIcon } from "@heroicons/react/solid"; 
// import { ClockIcon } from "@heroicons/react/solid"; 

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
);


const HistroricalPlaceDetail = () => {
  const { id } = useParams();
  const [historicalPlace, setHistoricalPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Your Logo</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{historicalPlace.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={historicalPlace.pictures} alt={historicalPlace.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">€ Prices:</span>
                    <span className="text-xl font-bold">Foreigner: €{historicalPlace.ticketPrices.foreigner}</span>
                    <span className="text-xl font-bold">Native: €{historicalPlace.ticketPrices.native}</span>
                    <span className="text-xl font-bold">Student: €{historicalPlace.ticketPrices.student}</span>
                  </div>
                  <div className="flex items-center">
                  {/* <ClockIcon className="w-6 h-6 mr-2 text-blue-500" /> */}
                    <span className="text-lg">Opening Hours: </span>
                    <span className="text-l">Weekdays: {historicalPlace.openingHours.weekdays}</span>
                    <span className="text-l">Weekends: {historicalPlace.openingHours.weekends}</span>
                  </div>
                  <div className="flex items-center">
                  {/* <LocationMarkerIcon className="w-6 h-6 mr-2 text-blue-500" /> */}
                    <span className="text-lg">Location: {historicalPlace.location.address}, {historicalPlace.location.city}, {historicalPlace.location.country}</span>
                  </div>
                  <p className="text-gray-700">{historicalPlace.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>

            <div className="mt-8 space-y-4">
              {(userRole === 'admin' || userRole === 'tourism-governor') && (
                <Button className="w-full" variant="default" onClick={handleUpdate}>
                  <Edit className="w-4 h-4 mr-2" /> Update Historical Place
                </Button>
              )}
              {userRole === 'admin' && (
                <Button className="w-full" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Historical Place
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Historical Place</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Historical Place? This action cannot be undone.
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

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
              Historical Place Deleted
            </DialogTitle>
            <DialogDescription>
              The Historical Place has been successfully deleted.
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
              {deleteError}
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

export default HistroricalPlaceDetail;