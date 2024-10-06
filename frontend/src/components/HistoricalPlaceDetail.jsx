// import React, { useState, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import {
//   XCircle,
//   CheckCircle,
//   MapPin,
//   Clock,
//   DollarSign,
//   Globe,
//   Edit,
//   Trash2,
//   Info,
//   X,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// const LoadingSpinner = () => (
//   <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
//     <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
//       <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
//     </svg>
//   </div>
// );

// const ImagePreviewModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
//   return (
//     <div className="fixed inset-0 bg-blue-900 bg-opacity-75 flex items-center justify-center z-50">
//       <div className="relative w-full h-full">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
//         >
//           <X size={32} />
//         </button>
//         <button
//           onClick={onPrev}
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
//         >
//           <ChevronLeft size={48} />
//         </button>
//         <button
//           onClick={onNext}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
//         >
//           <ChevronRight size={48} />
//         </button>
//         <img
//           src={images[currentIndex]}
//           alt={`Full-size preview ${currentIndex + 1}`}
//           className="w-full h-full object-contain"
//         />
//       </div>
//     </div>
//   );
// };

// const HistoricalPlaceDetail = () => {
//   const { id } = useParams();
//   const [historicalPlace, setHistoricalPlace] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
//   const [deleteError, setDeleteError] = useState(null);
//   const [mainImage, setMainImage] = useState('');
//   const [showImagePreview, setShowImagePreview] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchHistoricalPlaceDetails = async () => {
//       if (!id) {
//         setError('Invalid historical place ID.');
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const token = Cookies.get('jwt');
//         const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch historical place details');
//         }

//         const data = await response.json();
//         setHistoricalPlace(data);
//         if (data.pictures && data.pictures.length > 0) {
//           setMainImage(data.pictures[0]);
//         }
//         setError(null);
//       } catch (err) {
//         setError('Error fetching historical place details. Please try again later.');
//         console.error('Error fetching historical place details:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistoricalPlaceDetails();
//   }, [id, userRole]);

//   const handleUpdate = () => {
//     navigate(`/update-historical-place/${id}`);
//   };

//   const handleDelete = async () => {
//     setShowDeleteConfirm(false);
//     setLoading(true);
//     setDeleteError(null);
//     try {
//       const token = Cookies.get('jwt');
//       const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         if (response.status === 400) {
//           setDeleteError(errorData.message);
//           return;
//         }
//         throw new Error('Failed to delete historical place');
//       }

//       setShowDeleteSuccess(true);
//     } catch (err) {
//       setError('Error deleting historical place. Please try again later.');
//       console.error('Error deleting historical place:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openImagePreview = (index) => {
//     setCurrentImageIndex(index);
//     setShowImagePreview(true);
//   };

//   const closeImagePreview = () => {
//     setShowImagePreview(false);
//   };

//   const goToPrevImage = () => {
//     setCurrentImageIndex((prevIndex) =>
//       prevIndex === 0 ? historicalPlace.pictures.length - 1 : prevIndex - 1
//     );
//   };

//   const goToNextImage = () => {
//     setCurrentImageIndex((prevIndex) =>
//       prevIndex === historicalPlace.pictures.length - 1 ? 0 : prevIndex + 1
//     );
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//           <strong className="font-bold">Error!</strong>
//           <span className="block sm:inline"> {error}</span>
//         </div>
//       </div>
//     );
//   }

//   if (!historicalPlace) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
//           <strong className="font-bold">No Data:</strong>
//           <span className="block sm:inline"> Historical place not found.</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-[#1a202c] shadow-md">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div className="text-xl font-semibold text-white">Historical Places</div>
//           </div>
//         </div>
//       </nav>

//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//           <div className="p-6">
//             <div className="flex flex-col mb-6">
//               <div className="flex justify-between items-start mb-2">
//                 <h1 className="text-3xl font-bold">{historicalPlace.title}</h1>
//                 <div className="flex flex-wrap gap-2">
//                   {historicalPlace.historicalTag && historicalPlace.historicalTag.length > 0 ? (
//                     historicalPlace.historicalTag.map((tag, index) => (
//                       <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
//                         <Info className="w-4 h-4 mr-1" />
//                         {tag.type}
//                       </Badge>
//                     ))
//                   ) : (
//                     <span className="text-gray-500">No tags available</span>
//                   )}
//                 </div>
//               </div>
//               <p className="text-gray-600 mt-2">{historicalPlace.description || 'No description available.'}</p>
//             </div>

//             <div className="flex flex-col md:flex-row gap-8">
//               <div className="md:w-2/3">
//                 <div className="relative pb-[56.25%] h-0">
//                   <img
//                     src={mainImage}
//                     alt={historicalPlace.title}
//                     className="absolute top-0 left-0 w-full h-full object-cover rounded-lg cursor-pointer"
//                     onClick={() => openImagePreview(historicalPlace.pictures.indexOf(mainImage))}
//                   />
//                 </div>
//                 <div className="mt-4 flex gap-2 overflow-x-auto">
//                   {historicalPlace.pictures && historicalPlace.pictures.map((pic, index) => (
//                     <img
//                       key={index}
//                       src={pic}
//                       alt={`${historicalPlace.title} - ${index + 1}`}
//                       className="w-24 h-24 object-cover rounded cursor-pointer"
//                       onClick={() => {
//                         setMainImage(pic);
//                         openImagePreview(index);
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="md:w-1/3 space-y-4">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Location</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center">
//                       <MapPin className="w-5 h-5 mr-2 text-gray-500" />
//                       <span>{historicalPlace.location?.address || 'N/A'}</span>
//                     </div>
//                     <div className="flex items-center mt-2">
//                       <Globe className="w-5 h-5 mr-2 text-gray-500" />
//                       <span>{historicalPlace.location?.city}, {historicalPlace.location?.country}</span>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Ticket Prices</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center justify-between">
//                       <span>Foreigner:</span>
//                       <span>€{historicalPlace.ticketPrices?.foreigner || 'N/A'}</span>
//                     </div>
//                     <div className="flex items-center justify-between mt-2">
//                       <span>Native:</span>
//                       <span>€{historicalPlace.ticketPrices?.native || 'N/A'}</span>
//                     </div>
//                     <div className="flex items-center justify-between mt-2">
//                       <span>Student:</span>
//                       <span>€{historicalPlace.ticketPrices?.student || 'N/A'}</span>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Opening Hours</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center justify-between">
//                       <span>Weekdays:</span>
//                       <span>{historicalPlace.openingHours?.weekdays || 'N/A'}</span>
//                     </div>
//                     <div className="flex items-center justify-between mt-2">
//                       <span>Weekends:</span>
//                       <span>{historicalPlace.openingHours?.weekends || 'N/A'}</span>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>

//             {(userRole === 'admin' || userRole === 'tourism-governor') && (
//               <div className="mt-8 flex justify-end space-x-4">
//                 <Button onClick={handleUpdate} variant="default" className="flex items-center bg-[#1a202c] hover:bg-[#2d3748]">
//                   <Edit className="w-4 h-4 mr-2" />
//                   Update
//                 </Button>
//                 <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="flex items-center">
//                   <Trash2 className="w-4 h-4 mr-2" />
//                   Delete
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showImagePreview && (
//         <ImagePreviewModal
//           images={historicalPlace.pictures}
//           currentIndex={currentImageIndex}
//           onClose={closeImagePreview}
//           onPrev={goToPrevImage}
//           onNext={goToNextImage}
//         />
//       )}

//       <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete Historical Place</DialogTitle>
//             <DialogDescription>Are you sure you want to delete this historical place?</DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
//             <Button variant="destructive" onClick={handleDelete}>Delete</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
//               Historical Place Deleted
//             </DialogTitle>
//             <DialogDescription>
//               The historical place has been successfully deleted.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="default" onClick={() => navigate('/all-historical-places')}>
//               Back to All Historical Places
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={deleteError !== null} onOpenChange={() => setDeleteError(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
//               Failed to Delete Historical Place
//             </DialogTitle>
//             <DialogDescription>
//               {deleteError || 'An error occurred while deleting the historical place.'}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="default" onClick={() => setDeleteError(null)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default HistoricalPlaceDetail;

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as jwtDecode from "jwt-decode";
import {
  XCircle,
  CheckCircle,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  Edit,
  Trash2,
  Info,
  Tag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg
      className="spinner"
      width="65px"
      height="65px"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="path"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    </svg>
  </div>
);

const HistoricalPlaceDetail = () => {
  const { id } = useParams();
  const [historicalPlace, setHistoricalPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [canModify, setCanModify] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoricalPlaceDetails = async () => {
      if (!id) {
        setError("Invalid historical place ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `http://localhost:4000/${userRole}/historical-places/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historical place details");
        }

        const data = await response.json();
        setHistoricalPlace(data);
        if (data.pictures && data.pictures.length > 0) {
          setMainImage(data.pictures[0]);
        }
        if (token) {
          const decodedToken = jwtDecode.jwtDecode(token);
          setCanModify(decodedToken.id === data.governor._id);
        }
        setError(null);
      } catch (err) {
        setError(
          "Error fetching historical place details. Please try again later."
        );
        console.error("Error fetching historical place details:", err);
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
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/historical-places/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setDeleteError(errorData.message);
          return;
        }
        if (response.status === 403) {
          setDeleteError(errorData.message);
          return;
        }

        throw new Error("Failed to delete historical place");
      }

      setShowDeleteSuccess(true);
    } catch (err) {
      setError("Error deleting historical place. Please try again later.");
      console.error("Error deleting historical place:", err);
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
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!historicalPlace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">No Data:</strong>
          <span className="block sm:inline"> Historical place not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="container mx-auto px-4 py-8 ">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold">{historicalPlace.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {historicalPlace.historicalTag &&
                  historicalPlace.historicalTag.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {historicalPlace.historicalTag.map(
                        (historicalTag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-lg px-4 py-2 rounded-full flex items-center" // Adjust font size, padding, and make it a flex container
                          >
                            <Tag className="mr-2" />{" "}
                            {/* Adds an icon-like tag inside the badge */}
                            {historicalTag.type}
                          </Badge>
                        )
                      )}
                      {historicalPlace.historicalTag.map(
                        (historicalTag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-lg px-4 py-2 rounded-full flex items-center" // Same styles for the period badge
                          >
                            <Tag className="mr-2" />{" "}
                            {/* Tag icon for the period as well */}
                            {historicalTag.period}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p>No tags available</p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                {historicalPlace.description || "No description available."}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <div className="relative pb-[56.25%] h-0">
                  <img
                    src={mainImage}
                    alt={historicalPlace.title}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {historicalPlace.pictures &&
                    historicalPlace.pictures.map((pic, index) => (
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
                      <span>{historicalPlace.location?.address || "N/A"}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Globe className="w-5 h-5 mr-2 text-gray-500" />
                      <span>
                        {historicalPlace.location?.city},{" "}
                        {historicalPlace.location?.country}
                      </span>
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
                      <span>
                        ${historicalPlace.ticketPrices?.foreigner || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Native:</span>
                      <span>
                        ${historicalPlace.ticketPrices?.native || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Student:</span>
                      <span>
                        ${historicalPlace.ticketPrices?.student || "N/A"}
                      </span>
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
                      <span>
                        {historicalPlace.openingHours?.weekdays || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Weekends:</span>
                      <span>
                        {historicalPlace.openingHours?.weekends || "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {(userRole === "admin" ||
              (canModify && userRole === "tourism-governor")) && (
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  onClick={handleUpdate}
                  variant="default"
                  className="flex items-center bg-[#1a202c] hover:bg-[#2d3748]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="flex items-center"
                >
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
            <DialogDescription>
              Are you sure you want to delete this historical place?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
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
              The historical place has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => navigate("/all-historical-places")}
            >
              Back to All Historical Places
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteError !== null}
        onOpenChange={() => setDeleteError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Delete Historical Place
            </DialogTitle>
            <DialogDescription>
              {deleteError ||
                "An error occurred while deleting the historical place."}
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
