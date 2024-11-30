"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UserGuide } from "@/components/UserGuide.jsx"

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
import { ArrowUpDown, Calendar, Plane, AlertCircle } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";

const airports = [
  { code: "CAI", name: "Cairo International Airport", region: "Egypt" },
  { code: "CDG", name: "Charles de Gaulle Airport", region: "France" },
  {
    code: "DXB",
    name: "Dubai International Airport",
    region: "United Arab Emirates",
  },
  { code: "JFK", name: "John F. Kennedy International Airport", region: "USA" },
  { code: "LHR", name: "Heathrow Airport", region: "UK" },
  { code: "HND", name: "Tokyo Haneda Airport", region: "Japan" },
  {
    code: "PEK",
    name: "Beijing Capital International Airport",
    region: "China",
  },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", region: "Australia" },
  { code: "FRA", name: "Frankfurt Airport", region: "Germany" },
  { code: "SIN", name: "Singapore Changi Airport", region: "Singapore" },
  { code: "AMS", name: "Amsterdam Schiphol Airport", region: "Netherlands" },
  { code: "ORD", name: "Hare International Airport", region: "USA" },
  { code: "MEX", name: "Mexico City International Airport", region: "Mexico" },
  {
    code: "GRU",
    name: "São Paulo–Guarulhos International Airport",
    region: "Brazil",
  },
  { code: "HKG", name: "Hong Kong International Airport", region: "Hong Kong" },
  { code: "ICN", name: "Incheon International Airport", region: "South Korea" },
  {
    code: "JNB",
    name: "O.R. Tambo International Airport",
    region: "South Africa",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    region: "Canada",
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas Airport",
    region: "Spain",
  },
  { code: "SVO", name: "Sheremetyevo International Airport", region: "Russia" },
  { code: "LAX", name: "Los Angeles International Airport", region: "USA" },
  { code: "IST", name: "Istanbul Airport", region: "Turkey" },
  { code: "BCN", name: "Barcelona-El Prat Airport", region: "Spain" },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    region: "India",
  },
  {
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    region: "USA",
  },
  { code: "MUC", name: "Munich Airport", region: "Germany" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino Airport", region: "Italy" },
  { code: "DME", name: "Domodedovo International Airport", region: "Russia" },
];

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "100%",
    margin: "0 auto",
    backgroundColor: "#1A3B47",
    borderRadius: "8px",
    overflow: "hidden",
  },
  formContainer: {
    backgroundColor: "white",
    padding: "20px",
    transition: "opacity 0.3s",
  },
  form: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
  },
  fieldGroup: {
    flex: 1,
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "4px",
  },
  select: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  locationDisplay: {
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "4px",
  },
  locationSubtext: {
    fontSize: "12px",
    color: "#666",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#1A3B47",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-end",
    marginTop: "24px",
  },
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

function BookingPage() {
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") || "CAI");
  const [to, setTo] = useState(searchParams.get("to") || "CDG");
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [seatType, setSeatType] = useState("Economy");
  const [departureDate, setDepartureDate] = useState(
    searchParams.get("departDate") || formatDate(new Date())
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("returnDate") ||
      formatDate(new Date(Date.now() + 86400000))
  );
  const [tripType, setTripType] = useState(
    searchParams.get("tripType") || "roundTrip"
  );
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cvv, setCvv] = useState("");

  const itemsPerPage = 9;

  useEffect(() => {
    if (new Date(returnDate) <= new Date(departureDate)) {
      setReturnDate(
        formatDate(new Date(new Date(departureDate).getTime() + 86400000))
      );
    }
  }, [departureDate, returnDate]);

  const renderLocationDisplay = (code) => {
    const location = airports.find((item) => item.code === code);
    return location ? (
      <>
        <div style={styles.locationDisplay}>{location.name}</div>
        <div style={styles.locationSubtext}>
          {location.code}, {location.region}
        </div>
      </>
    ) : null;
  };

  const handleBookNow = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch("http://localhost:4000/tourist/book-flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightID: `${Math.random().toString(36).substr(2, 9)}`,
          from: selectedFlight.itineraries[0].segments[0].departure.iataCode,
          to: selectedFlight.itineraries[0].segments[
            selectedFlight.itineraries[0].segments.length - 1
          ].arrival.iataCode,
          departureDate: selectedFlight.itineraries[0].segments[0].departure.at,
          arrivalDate:
            selectedFlight.itineraries[0].segments[
              selectedFlight.itineraries[0].segments.length - 1
            ].arrival.at,
          price: parseFloat(selectedFlight.price.total),
          numberOfTickets: numberOfSeats,
          type: selectedFlight.itineraries[1] ? "Round Trip" : "One Way",
          returnDepartureDate: selectedFlight.itineraries[1]
            ? selectedFlight.itineraries[1].segments[0].departure.at
            : undefined,
          returnArrivalDate: selectedFlight.itineraries[1]
            ? selectedFlight.itineraries[1].segments[
                selectedFlight.itineraries[1].segments.length - 1
              ].arrival.at
            : undefined,
          seatType: seatType,
          flightType: selectedFlight.itineraries[0].segments[0].carrierCode + " " + selectedFlight.itineraries[0].segments[0].number,
          flightTypeReturn: selectedFlight.itineraries[1]
            ? selectedFlight.itineraries[1].segments[0].carrierCode
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const data = await response.json();
      console.log("Booking successful:", data);
      setIsBookingConfirmationOpen(true);
    } catch (error) {
      console.error("Booking error:", error);
      setError("Failed to book the flight. Please try again.");
    }
  };

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };



  const guideSteps = [
    {
      target: "body",
      content:
        "Welcome to the flight booking page! Here, you can search for flights, view flight details, and book your flight tickets.",
      placement: "center",
    },
    {
      target: ".search",
      content: "Please enter your departure and arrival times, select the departure and arrival airports, and specify the type of ticket to proceed with your booking!",
      placement: "top",
    },
    {
      target: ".seeDetails",
      content:
        "Click on the 'See Flight' button to view the details of the selected flight, Enter your personal data and to finally choose your payment method before confirming your flight booking!.",
      placement: "top",
    },
    
    
  ];

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
    resetBookingForm();
  };

  const handleCloseAllPopups = () => {
    setIsBookingConfirmationOpen(false);
    setIsDialogOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.inert = false;
    }
    resetBookingForm();
  };

  const resetBookingForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setPaymentMethod("");
    setCardNumber("");
    setExpiryDate("");
    setHolderName("");
    setCvv("");
  };

  const isBookingFormValid = () => {
    if (!firstName || !lastName || !phone || !email || !paymentMethod) {
      return false;
    }
    if (
      paymentMethod === "card" &&
      (!cardNumber || !expiryDate || !holderName || !cvv)
    ) {
      return false;
    }
    return true;
  };

  const today = new Date().toISOString().split("T")[0];

  const handleDepartureDateChange = (e) => {
    const selectedDate = e.target.value;
    setDepartureDate(selectedDate);
  };

  return (
    <div className="bg-[#E6DCCF]">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="h-16"></div>

      <div className="bg-[#E6DCCF] min-h-screen mx-auto px-24">
        <div ref={mainContentRef}>
          <h1 className="text-5xl font-bold text-[#1A3B47]">Flight Booking</h1>
          <div className="h-10"></div>

          <div className="mx-auto mb-12 search">
            <div style={styles.container}>
              <div style={styles.formContainer}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  style={styles.form}
                >
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
                    {renderLocationDisplay(from)}
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
                    <div style={{ position: "relative" }}>
                      <Input
                        id="departureDate"
                        type="date"
                        style={styles.input}
                        value={departureDate}
                        onChange={handleDepartureDateChange}
                        min={today}
                        required
                      />
                    </div>
                    <div style={styles.locationDisplay}>
                      {new Date(departureDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>

                  {tripType === "roundTrip" && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>RETURN</label>
                      <div style={{ position: "relative" }}>
                        <Input
                          id="returnDate"
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={departureDate || today}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.locationDisplay}>
                        {new Date(returnDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  )}
                  <button
                    style={styles.button}
                    disabled={isLoading}
                    className="bg-[#1A3B47] hover:bg-[#1A3B47] text-white font-semibold px-8"
                  >
                    {isLoading ? "Searching..." : "Search Flights"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-50 border-red-200 mr-24 ml-24 w-200"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="flex flex-col space-y-1">
                  <AlertTitle className="text-red-600 font-semibold text-lg">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
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
                      setSortOrder((order) =>
                        order === "asc" ? "desc" : "asc"
                      )
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
                    <SelectItem value="under25">
                      Under {Math.floor(0.25 * maxPrice)} {currencyCode}
                    </SelectItem>
                    <SelectItem value="under50">
                      Under {Math.floor(0.5 * maxPrice)} {currencyCode}
                    </SelectItem>
                    <SelectItem value="under75">
                      Under {Math.floor(0.75 * maxPrice)} {currencyCode}
                    </SelectItem>
                    <SelectItem value="over75">
                      Over {Math.floor(0.75 * maxPrice)} {currencyCode}
                    </SelectItem>
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
                            {
                              flight.itineraries[0].segments[0].departure
                                .iataCode
                            }{" "}
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
                                    flight.itineraries[1].segments[0].departure
                                      .at
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
                            className="bg-[#388A94] hover:bg-[#1A3B47] text-white seeDetails"
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
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
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
          <DialogContent className="sm:max-w-[425px] bg-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Flight Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected flight.
              </DialogDescription>
            </DialogHeader>
            {selectedFlight && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Outbound Flight</h4>
                {selectedFlight.itineraries[0].segments.map(
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
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Select
                    value={numberOfSeats.toString()}
                    onValueChange={(value) => setNumberOfSeats(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Number of Seats" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Seat" : "Seats"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={seatType} onValueChange={setSeatType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seat Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="First Class">First Class</SelectItem>
                    </SelectContent>
                  </Select>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet">Wallet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <Input
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                      <Input
                        placeholder="Expiry Date (YYYY-MM)"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                      <Input
                        placeholder="Card Holder Name"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                      />
                      <Input
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <Button
                  className="mt-4 w-full bg-[#388A94] hover:bg-[#1A3B47] text-white "
                  onClick={handleBookNow}
                  disabled={!isBookingFormValid()}
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
      {(getUserRole() === "guest" || getUserRole() === "tourist") && (
        <UserGuide
          steps={guideSteps}
          pageName="flight"
        />
      )}
    </div>
  );
}

export default BookingPage;
