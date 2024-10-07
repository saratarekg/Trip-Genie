import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { Search } from "lucide-react";
import FilterComponent from "./filterHistoricalPlaces.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.jsx";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons

// HistoricalPlaceCard Component
const HistoricalPlaceCard = ({ historicalPlace, onSelect }) => (
    <Card
        className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
        onClick={() => onSelect(historicalPlace._id)}
    >
        <div className="overflow-hidden">
            <img
                src={
                    historicalPlace.pictures && historicalPlace.pictures.length > 0
                        ? historicalPlace.pictures[0]
                        : defaultImage
                }
                alt={historicalPlace.title}
                className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
        </div>
        <CardHeader>
            <h3 className="text-xl font-semibold mt-2">{historicalPlace.title}</h3>
            <h3 className="text-sm mt-2 text-gray-700">{historicalPlace.description}</h3>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center mt-4">
                <div className="flex flex-col">
                    <span className="text-md font-bold text-gray-900">
                        {historicalPlace.ticketPrices && historicalPlace.ticketPrices.native
                            ? `native: $${historicalPlace.ticketPrices.native}/Day`
                            : ''}
                    </span>
                    <span className="text-md font-bold text-gray-900">
                        {historicalPlace.ticketPrices && historicalPlace.ticketPrices.student
                            ? `student: $${historicalPlace.ticketPrices.student}/Day`
                            : ''}
                    </span>
                    <span className="text-md font-bold text-gray-900">
                        {historicalPlace.ticketPrices && historicalPlace.ticketPrices.foreigner
                            ? `foreigner: $${historicalPlace.ticketPrices.foreigner}/Day`
                            : ''}
                    </span>
                </div>
                <span className="text-sm text-gray-500">
                    {historicalPlace.location.city}, {historicalPlace.location.country}
                </span>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
                {historicalPlace.historicalTag.map((historicalTag, index) => (
                    <Badge key={index} variant="secondary">
                        {historicalTag.type}
                    </Badge>
                ))}
                {historicalPlace.historicalTag.map((historicalTag, index) => (
                    <Badge key={index} variant="secondary">
                        {historicalTag.period}
                    </Badge>
                ))}
            </div>
        </CardFooter>
    </Card>
);

// Main Component
export function AllHistoricalPlacesComponent() {
    const [historicalPlaces, setHistoricalPlaces] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedPeriods, setSelectedPeriods] = useState([]);
    const [myHistoricalPlaces,setmyHistoricalPlaces ] = useState(false);
    const tripsPerPage = 6;
    const navigate = useNavigate();
    const historicalPlacesContainerRef = useRef(null);
    const [typesOptions, setTypesOptions] = useState([]);
    const [periodOptions, setPeriodOptions] = useState([]);
    // const [pageNumber, setPageNumber] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to get user role
    const getUserRole = () => {
        let role = Cookies.get("role");
        if (!role) role = "guest";
        return role;
    };

    // Effect to fetch historical places
    useEffect(() => {
        fetchHistoricalPlace();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        scrollToTop();
    }, [currentPage]);

    useEffect(() => {

        searchHistoricalPlaces();
      
    }, [myHistoricalPlaces]);
  

    // Function to handle selection of a historical place
    const handleHistoricalPlaceSelect = (id) => {
        setIsLoading(true);
        navigate(`/historical-place/${id}`);
        setIsLoading(false);
    };

    const toggleFilters = () => {
        setIsLoading(false);
        setFiltersVisible(!filtersVisible);
        setIsLoading(false);
      };

    const handlemyHistoricalPlaces = (attribute) => {
        setIsLoading(true);
        setmyHistoricalPlaces(attribute); 
        setIsLoading(false);
      };

    // Function to scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Function for handling page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        //scrollToTop(); // Scroll to top when changing pages
    };

    // Fetching types
    useEffect(() => {
        const fetchType = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/getAllHistoricalTypes');
                setTypesOptions(response.data);
            } catch (error) {
                console.error("Error fetching Type:", error);
            }
        };
        fetchType();
        setIsLoading(false);
    }, []);

    // Fetching periods
    useEffect(() => {
        const fetchPeriod = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/getAllHistoricalPeriods');
                setPeriodOptions(response.data);
            } catch (error) {
                console.error("Error fetching Period:", error);
            }
        };
        fetchPeriod();
        setIsLoading(false);
    }, []);

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchHistoricalPlaces();
            } else {
                fetchHistoricalPlace();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Function to fetch historical places
    const fetchHistoricalPlace = async () => {
        try {
            const token = Cookies.get('jwt');
            const role = getUserRole();
            const response = await fetch(
                `http://localhost:4000/${role}/historical-places`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHistoricalPlaces(data);
            setError(null);
            setCurrentPage(1);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching historical places:", error);
            setError("Error fetching historical places");
            setHistoricalPlaces([]);
        }
    };

    const clearFilters = () => {
        // Reset all filter states to initial values
        setSearchTerm("");
        setSelectedTypes([]); // Reset selected types
        setSelectedPeriods([]); // Reset selected periods
        setmyHistoricalPlaces(false);

        // Fetch itineraries without any filters
        fetchHistoricalPlace();
    };

    // Function for searching historical places
    const searchHistoricalPlaces = async () => {
        try {
          const role = getUserRole();
          const url = new URL(`http://localhost:4000/${role}/historical-places`);
       
          // Add the search term and filter parameters
          if(myHistoricalPlaces) {
            url.searchParams.append("myPlaces", myHistoricalPlaces);
          }
          if (searchTerm) {
            url.searchParams.append("searchBy", searchTerm);
          }
            if (selectedTypes.length > 0) {
                url.searchParams.append("types", selectedTypes.join(","));
            }
            if (selectedPeriods.length > 0) {
                url.searchParams.append("periods", selectedPeriods.join(","));
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
    
          setHistoricalPlaces(data);
          setError(null);
          setCurrentPage(1);
        } catch (error) {
          console.error("Error fetching filtered results:", error);
          setError("Error fetching filtered results");
          setHistoricalPlaces([]);
        }
      };

    return (
        <div>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="min-h-screen bg-gray-100 py-12 px-4 pt-20 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <>
                    <h1 className="text-2xl font-bold mb-4">All Historical Places</h1>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 mb-4"
                        />
                        <FilterComponent
                            filtersVisible={filtersVisible}
                            toggleFilters={toggleFilters}
                            //   sortOrder={sortOrder}
                            //   sortBy={sortBy}
                            //   handleSort={handleSort}
                            clearFilters={clearFilters}
                            myHistoricalPlaces={myHistoricalPlaces}
                            handlemyHistoricalPlaces={handlemyHistoricalPlaces}
                            // sortItineraries={sortItineraries}
                            //   price={price}
                            //   setPrice={setPrice}
                            //   dateRange={dateRange}
                            //   setDateRange={setDateRange}
                            selectedTypes={selectedTypes} // Pass selectedTypes array
                            setSelectedTypes={setSelectedTypes} // Pass setSelectedTypes function
                            selectedPeriods={selectedPeriods} // Pass periods array
                            setSelectedPeriods={setSelectedPeriods} // Pass periods function
                            //   selectedLanguages={selectedLanguages} // Pass selectedLanguages array
                            //   setSelectedLanguages={setSelectedLanguages} // Pass setSelectedLanguages function
                            searchHistoricalPlaces={searchHistoricalPlaces}
                            typesOptions={typesOptions}
                            periodsOptions={periodOptions}
                            //   languagesOptions={languagesOptions}
                            role={getUserRole()}
                        />
                    </div>
                    {error && <div className="text-red-500">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historicalPlaces.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage).map((historicalPlace) => (
                            <HistoricalPlaceCard
                                key={historicalPlace._id}
                                historicalPlace={historicalPlace}
                                onSelect={handleHistoricalPlaceSelect}
                            />
                        ))}
                    </div>
                    {/* Pagination Component here */}
                    <div className="mt-8 flex justify-center items-center space-x-4">
                        <button
                            onClick={() => {
                                handlePageChange(currentPage - 1);
                            }}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === 1 ? "text-gray-300" : "text-blue-600"}`}
                        >
                            <ChevronLeft />
                        </button>

                        {/* Page X of Y */}
                        <span className="text-lg font-medium">
                            {historicalPlaces.length > 0
                                ? `Page ${currentPage} of ${Math.ceil(historicalPlaces.length / tripsPerPage)}`
                                : "No pages available"}
                        </span>

                        <button
                            onClick={() => {
                                handlePageChange(currentPage + 1);
                            }}
                            disabled={currentPage === Math.ceil(historicalPlaces.length / tripsPerPage) || historicalPlaces.length === 0}
                            className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === Math.ceil(historicalPlaces.length / tripsPerPage) ? "text-gray-300" : "text-blue-600"}`}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                    </>
                </div>
                </div>
            )}
        </div>
    );
}

export default AllHistoricalPlacesComponent;
