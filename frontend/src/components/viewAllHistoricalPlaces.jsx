import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import FilterComponent from "./filterHistoricalPlaces.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader.jsx";

const HistoricalPlaceCard = ({ historicalPlace, onSelect }) => (
    <div
        className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
        onClick={() => onSelect(historicalPlace._id)}
    >
        <div className="overflow-hidden">
            <img
                src={
                    historicalPlace.pictures &&
                        historicalPlace.pictures.length > 0
                        ? historicalPlace.pictures[0]
                        : defaultImage
                }
                alt={historicalPlace.title}
                className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
        </div>
        <div className="p-4 ">
            <h3 className="text-xl font-semibold mt-2">{historicalPlace.title}</h3>
            <h3 className="text-sm mt-2 text-gray-700">{historicalPlace.description}</h3>
            <div className="flex justify-between items-center mt-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-blue-600">
                        {historicalPlace.ticketPrices && historicalPlace.ticketPrices.adult
                            ? `Adult: €${historicalPlace.ticketPrices.adult}/Day`
                            : ''}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                        {historicalPlace.ticketPrices && historicalPlace.ticketPrices.child
                            ? `Child: €${historicalPlace.ticketPrices.child}/Day`
                            : ''}
                    </span>
                </div>
                <span className="text-sm text-gray-500">
                    {historicalPlace.location.city}, {historicalPlace.location.country}
                </span>
            </div>
        </div>
    </div>
);

export function AllHistoricalPlacesComponent() {
    const [historicalPlaces, setHistoricalPlaces] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    //   const [sortOrder, setSortOrder] = useState("");
    //   const [sortBy, setSortBy] = useState("");
    const [filtersVisible, setFiltersVisible] = useState(false);
    //   const [price, setPrice] = useState("");
    //   const [dateRange, setDateRange] = useState({ lower: "", upper: "" });
       const [selectedTypes, setSelectedTypes] = useState([]); // Changed to selectedTypes array
       const [selectedPeriods, setSelectedPeriods] = useState([]); // Changed to selectedTypes array

    //   const [selectedLanguages, setSelectedLanguages] = useState([]); // Changed to selectedLanguages array
    const tripsPerPage = 3;
    const [selectedItinerary, setSelectedItinerary] = useState(null);
       const [typesOptions, setTypesOptions] = useState([]);
       const [periodOptions, setPeriodOptions] = useState([]);

    //   const [languagesOptions, setLanguagesOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const getUserRole = () => {
        let role = Cookies.get("role");
        if (!role) role = "guest";
        return role;
    };

    useEffect(() => {
        fetchHistoricalPlace();
        setIsLoading(false);
    }, []);

    //   const handleItinerarySelect = (id) => {
    //     setIsLoading(true);
    //     navigate(`/itinerary/${id}`); // Navigate to the itinerary details page
    //     setIsLoading(false);
    //   };

    //   useEffect(() => {
    //     const fetchLanguages = async () => {
    //       setIsLoading(true);
    //       console.log("Fetching Languages");
    //       try {
    //         const response = await axios.get(
    //           "http://localhost:4000/api/getAllLanguages"
    //         );
    //         console.log("Languages:", response.data);
    //         setLanguagesOptions(response.data);
    //       } catch (error) {
    //         console.error("Error fetching Languages:", error);
    //       }
    //     };
    //     setIsLoading(false);
    //     fetchLanguages();
    //   }, []);

      useEffect(() => {
        // Fetch types from the backend
        const fetchType = async () => {
          try {
            setIsLoading(false);
            const response = await axios.get('http://localhost:4000/api/getAllHistoricalTypes');
            console.log('Type:', response.data);
            setTypesOptions(response.data);
          } catch (error) {
            console.error("Error fetching Type:", error);
          }
        };
        fetchType();
        setIsLoading(false);
      }, []);

      useEffect(() => {
        // Fetch types from the backend
        const fetchType = async () => {
          try {
            setIsLoading(false);
            const response = await axios.get('http://localhost:4000/api/getAllHistoricalPeriods');
            console.log('Period:', response.data);
            setPeriodOptions(response.data);
          } catch (error) {
            console.error("Error fetching Period:", error);
          }
        };
        fetchType();
        setIsLoading(false);
      }, []);


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchHistoricalPlace();
            } else {
                fetchHistoricalPlace();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    //   useEffect(() => {
    //     if (sortBy) {
    //       searchItineraries();
    //     }
    //   }, [sortBy, sortOrder]);

    //   const handleSort = (attribute) => {
    //     setIsLoading(true);
    //     const newSortOrder = sortOrder === 1 ? -1 : 1;
    //     setSortOrder(newSortOrder);
    //     setSortBy(attribute); 
    //     setIsLoading(false);
    //   };
    const fetchHistoricalPlace = async () => {
        try {
            setIsLoading(false);
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


        // Fetch itineraries without any filters
        fetchHistoricalPlace();
    };

    const searchHistoricalPlace = async () => {
        try {
            const role = getUserRole();
            const url = new URL(`http://localhost:4000/${role}/historical-places`);

            // Add the search term and filter parameters
            if (searchTerm) {
                url.searchParams.append("searchBy", searchTerm);
            }
            //   if (price && price !== "") {
            //     url.searchParams.append("budget", price);
            //   }

            //   if (dateRange.upper) {
            //     url.searchParams.append("upperDate", dateRange.upper);
            //   }
            //   if (dateRange.lower) {
            //     url.searchParams.append("lowerDate", dateRange.lower);
            //   }
              if (selectedTypes.length > 0) {
                url.searchParams.append("types", selectedTypes.join(",")); // Send selected types as comma-separated
              }
              if (selectedPeriods.length > 0) {
                url.searchParams.append("periods", selectedPeriods.join(",")); // Send selected types as comma-separated
              }
            //   if (selectedLanguages.length > 0) {
            //     url.searchParams.append("languages", selectedLanguages.join(",")); // Send selected languages as comma-separated
            //   }

            // Add sorting parameters
            //   if (sortBy) {
            //     url.searchParams.append("sort", sortBy);
            //   }
            //   if (sortOrder) {
            //     url.searchParams.append("asc", sortOrder);
            //   }
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

    const toggleFilters = () => {
        setIsLoading(false);
        setFiltersVisible(!filtersVisible);
        setIsLoading(false);
    };

    // Handle type and language selections
      const handleTypeSelection = (option) => {
        setSelectedTypes((prev) =>
          prev.includes(option)
            ? prev.filter((type) => type !== option)
            : [...prev, option]
        );
      };

    //   const handleLanguageSelection = (option) => {
    //     setSelectedLanguages((prev) =>
    //       prev.includes(option)
    //         ? prev.filter((lang) => lang !== option)
    //         : [...prev, option]
    //     );
    //   };

    return (
        <div>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <>
                            <h1 className="text-4xl font-bold text-gray-900 mb-8">
                                All Historical Places
                            </h1>

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
                //   sortOrder={sortOrder}
                //   sortBy={sortBy}
                //   handleSort={handleSort}
                  clearFilters={clearFilters}
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
                  searchHistoricalPlaces={searchHistoricalPlace}
                  typesOptions={typesOptions}
                  periodsOptions={periodOptions}
                //   languagesOptions={languagesOptions}
                  role={getUserRole()}
                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-center mb-4">{error}</div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {historicalPlaces
                                    .slice(
                                        (currentPage - 1) * tripsPerPage,
                                        currentPage * tripsPerPage
                                    )
                                    .map((historicalPlace) => (
                                        <HistoricalPlaceCard
                                            key={historicalPlace._id} // Use the unique _id as the key
                                            historicalPlace={historicalPlace}
                                        //   onSelect={handleHistoricalPlaceSelect}
                                        />
                                    ))}
                            </div>

                            <div className="mt-8 flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === 1 ? "text-gray-300" : "text-blue-600"
                                        }`}
                                >
                                    <ChevronLeft />
                                </button>



                                {/* Page X of Y */}
                                <span className="text-lg font-medium">
                                    Page {currentPage} of {Math.ceil(historicalPlaces.length / tripsPerPage)}
                                </span>

                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, Math.ceil(historicalPlaces.length / tripsPerPage))
                                        )
                                    }
                                    disabled={
                                        currentPage === Math.ceil(historicalPlaces.length / tripsPerPage)
                                    }
                                    className={`px-4 py-2 rounded-full bg-white shadow ${currentPage === Math.ceil(historicalPlaces.length / tripsPerPage)
                                        ? "text-gray-300"
                                        : "text-blue-600"
                                        }`}
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


