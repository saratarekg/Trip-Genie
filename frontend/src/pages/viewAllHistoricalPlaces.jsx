import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import * as jwtDecode from "jwt-decode";
import FilterComponent from "../components/filterHistoricalPlaces.jsx";
import defaultImage from "../assets/images/default-image.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search } from "lucide-react"; // Import icons

// HistoricalPlaceCard Component
const HistoricalPlaceCard = ({
  historicalPlace,
  onSelect,
  userRole,
  userPreferredCurrency,
}) => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState({});
  // console.log(historicalPlace);
  // console.log(userPreferredCurrency);

  useEffect(() => {
    if (
      userRole === "tourist" &&
      userPreferredCurrency !== historicalPlace.currency
    ) {
      fetchExchangeRate();
    } else {
      getCurrencySymbol();
    }
  }, [userRole, userPreferredCurrency, historicalPlace.currency]);

  const fetchExchangeRate = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        `http://localhost:4000/${userRole}/populate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure content type is set to JSON
          },
          body: JSON.stringify({
            base: historicalPlace.currency, // Sending base currency ID
            target: userPreferredCurrency, // Sending target currency ID
          }),
        }
      );
      // Parse the response JSON
      const data = await response.json();

      if (response.ok) {
        setExchangeRates(data.conversion_rate);
      } else {
        // Handle possible errors
        console.error("Error in fetching exchange rate:", data.message);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const getCurrencySymbol = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/${userRole}/getCurrency/${historicalPlace.currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrencySymbol(response.data);
    } catch (error) {
      console.error("Error fetching currency symbol:", error);
    }
  };

  const formatPrice = (price, type) => {
    console.log(price);
    console.log(userPreferredCurrency); 
    console.log(historicalPlace.currency);  

    if (userRole === "tourist") {
      if (userPreferredCurrency._id === historicalPlace.currency._id) {
        return `${userPreferredCurrency.symbol}${price}/Day`;
      } else {
        const exchangedPrice = price * exchangeRates;
        return `${userPreferredCurrency.symbol}${exchangedPrice.toFixed(
          2
        )}/Day`;
      }
    } else {
      return `${currencySymbol.symbol}${price}/Day`;
    }
  };

  return (
    <Card
      className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
      onClick={() => onSelect(historicalPlace._id)}
    >
      <div className="overflow-hidden">
        <img
          src={historicalPlace.pictures?.[0] || defaultImage}
          alt={historicalPlace.title}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
      </div>
      <CardHeader>
        <h3 className="text-xl font-semibold mt-2">{historicalPlace.title}</h3>
        <h3 className="text-sm mt-2 text-gray-700">
          {historicalPlace.description}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            {historicalPlace.ticketPrices?.native && (
              <span className="text-md font-bold text-gray-900">
                native:{" "}
                {formatPrice(historicalPlace.ticketPrices.native, "native")}
              </span>
            )}
            {historicalPlace.ticketPrices?.student && (
              <span className="text-md font-bold text-gray-900">
                student:{" "}
                {formatPrice(historicalPlace.ticketPrices.student, "student")}
              </span>
            )}
            {historicalPlace.ticketPrices?.foreigner && (
              <span className="text-md font-bold text-gray-900">
                foreigner:{" "}
                {formatPrice(
                  historicalPlace.ticketPrices.foreigner,
                  "foreigner"
                )}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {historicalPlace.location.city}, {historicalPlace.location.country}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {historicalPlace.historicalTag.map((historicalTag, index) => (
            <Badge key={`type-${index}`} variant="secondary">
              {historicalTag.type}
            </Badge>
          ))}
          {historicalPlace.historicalTag.map((historicalTag, index) => (
            <Badge key={`period-${index}`} variant="secondary">
              {historicalTag.period}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

// Main Component
export function AllHistoricalPlacesComponent() {
  const [historicalPlaces, setHistoricalPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [myHistoricalPlaces, setmyHistoricalPlaces] = useState(false);
  const tripsPerPage = 6;
  const [userRole, setUserRole] = useState("guest");
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const navigate = useNavigate();
  const historicalPlacesContainerRef = useRef(null);
  const [typesOptions, setTypesOptions] = useState([]);
  const [periodOptions, setPeriodOptions] = useState([]);
  // const [pageNumber, setPageNumber] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchHistoricalPlace(),
          fetchTypesAndPeriods(),
          fetchUserInfo(),
        ]);
        setIsLoading(false); // Set loading to false after both requests
      } catch (error) {
        console.error("Error in fetching data:", error);
        setIsLoading(false); // Ensure loading state is also turned off on error
      } finally {
        setIsLoading(false); // Ensure loading state is turned off
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  useEffect(() => {
    searchHistoricalPlaces();
  }, [myHistoricalPlaces]);

  const fetchUserInfo = async () => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    if (role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currencyId = response.data.preferredCurrency;

        

        const response2 = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${currencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserPreferredCurrency(response2.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  const handleHistoricalPlaceSelect = (id) => {
    setIsLoading(true);
    navigate(`/historical-place/${id}`);
    setIsLoading(false);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handlemyHistoricalPlaces = (attribute) => {
    setmyHistoricalPlaces(attribute);
    setIsLoading(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch historical places
  const fetchHistoricalPlace = async () => {
    try {
      const token = Cookies.get("jwt");
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
    } catch (error) {
      console.error("Error fetching historical places:", error);
      setError("Error fetching historical places");
      setHistoricalPlaces([]);
    }
  };

  // Fetch types and periods
  const fetchTypesAndPeriods = async () => {
    const typePromise = axios
      .get("http://localhost:4000/api/getAllHistoricalTypes")
      .then((response) => {
        setTypesOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Types:", error);
      });

    const periodPromise = axios
      .get("http://localhost:4000/api/getAllHistoricalPeriods")
      .then((response) => {
        setPeriodOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Periods:", error);
      });

    await Promise.all([typePromise, periodPromise]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedPeriods([]);
    setmyHistoricalPlaces(false);
    fetchHistoricalPlace();
  };

  const searchHistoricalPlaces = async () => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/historical-places`);

      if (myHistoricalPlaces) {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
           <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <>
              <h1 className="text-2xl font-bold mb-4 mt-4">All Historical Places</h1>
              <div className="flex flex-col">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 pl-10 mb-4 w-full"
                  />
                  <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2" />
                </div>
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
                {historicalPlaces
                  .slice(
                    (currentPage - 1) * tripsPerPage,
                    currentPage * tripsPerPage
                  )
                  .map((historicalPlace) => (
                    <HistoricalPlaceCard
                      key={historicalPlace._id}
                      historicalPlace={historicalPlace}
                      onSelect={handleHistoricalPlaceSelect}
                      userRole={userRole}
                      userPreferredCurrency={userPreferredCurrency}
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
                  className={`px-4 py-2 rounded-full bg-white shadow ${
                    currentPage === 1 ? "text-gray-300" : "text-blue-600"
                  }`}
                >
                  <ChevronLeft />
                </button>

                {/* Page X of Y */}
                <span className="text-lg font-medium">
                  {historicalPlaces.length > 0
                    ? `Page ${currentPage} of ${Math.ceil(
                        historicalPlaces.length / tripsPerPage
                      )}`
                    : "No pages available"}
                </span>

                <button
                  onClick={() => {
                    handlePageChange(currentPage + 1);
                  }}
                  disabled={
                    currentPage ===
                      Math.ceil(historicalPlaces.length / tripsPerPage) ||
                    historicalPlaces.length === 0
                  }
                  className={`px-4 py-2 rounded-full bg-white shadow ${
                    currentPage ===
                    Math.ceil(historicalPlaces.length / tripsPerPage)
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
        </div>
      )}
    </div>
  );
}

export default AllHistoricalPlacesComponent;
