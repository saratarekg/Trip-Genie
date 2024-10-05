import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import FilterComponent from "../components/FilterActivities.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import ActivityDetail from "./SingleActivity.jsx";
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const ActivityCard = ({ activity, onSelect }) => (
    <Card
    className="overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
    onClick={() => onSelect(activity._id)}
  >
    <div className="relative aspect-video overflow-hidden">
      <img
        src={activity.pictures && activity.pictures.length > 0 ? activity.pictures[0] : defaultImage}
        alt={activity.name}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      />
    </div>
    <CardHeader className="p-4">
      <CardTitle className="text-xl font-semibold">{activity.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{activity.location}</p>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-2">
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < activity.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{activity.rating.toFixed(1)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-primary">€{activity.price}/Night</span>
        <span className="text-sm text-muted-foreground">{activity.duration} nights</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {new Date(activity.timing).toLocaleDateString()}
      </p>
    </CardContent>
    <CardFooter className="p-4 pt-0">
      <div className="flex flex-wrap gap-2">
        {activity.tags.map((tag, index) => (
          <Badge key={index} variant="secondary">
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

export function AllActivitiesComponent() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [dateRange, setDateRange] = useState({ lower: "", upper: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const activitiesPerPage = 6;
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minStars, setMinStars] = useState(0);


  const navigate = useNavigate();

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    fetchActivities();
    setIsLoading(false);
  }, []);

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

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/activities`);

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
      setError(null);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Error fetching activities");
      setActivities([]);
      setIsLoading(false);
    }
  };

  const searchActivities = async () => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/activities`);

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
      if (selectedCategories.length > 0) {
        url.searchParams.append("categories", selectedCategories.join(","));
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

  const clearFilters = () => {
    setSearchTerm("");
    setPrice("");
    setDateRange({ lower: "", upper: "" });
    setSelectedCategories([]);
    setSortBy("");
    setSortOrder("");
    fetchActivities();
  };

  const toggleFilters = () => {
    setIsLoading(false);
    setFiltersVisible(!filtersVisible);
    setIsLoading(false);
  };

  const handleCategorySelection = (option) => {
    setSelectedCategories((prev) =>
      prev.includes(option)
        ? prev.filter((cat) => cat !== option)
        : [...prev, option]
    );
  };


  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                All Activities
              </h1>

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
                  price={price}
                  setPrice={setPrice}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  handleCategorySelection={handleCategorySelection}
                  categoryOptions={categoryOptions}
                  minStars={minStars} // Pass the minStars state
                  setMinStars={setMinStars} // Pass the setMinStars handler
                />
              </div>

              {activities.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                  {activities
                    .slice(
                      (currentPage - 1) * activitiesPerPage,
                      currentPage * activitiesPerPage
                    )
                    .map((activity) => (
                      <ActivityCard
                        key={activity._id}
                        activity={activity}
                        onSelect={handleActivitySelect}
                      />
                    ))}
                </div>
              ) : (
                <p>No activities found.</p>
              )}

              {activities.length > activitiesPerPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mr-4 p-2"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(activities.length / activitiesPerPage)
                    }
                    className="ml-4 p-2"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllActivitiesComponent;
