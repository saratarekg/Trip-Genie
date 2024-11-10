import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import FilterComponent from "../components/FilterActivities.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import ActivityDetail from "./SingleActivity.jsx";
import { Star } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { set } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  activityName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">
          Are you sure you want to delete the activity "{activityName}"?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

let exchangeRateForFilter = 1;
const role = Cookies.get("role")

const ActivityCard = ({ activity, onSelect, userInfo , onDeleteConfirm, setShowDeleteConfirm,}) => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(null);

  useEffect(() => {
    if (
      userInfo &&
      userInfo.role == "tourist" &&
      userInfo.preferredCurrency !== activity.currency
    ) {
      // console.log("exchange rate tyb?");
      fetchExchangeRate();
    } else {
      // console.log("ba get currency");
      getCurrencySymbol();
    }
  }, [userInfo, activity]);

  const fetchExchangeRate = useCallback(async () => {
    if (userInfo && userInfo.role == "tourist") {
      try {
        const token = Cookies.get("jwt");
        const response = await fetch(
          `http://localhost:4000/${userInfo.role}/populate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base: activity.currency,
              target: userInfo.preferredCurrency._id,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setExchangeRate(data.conversion_rate);
        } else {
          console.error("Error in fetching exchange rate:", data.message);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    }
  }, [userInfo, activity]);

  const getCurrencySymbol = useCallback(async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/${userInfo.role}/getCurrency/${activity.currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrencySymbol(response.data.symbol);
    } catch (error) {
      console.error("Error fetching currency symbol:", error);
    }
  }, [userInfo, activity]);

  const formatPrice = (price) => {
    // if (!userInfo || !price) return '';

    if (userInfo?.role === "tourist" && userInfo?.preferredCurrency) {
      if (userInfo.preferredCurrency === activity.currency) {
        return `${userInfo.preferredCurrency.symbol}${price}`;
      } else if (exchangeRate) {
        const exchangedPrice = price * exchangeRate;
        return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(
          2
        )}`;
      }
    } else if (currencySymbol) {
      // console.log("currencySymbol:", currencySymbol, "price:", price);
      return `${currencySymbol}${price}`;
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
      onClick={() => onSelect(activity._id)}
     
    >
      <div className="relative aspect-video overflow-hidden">
  <img
    src={
      activity.pictures && activity.pictures.length > 0
        ? activity.pictures[0]?.url
        : defaultImage
    }
    alt={activity.name}
    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
  />
  
  {/* {(() => {
    console.log("User Role:", role);
    console.log("User Info ID:", userInfo?.userId); // Use optional chaining to safely access userId
    console.log("Activity Advertiser ID:", activity?.advertiser); // Safely access activity.advertiser
    return null; // No visual output, just for logging
  })()}
   */}
  {role === "advertiser" && userInfo?.userId === activity?.advertiser && (
    <div className="absolute top-2 right-2 flex space-x-2">
      <button
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/update-activity/${activity._id}`;
        }}
        aria-label="Edit activity"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteConfirm(activity._id, activity.name);
        }}
        aria-label="Delete activity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )}
</div>

      <CardHeader className="p-4">
        <CardTitle className="text-xl font-semibold">{activity.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {activity.location.address}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < activity.rating
                  ? "text-[#F88C33] fill-[#F88C33]"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            {activity.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary">
            {formatPrice(activity.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {activity.duration} hours
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(activity.timing).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {activity.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag.type}
            </Badge>
          ))}
          {activity.category.map((cat, index) => (
            <Badge key={index} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export function MyActivitiesComponent() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSortedByPreference, setIsSortedByPreference] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [maxPriceOfProducts,setMaxPriceOfProducts] = useState(1000);
  const [priceRange, setPriceRange] = useState([0, maxPriceOfProducts]);
  const [maxPrice, setMaxPrice] = useState(maxPriceOfProducts);
  const [initialPriceRange, setInitialPriceRange] = useState([0, maxPriceOfProducts]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const activitiesPerPage = 6;
  const [myActivities, setMyActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minStars, setMinStars] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false); // To track if it's the initial load
  const [userInfo, setUserInfo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isPriceInitialized, setIsPriceInitialized] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const navigate = useNavigate();

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    const token = Cookies.get("jwt");

    if (role === "tourist") {
      try {
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currencyId = response.data.preferredCurrency;

        const currencyResponse = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${currencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserInfo({
          role,
          preferredCurrency: currencyResponse.data,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({ role });
      }
    }  else {
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserInfo({
          role,
          userId: decodedToken.id
        });        
      }else{    
          setUserInfo({ role ,
           });
    }
    } 
  }, []);

  useEffect(() => {
    if(!isPriceInitialized){
      fetchMaxPrice();
      }
  }, [userInfo]);

  const fetchMaxPrice = async () => {
    const role = getUserRole();
    const token = Cookies.get("jwt");
    const url = new URL(`http://localhost:4000/${role}/max-price-activities-my`);
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setMaxPriceOfProducts(data);
          setPriceRange([0, data]);
          setIsPriceInitialized(true);
          
    };

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  const getSymbol = () => {
    if (userInfo && userInfo.role === "tourist" && userInfo.preferredCurrency) {
      return `${userInfo.preferredCurrency.symbol}`;
    } else {
      return "$";
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      fetchActivities();
    }
  }, [userInfo]);

  const handleSortByPreference = async () => {
    if (!isSortedByPreference) {
      await fetchActivitiesByPreference();
    } else {
      setIsSortedByPreference(false);
      // Implement your default sorting logic here
      await fetchActivities();
    }
  };
  const handleActivitySelect = (id) => {
    setIsLoading(true);
    navigate(`/activity/${id}`);
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchActivities();
      } else {
        fetchActivities();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  useEffect(() => {
    searchActivities();
  }, [myActivities]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlemyActivities = (attribute) => {
    setIsLoading(true);
    setMyActivities(attribute);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/getAllCategories"
        );
        setCategoryOptions(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (sortBy || searchTerm || filtersVisible) {
      setIsSortedByPreference(false);
    }
  }, [sortBy, searchTerm, filtersVisible]);

  useEffect(() => {
    if (sortBy) {
      searchActivities();
    }
  }, [sortBy, sortOrder]);

  const handleSort = (attribute) => {
    setIsLoading(true);
    const newSortOrder = sortOrder === 1 ? -1 : 1;
    setSortOrder(newSortOrder);
    setSortBy(attribute);
    setIsLoading(false);
  };

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const role = getUserRole();

      if (role === "tourist" && !isInitialized) {
        const preferredActivities = await fetch(
          "http://localhost:4000/tourist/activities-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        const otherActivities = await fetch(
          "http://localhost:4000/tourist/activities-not-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        setActivities([...preferredActivities, ...otherActivities]);
        setIsSortedByPreference(true);
        setIsInitialized(true);
      } else {
        const url = new URL(`http://localhost:4000/${role}/activities?myActivities=true`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActivities(data);
      }

      // Calculate max price
      const maxActivityPrice = Math.max(
        ...activities.map((activity) => activity.price)
      );
      const roundedMaxPrice = Math.ceil(maxActivityPrice / 100) * 100;

      if (roundedMaxPrice > -Infinity) {
        setMaxPrice(roundedMaxPrice);
        setInitialPriceRange([0, roundedMaxPrice]);
        setPriceRange([0, roundedMaxPrice]);
      }
      setError(null);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Error fetching activities");
      setActivities([]);
      setIsLoading(false);
    }
  }, [userInfo, isSortedByPreference]);

  const searchActivities = async () => {
    setIsSortedByPreference(false);
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/activities?myActivities=true`);

      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }
      if (priceRange[0] !== 0 || priceRange[1] !== 1000) {
        url.searchParams.append("minPrice", priceRange[0]);
        url.searchParams.append("price", priceRange[1]);
      }

      if (dateRange.end) {
        url.searchParams.append("endDate", dateRange.end);
      }
      if (dateRange.start) {
        url.searchParams.append("startDate", dateRange.start);
      }
      if (selectedCategories.length > 0) {
        url.searchParams.append(
          "category",
          selectedCategories.map((c) => c.name).join(",")
        );
      }
      if (minStars) {
        url.searchParams.append("minRating", minStars);
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
      setActivities(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      setError("Error fetching filtered results");
      setActivities([]);
    }
  };

  const handleDeleteConfirm = (id, name) => {
    setActivityToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;

    setIsLoading(true);
    setDeleteError(null);
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${role}/activities/${activityToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          response.status === 400 &&
          errorData.message === "Cannot delete activity with existing bookings"
         
        ) {
          setError("Cannot Delete Activity With Existing Bookings.");
          setDeleteError("Cannot Delete Activity With Existing Bookings.");
          return;
        }
        throw new Error("Failed to delete activity");
      }

      setShowDeleteSuccess(true);
      fetchActivities();
    } catch (err) {
      setError("Error deleting activity. Please try again later.");
      console.error("Error deleting activity:", err);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setActivityToDelete(null);
    }
  };

  const fetchActivitiesByPreference = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const role = getUserRole();

      if (role === "tourist") {
        const preferredActivities = await fetch(
          "http://localhost:4000/tourist/activities-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        const otherActivities = await fetch(
          "http://localhost:4000/tourist/activities-not-preference",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json());

        setActivities([...preferredActivities, ...otherActivities]);
        setIsSortedByPreference(true);
      } else {
        const url = new URL(`http://localhost:4000/${role}/activities?myActivities=true`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActivities(data);
      }

      // Calculate max price
      const maxActivityPrice = Math.max(
        ...activities.map((activity) => activity.price)
      );
      const roundedMaxPrice = Math.ceil(maxActivityPrice / 100) * 100;

      if (roundedMaxPrice > -Infinity) {
        setMaxPrice(roundedMaxPrice);
        setInitialPriceRange([0, roundedMaxPrice]);
        setPriceRange([0, roundedMaxPrice]);
      }

      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Error fetching activities");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivitiesByPreference();
  }, [fetchActivitiesByPreference]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1000]);
    setDateRange({ start: "", end: "" });
    setSelectedCategories([]);
    setSortBy("");
    setSortOrder("");
    setMinStars(0);
    setMyActivities(false);
    if (getUserRole() === "tourist") {
      fetchActivitiesByPreference();
    } else {
      fetchActivities();
    }
  };

  const toggleFilters = () => {
    setIsLoading(false);
    setFiltersVisible(!filtersVisible);
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
          </div>
          <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 mb-4">
            <div className="max-w-7xl mx-auto">
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-8 pt-4">
                  My Activities
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
                      placeholder="Search activities..."
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
                    handleSort={handleSort}
                    clearFilters={clearFilters}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    minStars={minStars}
                    exchangeRate={1}
                    setMinStars={setMinStars}
                    categoriesOptions={categoryOptions}
                    searchActivites={searchActivities}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    myActivities={myActivities}
                    symbol={getSymbol()}
                    handlemyActivities={handlemyActivities}
                    maxPrice={maxPrice} // Pass maxPrice as a prop
                    initialPriceRange={initialPriceRange}
                    isSortedByPreference={isSortedByPreference}
                    handleSortByPreference={handleSortByPreference}
                  />

                  {activities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activities
                        .slice(
                          (currentPage - 1) * activitiesPerPage,
                          currentPage * activitiesPerPage
                        )
                        .map((activity) => (
                          <ActivityCard
                            key={activity._id}
                            userInfo={userInfo}
                            activity={activity}
                            onSelect={handleActivitySelect}
                            onDeleteConfirm={handleDeleteConfirm}
                            setShowDeleteConfirm={setShowDeleteConfirm}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      No activities found.
                    </p>
                  )}

                  {/* Pagination Section */}
                  <div className="mt-8 flex justify-center items-center space-x-4">
                    <button
                      onClick={() => {
                        handlePageChange(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-full bg-white shadow ${
                        currentPage === 1 ? "text-gray-300" : "text-blue-600"
                      }`}
                    >
                      <ChevronLeft />
                    </button>

                    {/* Page X of Y */}
                    <span className="text-lg font-medium">
                      {activities.length > 0
                        ? `Page ${currentPage} of ${Math.ceil(
                            activities.length / activitiesPerPage
                          )}`
                        : "No pages available"}
                    </span>

                    <button
                      onClick={() => {
                        handlePageChange(currentPage + 1);
                      }}
                      disabled={
                        currentPage ===
                          Math.ceil(activities.length / activitiesPerPage) ||
                        activities.length === 0
                      }
                      className={`px-4 py-2 rounded-full bg-white shadow ${
                        currentPage ===
                        Math.ceil(activities.length / activitiesPerPage)
                          ? "text-gray-300"
                          : "text-blue-600"
                      }`}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      )}

      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        activityName={activityToDelete?.name}
      />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity?
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
              Activity Deleted
            </DialogTitle>
            <DialogDescription>
              The activity has been successfully deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                setShowDeleteSuccess(false);
                navigate("/my-activities");
              }}
              className = "bg-gray-400 hover:bg-gray-500"
            >
             Close
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
              Failed to Delete activity
            </DialogTitle>
            <DialogDescription>
              {deleteError || "activity is already booked!"}
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

export default MyActivitiesComponent;
