"use client";

import { useState, useEffect } from "react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
  const [priceFilter, setPriceFilter] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [maxPrice, setMaxPrice] = useState(0);
  const [isBookingConfirmationOpen, setIsBookingConfirmationOpen] =
    useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const itemsPerPage = 9;

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
    refreshToken();
    getCurrencyCode();
  }, []);

  const handleSearch = async () => {
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${city}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&currency=${currencyCode}&bestRateOnly=true`,
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
        setHotels(data.data);
        setCurrentPage(1);
        const prices = data.data.map((hotel) =>
          parseFloat(hotel.offers[0].price.total)
        );
        setMaxPrice(Math.max(...prices));
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

    if (priceFilter !== "all") {
      filtered = filtered.filter((hotel) => {
        const price = parseFloat(hotel.offers[0].price.total);
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
          aValue = parseFloat(a.offers[0].price.total);
          bValue = parseFloat(b.offers[0].price.total);
          break;
        case "rating":
          aValue = a.hotel.rating || 0;
          bValue = b.hotel.rating || 0;
          break;
        default:
          aValue = parseFloat(a.offers[0].price.total);
          bValue = parseFloat(b.offers[0].price.total);
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

  const handleOpenDialog = (hotel) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleBookNow = () => {
    setIsBookingConfirmationOpen(true);
  };

  const handleCloseAllPopups = () => {
    setIsBookingConfirmationOpen(false);
    setIsDialogOpen(false);
  };

  const today = new Date().toISOString().split("T")[0];

  const handleCheckInDateChange = (e) => {
    const selectedDate = e.target.value;
    setCheckInDate(selectedDate);
    if (checkOutDate && new Date(checkOutDate) <= new Date(selectedDate)) {
      setCheckOutDate("");
    }
  };

  return (
    <div className="bg-white-100 min-h-screen p-4 space-y-4 mt-5">
      <h1 className="text-3xl font-bold text-blue-900 text-center">
        Hotel Booking
      </h1>

      <Card className="bg-white shadow-lg mt-2">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City (IATA Code)
              </label>
              <Input
                id="city"
                type="text"
                placeholder="e.g., PAR"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border-2 border-amber-400"
              />
            </div>
            <div>
              <label
                htmlFor="checkInDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="checkOutDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="adults"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adults
              </label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger className="border-2 border-amber-400">
                  <SelectValue placeholder="Number of adults" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 w-full"
              >
                {isLoading ? "Searching..." : "Search Hotels"}
              </Button>
            </div>
          </div>
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
                  <SelectItem value="rating">Rating</SelectItem>
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
                        <Calendar className="h-4 w-4" />
                        <span>
                          Check-in: {formatDate(hotel.offers[0].checkInDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Check-out: {formatDate(hotel.offers[0].checkOutDate)}
                        </span>
                      </div>
                      {hotel.hotel.rating && (
                        <div>Rating: {hotel.hotel.rating} / 5</div>
                      )}
                    </div>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <p className="text-xl font-bold text-amber-600">
                        {hotel.offers[0].price.total}{" "}
                        {hotel.offers[0].price.currency}
                      </p>
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

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Hotel Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected hotel.
            </DialogDescription>
          </DialogHeader>
          {selectedHotel && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">{selectedHotel.hotel.name}</h4>
              <p>Rating: {selectedHotel.hotel.rating} / 5</p>
              <p>Check-in: {formatDate(selectedHotel.offers[0].checkInDate)}</p>
              <p>
                Check-out: {formatDate(selectedHotel.offers[0].checkOutDate)}
              </p>
              <p>Room Type: {selectedHotel.offers[0].room.type}</p>
              <p>
                Price: {selectedHotel.offers[0].price.total}{" "}
                {selectedHotel.offers[0].price.currency}
              </p>
              <Button
                className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-white"
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
