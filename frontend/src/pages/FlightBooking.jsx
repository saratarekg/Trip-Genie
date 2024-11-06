"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUpDown, Calendar, Plane, AlertCircle, Building2, ArrowRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { useSearchParams, useNavigate } from 'react-router-dom';

const airports = [
  { code: 'CAI', name: 'Cairo International Airport', region: 'Egypt' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', region: 'France' },
  { code: 'DXB', name: 'Dubai International Airport', region: 'United Arab Emirates' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', region: 'USA' },
  { code: 'LHR', name: 'Heathrow Airport', region: 'UK' },
  { code: 'HND', name: 'Tokyo Haneda Airport', region: 'Japan' },
  { code: 'PEK', name: 'Beijing Capital International Airport', region: 'China' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', region: 'Australia' },
  { code: 'FRA', name: 'Frankfurt Airport', region: 'Germany' },
  { code: 'SIN', name: 'Singapore Changi Airport', region: 'Singapore' },
  { code: 'AMS', name: 'Amsterdam Schiphol Airport', region: 'Netherlands' },
  { code: 'ORD', name: 'O’Hare International Airport', region: 'USA' },
  { code: 'MEX', name: 'Mexico City International Airport', region: 'Mexico' },
  { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', region: 'Brazil' },
  { code: 'HKG', name: 'Hong Kong International Airport', region: 'Hong Kong' },
  { code: 'ICN', name: 'Incheon International Airport', region: 'South Korea' },
  { code: 'JNB', name: 'O.R. Tambo International Airport', region: 'South Africa' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', region: 'Canada' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', region: 'Spain' },
  { code: 'SVO', name: 'Sheremetyevo International Airport', region: 'Russia' },
  { code: 'LAX', name: 'Los Angeles International Airport', region: 'USA' },
  { code: 'IST', name: 'Istanbul Airport', region: 'Turkey' },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', region: 'Spain' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', region: 'India' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', region: 'USA' },
  { code: 'MUC', name: 'Munich Airport', region: 'Germany' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', region: 'Italy' },
  { code: 'DME', name: 'Domodedovo International Airport', region: 'Russia' },
];

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '100%',
    margin: '0 auto',
    backgroundColor: '#1A3B47',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tabsContainer: {
    display: 'flex',
    backgroundColor: '#388A94',
    padding: '10px 10px 0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    cursor: 'pointer',
    border: 'none',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    color: '#E6DCCF',
    backgroundColor: 'transparent',
    fontSize: '14px',
    marginRight: '4px',
    transition: 'background-color 0.3s, color 0.3s',
  },
  activeTab: {
    backgroundColor: 'white',
    color: '#388A94',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    transition: 'opacity 0.3s',
  },
  form: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  fieldGroup: {
    flex: 1,
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  locationDisplay: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '4px',
  },
  locationSubtext: {
    fontSize: '12px',
    color: '#666',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#1A3B47',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-end',
    marginTop: '24px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100%',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  tripTypeSelect: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '15px',
  },
};

const formatDate = (date) => {
return date.toISOString().split('T')[0];
};

function BookingPage() {
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get('from') || 'CAI');
  const [to, setTo] = useState(searchParams.get('to') || 'CDG');
  const [departureDate, setDepartureDate] = useState(searchParams.get('departDate') || formatDate(new Date()));
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') || formatDate(new Date(Date.now())));
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState(searchParams.get('tripType') || 'roundTrip');
  const [flights, setFlights] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceFilter, setPriceFilter] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [isBookingConfirmationOpen, setIsBookingConfirmationOpen] =
    useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mainContentRef = useRef(null);

  const itemsPerPage = 9;

  useEffect(() => {
    // Ensure return date is after depart date
    if (new Date(returnDate) <= new Date(departureDate)) {
      setReturnDate(formatDate(new Date(new Date(departureDate).getTime())));
    }
  }, [departureDate, returnDate]);

  // useEffect(() => {
  //   if (from && to && departureDate && (tripType === 'oneWay' || returnDate)) {
  //     handleSearchFromParameters();
  //   }
  // }, [from, to, departureDate, returnDate, tripType]);

  // useEffect(() => {
  //   // Auto-trigger search if parameters are provided
  //   if (searchParams.get('from') && searchParams.get('to')) {
  //     handleSearch();
  //   }
  // }, [searchParams]);
  
  const renderLocationDisplay = (code) => {
    const list = airports;
    const location = list.find(item => item.code === code);
    return location ? (
      <>
        <div style={styles.locationDisplay}>{location.name}</div>
        <div style={styles.locationSubtext}>{location.code}, {location.region}</div>
      </>
    ) : null;
  };

  async function refreshToken() {
    try {
      const API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
      const API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
      const response = await fetch(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: API_KEY,
            client_secret: API_SECRET,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setTimeout(refreshToken, 29 * 60 * 1000);
    } catch (err) {
      setError("Authentication failed. Please try again later.");
    }
  }

  const getCurrencyCode = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(
        "http://localhost:4000/tourist/currencies/code",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch currency code");
      }

      const data = await response.json();
      setCurrencyCode(data);
    } catch (err) {
      setError("Failed to fetch currency code. Please try again later.");
    }
  };

  useEffect(() => {
    Promise.all([refreshToken(), getCurrencyCode()]);
    // if (searchParams && from && to && departureDate && (tripType === 'oneWay' || returnDate)) {
    //   handleSearch();
    // }
  }, []);

  const handleSearch = async () => {
    if (returnDate && new Date(returnDate) < new Date(departureDate)) {
      setError("Return date cannot be before departure date.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departureDate}${
          tripType === "roundTrip" ? `&returnDate=${returnDate}` : ""
        }&adults=1&nonStop=true&currencyCode=${currencyCode}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch flights");
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setError("No flights found for your search criteria.");
        setFlights([]);
      } else {
        setFlights(data.data);
        setCurrentPage(1);
        const prices = data.data.map((flight) =>
          parseFloat(flight.price.total)
        );
        setMaxPrice(Math.max(...prices));
      }
    } catch (err) {
      setError("Failed to fetch flights. Please try again later.");
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSearchFromParameters = useCallback(async () => {
  //   if (returnDate && new Date(returnDate) < new Date(departureDate)) {
  //     setError("Return date cannot be before departure date.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     const response = await fetch(
  //       `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departureDate}${
  //         tripType === "roundTrip" ? `&returnDate=${returnDate}` : ""
  //       }&adults=1&nonStop=true&currencyCode=${currencyCode}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch flights");
  //     }

  //     const data = await response.json();

  //     if (!data.data || data.data.length === 0) {
  //       setError("No flights found for your search criteria.");
  //       setFlights([]);
  //     } else {
  //       setFlights(data.data);
  //       setCurrentPage(1);
  //       const prices = data.data.map((flight) =>
  //         parseFloat(flight.price.total)
  //       );
  //       setMaxPrice(Math.max(...prices));
  //     }
  //   } catch (err) {
  //     setError("Failed to fetch flights. Please try again later.");
  //     setFlights([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // },[]);


  const filterFlights = (flights) => {
    let filtered = [...flights];

    if (priceFilter !== "all") {
      filtered = filtered.filter((flight) => {
        const price = parseFloat(flight.price.total);
        switch (priceFilter) {
          case "under25":
            return price < maxPrice * 0.25;
          case "under50":
            return price < maxPrice * 0.5;
          case "under75":
            return price < maxPrice * 0.75;
          case "over75":
            return price >= maxPrice * 0.75;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "price":
          aValue = parseFloat(a.price.total);
          bValue = parseFloat(b.price.total);
          break;
        case "departure":
          aValue = new Date(a.itineraries[0].segments[0].departure.at);
          bValue = new Date(b.itineraries[0].segments[0].departure.at);
          break;
        case "arrival":
          aValue = new Date(
            a.itineraries[0].segments[
              a.itineraries[0].segments.length - 1
            ].arrival.at
          );
          bValue = new Date(
            b.itineraries[0].segments[
              b.itineraries[0].segments.length - 1
            ].arrival.at
          );
          break;
        default:
          aValue = parseFloat(a.price.total);
          bValue = parseFloat(b.price.total);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  };

  const paginatedFlights = filterFlights(flights).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filterFlights(flights).length / itemsPerPage);

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleOpenDialog = (flight) => {
    setSelectedFlight(flight);
    setIsDialogOpen(true);
    if (mainContentRef.current) {
      mainContentRef.current.inert = true;
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.inert = false;
    }
  };

  const handleBookNow = () => {
    setIsBookingConfirmationOpen(true);
  };

  const handleCloseAllPopups = () => {
    setIsBookingConfirmationOpen(false);
    setIsDialogOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.inert = false;
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleDepartureDateChange = (e) => {
    const selectedDate = e.target.value;
    setDepartureDate(selectedDate);
    // if (returnDate && new Date(returnDate) < new Date(selectedDate)) {
    //   setReturnDate(selectedDate);
    // }
  };

  return (
    // <div className="bg-white-100 min-h-screen p-4 space-y-4 mt-5">
    <div className="bg-[#E6DCCF] ">
    {/* Navbar */}
    <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      </div>
    </div>
    <div className="h-16"></div>

    <div className="bg-[#E6DCCF] min-h-screen mx-auto px-24">
      <div ref={mainContentRef}>
        <h1 className="text-4xl font-bold text-[#1A3B47] text-center">
          Flight Booking
        </h1>
        <div className="h-10"></div>

        <div className="mx-auto px-24 mb-12">
  <div style={styles.container}>
    <div style={{
      ...styles.formContainer,
      opacity: activeTab === 'flights' ? 1 : 0,
      position: activeTab === 'flights' ? 'static' : 'absolute',
      pointerEvents: activeTab === 'flights' ? 'auto' : 'none',
    }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
      style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>TRIP TYPE</label>
          <select
            style={styles.select}
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
          >
            <option value="roundTrip">Round Trip</option>
            <option value="oneWay">One Way</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>FROM</label>
          <select
            style={styles.select}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          >
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.name} ({airport.code}) - {airport.region}
              </option>
            ))}
          </select>
          {renderLocationDisplay(from,)}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>TO</label>
          <select
            style={styles.select}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          >
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.name} ({airport.code}) - {airport.region}
              </option>
            ))}
          </select>
          {renderLocationDisplay(to)}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>DEPARTURE</label>
          <div style={{ position: 'relative' }}>
            <Input
                  id="departureDate"
                  type="date"
                  style={styles.input}
                  value={departureDate}
                  onChange={handleDepartureDateChange}
                  min={today}
                  required
                />
            {/* <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
          </div>
          <div style={styles.locationDisplay}>
            {new Date(departureDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
        </div>

        {tripType === 'roundTrip' && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>RETURN</label>
            <div style={{ position: 'relative' }}>
              <Input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || today}
                    style={styles.input}
                  />
              {/* <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
            </div>
            <div style={styles.locationDisplay}>
              {new Date(returnDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>
        )}
        <button 
        style={styles.button}
        // onClick={handleSearch}
                disabled={isLoading}
                className="bg-[#1A3B47] hover:bg-[#1A3B47] text-white font-semibold px-8"
                >
          {isLoading ? "Searching..." : "Search Flights"}
        </button>
      </form>
    </div>
  </div>
  </div>

        {/* <Card className="bg-white shadow-lg mt-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label
                  htmlFor="from"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  From (City Code)
                </label>
                <Input
                  id="from"
                  type="text"
                  placeholder="e.g., NYC"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border-2 border-amber-400"
                />
              </div>
              <div>
                <label
                  htmlFor="to"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To (City Code)
                </label>
                <Input
                  id="to"
                  type="text"
                  placeholder="e.g., LAX"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border-2 border-amber-400"
                />
              </div>
              <div>
                <label
                  htmlFor="departureDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Departure Date
                </label>
                <Input
                  id="departureDate"
                  type="date"
                  value={departureDate}
                  onChange={handleDepartureDateChange}
                  min={today}
                  className="border-2 border-amber-400"
                />
              </div>
              {tripType === "roundTrip" && (
                <div>
                  <label
                    htmlFor="returnDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Return Date
                  </label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || today}
                    className="border-2 border-amber-400"
                  />
                </div>
              )}
              
              <div>
              <label
                htmlFor="tripType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Round-trip/One-way
              </label>
              <Select value={tripType} onValueChange={setTripType}>
              
                <SelectTrigger className="border-2 border-amber-400">
                  <SelectValue placeholder="Trip Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roundTrip">Round Trip</SelectItem>
                  <SelectItem value="oneWay">One Way</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-[#1A3B47] hover:bg-[#1A3B47] text-white font-semibold px-8"
              >
                {isLoading ? "Searching..." : "Search Flights"}
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 mr-24 ml-24 w-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div className="flex flex-col space-y-1">
              <AlertTitle className="text-red-600 font-semibold text-lg">Error</AlertTitle>
              <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
            </div>
            </div>
          </Alert>
        )}

        {flights.length > 0 && (
          <div className="space-y-4 mt-3">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] border-amber-400">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                    <SelectItem value="arrival">Arrival Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
                  }
                  className="flex gap-2 border-amber-400"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder.toUpperCase()}
                </Button>
              </div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[160px] border-amber-400">
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under25">Under {Math.floor(0.25 * maxPrice)} {currencyCode}</SelectItem>
                <SelectItem value="under50">Under {Math.floor(0.5 * maxPrice)} {currencyCode}</SelectItem>
                <SelectItem value="under75">Under {Math.floor(0.75 * maxPrice)} {currencyCode}</SelectItem>
                <SelectItem value="over75">Over {Math.floor(0.75 * maxPrice)} {currencyCode}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedFlights.map((flight, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#388A94] text-white rounded">
                          <Plane className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-semibold">
                          {flight.itineraries[0].segments[0].departure.iataCode}{" "}
                          →{" "}
                          {
                            flight.itineraries[0].segments[
                              flight.itineraries[0].segments.length - 1
                            ].arrival.iataCode
                          }
                        </h3>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Departure:{" "}
                            {formatDateTime(
                              flight.itineraries[0].segments[0].departure.at
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Arrival:{" "}
                            {formatDateTime(
                              flight.itineraries[0].segments[
                                flight.itineraries[0].segments.length - 1
                              ].arrival.at
                            )}
                          </span>
                        </div>
                        {flight.itineraries[1] && (
                          <>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Return Departure:{" "}
                                {formatDateTime(
                                  flight.itineraries[1].segments[0].departure.at
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Return Arrival:{" "}
                                {formatDateTime(
                                  flight.itineraries[1].segments[
                                    flight.itineraries[1].segments.length - 1
                                  ].arrival.at
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <p className="text-xl font-bold  text-[#F88C33]">
                          {flight.price.total} {flight.price.currency}
                        </p>
                        <Button
                          className="bg-[#388A94] hover:bg-[#1A3B47] text-white"
                          onClick={() => handleOpenDialog(flight)}
                        >
                          See Flight
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`cursor-pointer ${
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (i === currentPage - 3 && i > 0) ||
                    (i === currentPage + 3 && i < totalPages - 1)
                  ) {
                    return <PaginationEllipsis key={i} />;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={`cursor-pointer ${
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected flight.
            </DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Outbound Flight</h4>
              {selectedFlight.itineraries[0].segments.map((segment, index) => (
                <div key={index} className="mb-2">
                  <p>
                    From: {segment.departure.iataCode} at{" "}
                    {formatDateTime(segment.departure.at)}
                  </p>
                  <p>
                    To: {segment.arrival.iataCode} at{" "}
                    {formatDateTime(segment.arrival.at)}
                  </p>
                  <p>
                    Flight: {segment.carrierCode} {segment.number}
                  </p>
                </div>
              ))}
              {selectedFlight.itineraries[1] && (
                <>
                  <h4 className="font-semibold mb-2 mt-4">Return Flight</h4>
                  {selectedFlight.itineraries[1].segments.map(
                    (segment, index) => (
                      <div key={index} className="mb-2">
                        <p>
                          From: {segment.departure.iataCode} at{" "}
                          {formatDateTime(segment.departure.at)}
                        </p>
                        <p>
                          To: {segment.arrival.iataCode} at{" "}
                          {formatDateTime(segment.arrival.at)}
                        </p>
                        <p>
                          Flight: {segment.carrierCode} {segment.number}
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
              <h4 className="font-semibold mt-4">Price Details</h4>
              <p>
                Total: {selectedFlight.price.total}{" "}
                {selectedFlight.price.currency}
              </p>
              <Button
                className="mt-4 w-full bg-[#388A94] hover:bg-[#1A3B47] text-white"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBookingConfirmationOpen}
        onOpenChange={setIsBookingConfirmationOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Booking Confirmed</DialogTitle>
            <DialogDescription>
              Your flight has been booked successfully. You will receive a
              confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              onClick={handleCloseAllPopups}
              className="mt-4 w-full bg-[#388A94] hover:bg-[#1A3B47] text-white"
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

export default BookingPage;
