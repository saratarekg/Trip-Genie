import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FilterComponent from "./Filter.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.jsx";
import { Button } from "@/components/ui/button";
import * as jwtDecode from "jwt-decode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ItineraryCard = ({
  itinerary,
  onSelect,
  role,
  canModify,
  setShowDeleteConfirm,
  setSelectedItinerary,
}) => (
  <Card
    className="overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
    onClick={() => onSelect(itinerary._id)}
  >
    <div className="relative aspect-video overflow-hidden">
      <img
        src={
          itinerary.activities &&
          itinerary.activities.length > 0 &&
          itinerary.activities[0].pictures &&
          itinerary.activities[0].pictures.length > 0
            ? itinerary.activities[0].pictures[0]
            : defaultImage
        }
        alt={itinerary.title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      />
    </div>
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {itinerary.title}
        </CardTitle>
        {!itinerary.isActivated && role === "tour-guide" && (
          <Badge className="bg-red-500 text-white hover:bg-red-500 hover:text-white">
            Deactivated
          </Badge>
        )}
        {!itinerary.isActivated && role === "tourist" && (
          <Badge className="bg-red-500 text-white hover:bg-red-500 hover:text-white">
            Currently Unavailable
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{itinerary.timeline}</p>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-primary">
          ${itinerary.price}/Day
        </span>
        <span className="text-sm text-muted-foreground">
          {itinerary.language}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {itinerary.activities &&
          itinerary.activities.map((activity, index) => (
            <React.Fragment key={index}>
              {activity.category &&
                activity.category.map((cat) => (
                  <Badge key={cat.id || cat.name} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
              {activity.tags &&
                activity.tags.map((tag) => (
                  <Badge key={tag.id || tag.type} variant="outline">
                    {tag.type}
                  </Badge>
                ))}
            </React.Fragment>
          ))}
      </div>
    </CardContent>
    {role === "tour-guide" && canModify && (
      <CardFooter className="p-4 pt-0">
        <div className="flex justify-end space-x-4 w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/update-itinerary/${itinerary._id}`;
            }}
            variant="default"
            className="flex items-center bg-primary hover:bg-primary/90"
          >
            <Edit className="w-4 h-4 mr-2" />
            Update
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItinerary(itinerary._id);
              setShowDeleteConfirm(true);
            }}
            variant="destructive"
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardFooter>
    )}
  </Card>
);

export function AllItinerariesComponent() {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [myItineraries, setMyItineraries] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [dateRange, setDateRange] = useState({ lower: "", upper: "" });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [tripsPerPage] = useState(6);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [typesOptions, setTypesOptions] = useState([]);
  const [languagesOptions, setLanguagesOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [canModify, setCanModify] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isSortedByPreference, setIsSortedByPreference] = useState(false);

  const navigate = useNavigate();

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  const handleItinerarySelect = (id) => {
    navigate(`/itinerary/${id}`);
  };

  const fetchItineraries = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const role = getUserRole();

      if (role === "tourist" && !searchTerm && !sortBy && !myItineraries) {
        const preferredItineraries = await fetch(
          "http://localhost:4000/tourist/itineraries-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        const otherItineraries = await fetch(
          "http://localhost:4000/tourist/itineraries-not-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        setItineraries([...preferredItineraries, ...otherItineraries]);
        setIsSortedByPreference(true);
      } else {
        const url = new URL(`http://localhost:4000/${role}/itineraries`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setItineraries(data);
        setIsSortedByPreference(false);
      }

      setError(null);
      setCurrentPage(1);
      setCanModify(true);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      setError("Error fetching itineraries");
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortBy, myItineraries]);

  const searchItineraries = useCallback(async () => {
    setIsSortedByPreference(false);
    try {
      setIsLoading(true);
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/itineraries`);

      if (priceRange[0] !== 0 || priceRange[1] !== maxPrice) {
        url.searchParams.append("minPrice", priceRange[0].toString());
        url.searchParams.append("maxPrice", priceRange[1].toString());
      }
      if (myItineraries) {
        url.searchParams.append("myItineraries", myItineraries);
      }
      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }
      if (price && price !== "") {
        url.searchParams.append("budget", price);
      }
      if (dateRange.upper) {
        url.searchParams.append("upperDate", dateRange.upper);
      }
      if (dateRange.lower) {
        url.searchParams.append("lowerDate", dateRange.lower);
      }
      if (selectedTypes.length > 0) {
        url.searchParams.append("types", selectedTypes.join(","));
      }
      if (selectedLanguages.length > 0) {
        url.searchParams.append("languages", selectedLanguages.join(","));
      }
      if (isBooked) {
        url.searchParams.append("isBooked", isBooked);
      }
      if (sortBy) {
        url.searchParams.append("sort", sortBy);
      }
      if (sortOrder) {
        url.searchParams.append("asc", sortOrder);
      }

      const token = Cookies.get("jwt");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItineraries(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Error fetching filtered results");
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    priceRange,
    maxPrice,
    myItineraries,
    searchTerm,
    price,
    dateRange,
    selectedTypes,
    selectedLanguages,
    isBooked,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchItineraries();

    const fetchData = async () => {
      try {
        const [typesResponse, languagesResponse] = await Promise.all([
          axios.get("http://localhost:4000/api/getAllTypes"),
          axios.get("http://localhost:4000/api/getAllLanguages"),
        ]);
        setTypesOptions(typesResponse.data);
        setLanguagesOptions(languagesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm || sortBy || sortOrder || myItineraries) {
        searchItineraries();
      } else {
        fetchItineraries();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    sortBy,
    sortOrder,
    myItineraries,
    searchItineraries,
    fetchItineraries,
  ]);

  const handleSort = (attribute) => {
      setIsLoading(true);
      const newSortOrder = sortOrder === 1 ? -1 : 1;
      setSortOrder(newSortOrder);
      setSortBy(attribute);
      setIsLoading(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleMyItineraries = (attribute) => {
    setMyItineraries(attribute);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPrice("");
    setDateRange({ lower: "", upper: "" });
    setSelectedTypes([]);
    setSelectedLanguages([]);
    setSortBy("");
    setSortOrder("");
    setMyItineraries(false);
    setIsBooked(false);
    setPriceRange([0, maxPrice]);
    fetchItineraries();
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setIsLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${getUserRole()}/itineraries/${selectedItinerary}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 403) {
          setDeleteError(errorData.message);
          return;
        }
        throw new Error("Failed to delete itinerary");
      }

      setShowDeleteSuccess(true);
      fetchItineraries();
    } catch (err) {
      setError("Error deleting itinerary. Please try again later.");
      console.error("Error deleting itinerary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              All Trip Plans
            </h1>

            {isSortedByPreference && getUserRole() === "tourist" && (
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Sorted based on your preferences
              </h2>
            )}

            <div className="flex flex-col mb-8">
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  placeholder="Search trips..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <FilterComponent
                filtersVisible={filtersVisible}
                toggleFilters={toggleFilters}
                sortOrder={sortOrder}
                sortBy={sortBy}
                myItineraries={myItineraries}
                handlemyItineraries={handleMyItineraries}
                handleSort={handleSort}
                clearFilters={clearFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
                price={price}
                setPrice={setPrice}
                dateRange={dateRange}
                setDateRange={setDateRange}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                selectedLanguages={selectedLanguages}
                setSelectedLanguages={setSelectedLanguages}
                searchItineraries={searchItineraries}
                typesOptions={typesOptions}
                languagesOptions={languagesOptions}
                role={getUserRole()}
                isBooked={isBooked}
                setIsBooked={setIsBooked}
              />
            </div>

            {error && (
              <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries
                .slice(
                  (currentPage - 1) * tripsPerPage,
                  currentPage * tripsPerPage
                )
                .map((itinerary) => (
                  <ItineraryCard
                    key={itinerary._id}
                    itinerary={itinerary}
                    onSelect={handleItinerarySelect}
                    role={getUserRole()}
                    canModify={canModify}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                    setSelectedItinerary={setSelectedItinerary}
                  />
                ))}
            </div>

            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full bg-white shadow ${
                  currentPage === 1 ? "text-gray-300" : "text-blue-600"
                }`}
              >
                <ChevronLeft />
              </button>

              <span className="text-lg font-medium">
                {itineraries.length > 0
                  ? `Page ${currentPage} of ${Math.ceil(
                      itineraries.length / tripsPerPage
                    )}`
                  : "No pages available"}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                    Math.ceil(itineraries.length / tripsPerPage) ||
                  itineraries.length === 0
                }
                className={`px-4 py-2 rounded-full bg-white shadow ${
                  currentPage === Math.ceil(itineraries.length / tripsPerPage)
                    ? "text-gray-300"
                    : "text-blue-600"
                }`}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Itinerary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this itinerary?
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
              Itinerary Deleted
            </DialogTitle>
            <DialogDescription>
              The itinerary has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                setShowDeleteSuccess(false);
                navigate("/all-itineraries");
              }}
            >
              Back to All Itineraries
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
              Failed to Delete Itinerary
            </DialogTitle>
            <DialogDescription>
              {deleteError || "Itinerary is already booked!"}
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
}

export default AllItinerariesComponent;
