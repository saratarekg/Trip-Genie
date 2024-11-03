"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Bed, Calendar, ArrowUpDown, AlertCircle } from "lucide-react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";

export default function HotelBookingPage() {
  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [hotels, setHotels] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [isBookingConfirmationOpen, setIsBookingConfirmationOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hotelOffers, setHotelOffers] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cvv, setCvv] = useState("");
  const [exchangeRates, setExchangeRates] = useState({});

  const itemsPerPage = 9;

  const refreshToken = useCallback(async () => {
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
  }, []);

  const getCurrencyCode = useCallback(async () => {
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
  }, []);

  const getExchangeRates = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/rates");
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (err) {
      setError("Failed to fetch exchange rates. Please try again later.");
    }
  }, []);

  useEffect(() => {
    refreshToken();
    getCurrencyCode();
    getExchangeRates();
  }, [refreshToken, getCurrencyCode, getExchangeRates]);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    if (!fromRate || !toRate) return amount;
    return (amount / fromRate) * toRate;
  };

  const handleSearch = async () => {
    if (!city) {
      setError("Please enter a city code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setHotels([]);
    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${city}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setError("No hotels found for your search criteria.");
        setHotels([]);
      } else {
        const hotelIds = data.data.map(hotel => hotel.hotelId);
        const fetchHotelOffers = async (ids) => {
          try {
            const response = await fetch(
              `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${ids.join(',')}&adults=${adults}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&currency=USD`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (response.ok) {
              return await response.json();
            } else {
              console.warn(`Failed to fetch offers for hotels: ${ids.join(', ')}`);
              return { data: [] };
            }
          } catch (error) {
            console.error(`Error fetching hotel offers: ${error.message}`);
            return { data: [] };
          }
        };

        for (let i = 0; i < hotelIds.length; i += 20) {
          const chunk = hotelIds.slice(i, i + 20);
          const offersData = await fetchHotelOffers(chunk);
          const validHotels = offersData.data.filter(hotel => 
            hotel.offers && 
            hotel.offers[0] && 
            hotel.offers[0].price && 
            !isNaN(parseFloat(hotel.offers[0].price.total))
          );
          setHotels(prevHotels => [...prevHotels, ...validHotels]);
          
          if (i + 20 < hotelIds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        }

        setCurrentPage(1);
      }
    } catch (err) {
      setError("Failed to fetch hotels. Please try again later.");
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterHotels = (hotels) => {
    let filtered = [...hotels];

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "price":
          aValue = parseFloat(convertCurrency(a.offers[0].price.total, a.offers[0].price.currency, currencyCode) || 0);
          bValue = parseFloat(convertCurrency(b.offers[0].price.total, b.offers[0].price.currency, currencyCode) || 0);
          break;
        default:
          aValue = parseFloat(convertCurrency(a.offers[0].price.total, a.offers[0].price.currency, currencyCode) || 0);
          bValue = parseFloat(convertCurrency(b.offers[0].price.total, b.offers[0].price.currency, currencyCode) || 0);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  };

  const paginatedHotels = filterHotels(hotels).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filterHotels(hotels).length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenDialog = async (hotel) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
    setDialogError("");

    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v3/shopping/hotel-offers/${hotel.offers[0].id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hotel details");
      }

      const data = await response.json();
      setHotelOffers(data.data);
    } catch (err) {
      setDialogError(err.message);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setHotelOffers(null);
    resetBookingForm();
  };

  const handleBookNow = () => {
    setIsBookingConfirmationOpen(true);
  };

  const handleCloseAllPopups = () => {
    setIsBookingConfirmationOpen(false);
    setIsDialogOpen(false);
    setHotelOffers(null);
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
    if (paymentMethod === "card" && (!cardNumber || !expiryDate || !holderName || !cvv)) {
      return false;
    }
    return true;
  };

  const today = new Date().toISOString().split("T")[0];

  const handleCheckInDateChange = (e) => {
    const selectedDate = e.target.value;
    setCheckInDate(selectedDate);
    if (checkOutDate && new Date(checkOutDate) <= new Date(selectedDate)) {
      setCheckOutDate("");
    }
  };

  const getPageNumbers = (current, total, maxVisible) => {
    const pages = [];
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    pages.push(1);
    const halfVisible = Math.floor(maxVisible / 2);
    let start = Math.max(2, current - halfVisible);
    let end = Math.min(total - 1, current + halfVisible);
    if (current <= halfVisible + 1) {
      end = maxVisible - 1;
    } else if (current >= total - halfVisible) {
      start = total - maxVisible + 2;
    }
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < total - 1) pages.push('ellipsis');
    pages.push(total);
    return pages;
  };

  return (
    <div className="bg-white-100 min-h-screen p-4 space-y-4 mt-5">
      <h1 className="text-3xl font-bold text-blue-900 text-center">
        Hotel Booking
      </h1>

      <Card className="bg-white shadow-lg mt-2">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City (IATA Code)
              </label>
              <Input
                id="city"
                type="text"
                placeholder="e.g., CAI"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border-2 border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <Input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={handleCheckInDateChange}
                min={today}
                className="border-2 border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date
              </label>
              <Input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || today}
                className="border-2 border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700  mb-1">
                Number of Adults
              </label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger id="adults" className="border-2 border-amber-400">
                  <SelectValue placeholder="Select number of adults" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(9)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || !city || !checkInDate || !checkOutDate}
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 w-full mt-4"
          >
            {isLoading ? "Searching..." : "Search Hotels"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hotels.length > 0 && (
        <div className="space-y-4 mt-3">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] border-amber-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder((order) => (order === "asc" ? "desc" : "asc"))}
                className="flex gap-2 border-amber-400"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedHotels.map((hotel, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-900 text-white rounded">
                        <Bed className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold">
                        {hotel.hotel.name}
                      </h3>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>Check-in: {formatDate(hotel.offers[0].checkInDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span>Check-out: {formatDate(hotel.offers[0].checkOutDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-lg">
                        <span>Price: {convertCurrency(hotel.offers[0].price.total, hotel.offers[0].price.currency, currencyCode).toFixed(2)} {currencyCode}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white"
                        onClick={() => handleOpenDialog(hotel)}
                      >
                        See Details
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
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {getPageNumbers(currentPage, totalPages, 5).map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className={currentPage === page ? "pointer-events-none" : ""}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hotel Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected hotel.
            </DialogDescription>
          </DialogHeader>
          {dialogError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{dialogError}</AlertDescription>
            </Alert>
          )}

          {selectedHotel && hotelOffers && !dialogError && (
            <div className="mt-4 space-y-4">
              <h4 className="font-semibold mb-2">{hotelOffers.hotel.name}</h4>
              <p>Check-in: {formatDate(hotelOffers.offers[0].checkInDate)}</p>
              <p>Check-out: {formatDate(hotelOffers.offers[0].checkOutDate)}</p>
              <p>Room Type: {hotelOffers.offers[0].room.type}</p>
              <p>
                Price: {convertCurrency(hotelOffers.offers[0].price.total, hotelOffers.offers[0].price.currency, currencyCode).toFixed(2)} {currencyCode}
              </p>
              <p>Adults: {adults}</p>
              <div>
                <h5 className="font-semibold mt-4 mb-2">Description:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {hotelOffers.offers[0].room.description.text.split('-').map((item, index) => (
                    <li key={index}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mt-4 mb-2">Amenities:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {hotelOffers.hotel.amenities.map((amenity, index) => (
                    <li key={index}>
                      {amenity.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
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

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
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
                className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-white"
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
              Your hotel has been booked successfully. You will receive a
              confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              onClick={handleCloseAllPopups}
              className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-white"
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}