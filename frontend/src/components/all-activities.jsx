import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
  ArrowUpDown,
  Heart,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Range as RangeSlider, getTrackBackground } from "react-range";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import activityImage from "../assets/images/activity.png";

let exchangeRateForFilter = 1;

const DualHandleSliderComponent = ({
  min,
  max,
  symbol,
  step,
  values,
  exchangeRate,
  onChange,
  middleColor = "#f97516",
  colorRing = "orange",
}) => {
  // Ensure values are within bounds and align with step
  const adjustedValues = values.map(value => 
    Math.round(Math.max(min, Math.min(max, value)) / step) * step
  );

  return (
    <div className="w-full px-4 py-8">
      <RangeSlider
        values={adjustedValues}
        step={step}
        min={min}
        max={max}
        onChange={(newValues) => {
          // Ensure new values are within bounds and align with step
          const adjustedNewValues = newValues.map(value => 
            Math.round(Math.max(min, Math.min(max, value)) / step) * step
          );
          onChange(adjustedNewValues);
        }}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
              className="w-full h-3 pr-2 my-4 bg-gray-200 rounded-md"
              style={{
                background: getTrackBackground({
                  values: adjustedValues,
                  colors: ["#ccc", middleColor, "#ccc"],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
              className="w-5 h-5 transform translate-x-10 bg-white rounded-full shadow flex items-center justify-center"
              style={{
                ...props.style,
                height: 20,
                width: 20,
              }}
            >
              <div className={`w-2 h-2 bg-${colorRing}-500 rounded-full`} />
            </div>
          );
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-gray-700">
          Min: {symbol}
          {Math.ceil(adjustedValues[0] * exchangeRate)}
        </span>
        <span className="text-sm font-medium text-gray-700">
          Max: {symbol}
          {Math.ceil(adjustedValues[1] * exchangeRate)}
        </span>
      </div>
    </div>
  );
};

const AllActivities = () => {
  const role = Cookies.get("role") || "guest";

  const [maxPriceOfActivities, setMaxPriceOfActivities] = useState(1000);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [initialPriceRange, setInitialPriceRange] = useState([0, 1000]);
  const [isPriceInitialized, setIsPriceInitialized] = useState(false);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSortedByPreference, setIsSortedByPreference] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const isInitialMount = useRef(true);
  const fetchActivitiesRef = useRef(null);
  const searchActivitiesRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const renderStars = useCallback((rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-[#F88C33] fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const api = `http://localhost:4000/${role}/activities`;

      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActivities(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load activities");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActivitiesByPreference = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");

      if (role === "tourist") {
        const [preferredResponse, otherResponse] = await Promise.all([
          axios.get("http://localhost:4000/tourist/activities-preference", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/tourist/activities-not-preference", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setActivities([...preferredResponse.data, ...otherResponse.data]);
        setIsSortedByPreference(true);
      } else {
        await fetchActivities();
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
  }, [fetchActivities]);

  const handleSortByPreference = useCallback(async () => {
    if (!isSortedByPreference) {
      await fetchActivitiesByPreference();
    } else {
      setIsSortedByPreference(false);
      await fetchActivities();
    }
  }, [isSortedByPreference, fetchActivities, fetchActivitiesByPreference]);

  const handleActivitySelect = useCallback(
    (id) => {
      setIsLoading(true);
      navigate(`/activity/${id}`);
      setIsLoading(false);
    },
    [navigate]
  );

  const ActivityCard = React.memo(
    ({
      activity,
      onSelect,
      userInfo,
      exchangeRates,
      currencies,
      onDeleteConfirm,
      setShowDeleteConfirm,
    }) => {
      const role = Cookies.get("role") || "guest";

      return (
        <Card
          className="overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
          onClick={() => onSelect(activity._id)}
        >
          <CardHeader className="p-0">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={
                  activity.pictures && activity.pictures.length > 0
                    ? activity.pictures[0]?.url
                    : "/placeholder.svg"
                }
                alt={activity.name}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg text-[#1A3B47]">
              {activity.name}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {activity.location.address}
            </p>
            <div className="mt-2 flex items-center">
              {renderStars(activity.rating)}
              <span className="ml-2 text-sm text-gray-600">
                {activity.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {activity.description}
            </p>
            
            {/* Add price and duration */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-lg font-bold text-primary">
                {formatPrice(activity.price)}
              </span>
              <span className="text-sm text-muted-foreground">
                {activity.duration} hours
              </span>
            </div>

            {/* Add date display */}
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(activity.timing).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '/')}
            </p>
          </CardContent>
          <CardFooter className="p-4 flex justify-between items-center border-t">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#388A94]">
                {formatPrice(activity.price, activity)}
              </span>
              <span className="text-sm text-gray-500">
                {activity.duration} hours
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.tags?.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag.type}
                </Badge>
              ))}
              {activity.category?.map((cat, index) => (
                <Badge key={index} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardFooter>
          {role === "advertiser" &&
            userInfo?.userId === activity.advertiser && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/update-activity/${activity._id}`;
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConfirm(activity);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
        </Card>
      );
    }
  );

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const formatPrice = useCallback(
    (price, activity) => {
      // Add safety checks
      if (!userInfo || !price || !activity) return "";

      if (userInfo.role === "tourist" && userInfo.preferredCurrency) {
        const baseRate = exchangeRates[activity?.currency] || 1;
        const targetRate = exchangeRates[userInfo.preferredCurrency.code] || 1;
        const exchangedPrice = (price / baseRate) * targetRate;
        exchangeRateForFilter = targetRate / baseRate;
        return `${userInfo.preferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
      } else {
        const currency = currencies.find((c) => c._id === activity?.currency);
        return `${currency ? currency.symbol : "$"}${price}`;
      }
    },
    [userInfo, exchangeRates, currencies]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = activity.price >= priceRange[0] && activity.price <= priceRange[1];
      const matchesRating = selectedRating ? activity.rating >= selectedRating : true;
      const matchesCategories = selectedCategories.length === 0 || 
        activity.category?.some(cat => selectedCategories.includes(cat.name));

      // Add date filtering
      const activityDate = new Date(activity.timing);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      startDate?.setHours(0, 0, 0, 0);
      endDate?.setHours(23, 59, 59, 999);
      activityDate.setHours(0, 0, 0, 0);

      const matchesDate = (!startDate || activityDate >= startDate) && 
                         (!endDate || activityDate <= endDate);

      return matchesSearch && matchesPrice && matchesRating && matchesCategories && matchesDate;
    });
  }, [activities, searchTerm, priceRange, selectedRating, selectedCategories, dateRange]);

  const sortedActivities = useMemo(() => {
    const sorted = [...filteredActivities];
    if (sortBy === "price") {
      sorted.sort((a, b) => sortOrder * (a.price - b.price));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => sortOrder * (b.rating - a.rating));
    }
    return sorted;
  }, [filteredActivities, sortBy, sortOrder]);

  const memoizedActivityCards = useMemo(() => {
    return sortedActivities
      .slice((currentPage - 1) * 6, currentPage * 6)
      .map((activity) => (
        <ActivityCard
          key={activity._id}
          activity={activity}
          onSelect={handleActivitySelect}
          userInfo={userInfo}
          exchangeRates={exchangeRates}
          currencies={currencies}
          onDeleteConfirm={setActivityToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      ));
  }, [
    sortedActivities,
    currentPage,
    userInfo,
    exchangeRates,
    handleActivitySelect,
    renderStars,
    formatPrice,
  ]);

  const fetchMaxPrice = async () => {
    try {
      const role = getUserRole();
      const token = Cookies.get("jwt");
      const url = new URL(`http://localhost:4000/${role}/maxPriceActivities`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const roundedMaxPrice = Math.ceil(data / 100) * 100; // Round up to nearest 100
      
      setMaxPriceOfActivities(roundedMaxPrice);
      setMaxPrice(roundedMaxPrice);
      setInitialPriceRange([0, roundedMaxPrice]);
      setPriceRange([0, roundedMaxPrice]);
      setIsPriceInitialized(true);
    } catch (error) {
      console.error("Error fetching max price:", error);
      // Set fallback values
      setMaxPriceOfActivities(1000);
      setMaxPrice(1000);
      setInitialPriceRange([0, 1000]);
      setPriceRange([0, 1000]);
      setIsPriceInitialized(true);
    }
  };

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates");
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    const role = Cookies.get("role");
    if (role !== "tourist") return;
    try {
      const response = await axios.get(
        "http://localhost:4000/tourist/currencies",
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
      setCurrencies(response.data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  }, []);

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
    } else {
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserInfo({
          role,
          userId: decodedToken.id,
        });
      } else {
        setUserInfo({ role });
      }
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchUserInfo(),
        fetchExchangeRates(),
        fetchCurrencies(),
        fetchMaxPrice(),
      ]);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (sortBy || searchTerm || filtersVisible) {
      setIsSortedByPreference(false);
    }
  }, [sortBy, searchTerm, filtersVisible]);

  useEffect(() => {
    const role = Cookies.get("role") || "guest";
    if (role === "tourist") {
      fetchActivitiesByPreference();
    } else {
      fetchActivities();
    }
  }, [fetchActivitiesByPreference, fetchActivities]);

  useEffect(() => {
    if (userInfo) {
      fetchActivities();
    }
  }, [userInfo]);

  useEffect(() => {
    if (dateRange.start || dateRange.end) {
      searchActivities();
    }
  }, [dateRange]);

  const PriceRangeSlider = () => (
    <div>
      <h3 className="font-medium text-[#1A3B47] mb-2">Price Range</h3>
      {isPriceInitialized && (
        <DualHandleSliderComponent
          min={0}
          max={maxPriceOfActivities}
          symbol={userInfo?.preferredCurrency?.symbol || "$"}
          step={10}
          values={priceRange}
          exchangeRate={exchangeRateForFilter}
          onChange={(values) => setPriceRange(values)}
          middleColor="#5D9297"
          colorRing="blue"
        />
      )}
    </div>
  );

  const getUserRole = () => {
    return Cookies.get("role") || "guest";
  };

  const searchActivities = async () => {
    setIsSortedByPreference(false);
    if (searchActivitiesRef.current) return;
    searchActivitiesRef.current = true;

    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/activities`);
      
      if (searchTerm) {
        url.searchParams.append("searchBy", searchTerm);
      }

      if (priceRange[0] !== 0 || priceRange[1] !== maxPriceOfActivities) {
        url.searchParams.append("minPrice", priceRange[0]);
        url.searchParams.append("price", priceRange[1]);
      }

      if (dateRange.start) {
        url.searchParams.append("startDate", dateRange.start);
      }
      if (dateRange.end) {
        url.searchParams.append("endDate", dateRange.end);
      }

      if (selectedCategories.length > 0) {
        url.searchParams.append(
          "category",
          selectedCategories.map((c) => c.name).join(",")
        );
      }

      if (selectedRating) {
        url.searchParams.append("minRating", selectedRating);
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
    } finally {
      setIsLoading(false);
      searchActivitiesRef.current = false;
    }
  };

  const clearFilters = () => {
    setPriceRange([0, maxPriceOfActivities]);
    setSelectedCategories([]);
    setSelectedRating(null);
    setSortBy("");
    setSortOrder(1);
    setIsSortedByPreference(false);
    setDateRange({ start: "", end: "" });
    
    const searchWithClearedFilters = async () => {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/activities`);
      const token = Cookies.get("jwt");
      
      try {
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
        console.error("Error fetching activities:", error);
        setError("Error fetching activities");
        setActivities([]);
      }
    };

    searchWithClearedFilters();
  };

  return (
    <div className="bg-gray-100">
      <div className="relative h-[250px] bg-[#5D9297] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 mt-8 h-full flex items-center">
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-white mb-4">
              All Activities
            </h1>
            <p className="text-gray-200">
              <a
                href="/"
                className="font-bold text-gray-200 hover:text-gray-300 hover:underline"
              >
                Home
              </a>{" "}
              / Activities
            </p>
          </div>
          <div className="hidden lg:block w-1/3">
            <img
              src={activityImage}
              alt="Decorative"
              height="300"
              width="300"
              className="ml-auto"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 lg:px-24">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden md:block w-80 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1A3B47]">Filters</h2>
              <Button
                onClick={() => {
                  setPriceRange([0, 1000]);
                  setDateRange({ start: "", end: "" });
                  setSelectedCategories([]);
                  setSelectedRating(null);
                }}
                size="sm"
                className="text-gray-400 hover:text-gray-200 bg-transparent border-none"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h3 className="font-medium text-[#1A3B47] mb-2">Price Range</h3>
                {isPriceInitialized && (
                  <DualHandleSliderComponent
                    min={0}
                    max={maxPriceOfActivities}
                    symbol={userInfo?.preferredCurrency?.symbol || "$"}
                    step={10}
                    values={priceRange}
                    exchangeRate={exchangeRateForFilter}
                    onChange={(values) => setPriceRange(values)}
                    middleColor="#5D9297"
                    colorRing="blue"
                  />
                )}
              </div>

              {/* Date Range Filter */}
              <div>
                <h3 className="font-medium text-[#1A3B47] mb-2">Date Range</h3>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      const newDateRange = { ...dateRange, start: e.target.value };
                      setDateRange(newDateRange);
                      searchActivities(); // Trigger search immediately
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      const newDateRange = { ...dateRange, end: e.target.value };
                      setDateRange(newDateRange);
                      searchActivities(); // Trigger search immediately
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Star Rating Filter */}
              <div>
                <h3 className="font-medium text-[#1A3B47] mb-2">Star Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setSelectedRating(
                          rating === selectedRating ? null : rating
                        )
                      }
                      className={`flex items-center w-full p-2 rounded hover:bg-gray-100 ${
                        selectedRating === rating ? "bg-[#B5D3D1]" : ""
                      }`}
                    >
                      {renderStars(rating)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-[#1A3B47] mb-2">Category</h3>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {categoryOptions.map((category) => (
                      <div key={category._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={category._id}
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(category.name)
                                ? prev.filter((cat) => cat !== category.name)
                                : [...prev, category.name]
                            );
                          }}
                          className="mr-2"
                        />
                        <label
                          htmlFor={category._id}
                          className="text-sm text-gray-600"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="relative flex-grow mb-4">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D9297]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap rounded-full"
                    onClick={() => {
                      setSortBy("rating");
                      setSortOrder((prev) => (prev === 1 ? -1 : 1));
                    }}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort by Rating
                    {sortBy === "rating" && (
                      <span className="ml-2">
                        {sortOrder === 1 ? "↓" : "↑"}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap rounded-full"
                    onClick={() => {
                      setSortBy("price");
                      setSortOrder((prev) => (prev === 1 ? -1 : 1));
                    }}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort by Price
                    {sortBy === "price" && (
                      <span className="ml-2">
                        {sortOrder === 1 ? "↓" : "↑"}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`whitespace-nowrap rounded-full ${
                      isSortedByPreference ? "bg-red-100" : ""
                    }`}
                    onClick={handleSortByPreference}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isSortedByPreference ? "fill-current text-red-500" : ""
                      }`}
                    />
                    Sort by Preference
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 text-sm">
                    ({sortedActivities.length} items)
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setFiltersVisible(!filtersVisible)}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : sortedActivities.length === 0 ? (
              <div className="text-center py-8">No activities found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedActivityCards}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {Math.ceil(sortedActivities.length / 6)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(sortedActivities.length / 6))
                  )
                }
                disabled={
                  currentPage === Math.ceil(sortedActivities.length / 6)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {alertMessage && (
        <Alert
          className={`fixed bottom-4 right-4 w-96 ${
            alertMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <AlertTitle>
            {alertMessage.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>{alertMessage.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export const AllActivitiesComponent = AllActivities
export default AllActivities