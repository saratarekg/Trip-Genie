'use client'

import React, { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Calendar, ChevronRight, MapPin, X } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

const fetchData = async (userRole, dataType) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/${userRole}/history-transportation`,
      {
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
      }
    )
    console.log(response.data);
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return []
    }
    console.error(`Error fetching ${dataType}:`, error)
    throw error
  }
}

const BookingDetails = ({ booking, isOpen, onClose, formatPrice }) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Your transportation booking information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">From:</span>
            <span className="col-span-3">{booking.transportationID.from}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">To:</span>
            <span className="col-span-3">{booking.transportationID.to}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Vehicle:</span>
            <span className="col-span-3">{booking.transportationID.vehicleType}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Departure:</span>
            <span className="col-span-3">{new Date(booking.transportationID.timeDeparture).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Duration:</span>
            <span className="col-span-3">{booking.transportationID.estimatedDuration} hours</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Seats:</span>
            <span className="col-span-3">{booking.seatsBooked}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Cost:</span>
            <span className="col-span-3">{formatPrice(booking.transportationID.ticketCost)} per ticket</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Total:</span>
            <span className="col-span-3">{formatPrice(booking.totalCost)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Payment:</span>
            <span className="col-span-3">{booking.paymentMethod}</span>
          </div>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export default function TouristTransportationHistory() {
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest")
  const [transportations, setTransportations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [exchangeRate, setExchangeRate] = useState({});

  const fetchUserInfo = async () => {
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
};

const fetchExchangeRate = async (booking) => {
  try {
    const token = Cookies.get("jwt");
    const response = await fetch(
      `http://localhost:4000/tourist/populate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Ensure content type is set to JSON
        },
        body: JSON.stringify({
          base: "67140446ee157ee4f239d523", // Sending base currency ID
          target: userPreferredCurrency._id, // Sending target currency ID
        }),
      }
    );
    // Parse the response JSON
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setExchangeRate(data.conversion_rate);
    } else {
      // Handle possible errors
      console.error("Error in fetching exchange rate:", data.message);
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
  }
};


useEffect(() => {
  if (selectedBooking) {
      if (
        userPreferredCurrency &&
        userPreferredCurrency !== "67140446ee157ee4f239d523"
      ) {
        fetchExchangeRate(selectedBooking);
      }
  }
}, [userPreferredCurrency, selectedBooking]);

const formatPrice = (price, type) => {
  if (selectedBooking && userPreferredCurrency ) {
      if (userPreferredCurrency === "67140446ee157ee4f239d523") {
        return `${userPreferredCurrency.symbol}${selectedBooking.transportationID.ticketCost}`;
      } else {
        const exchangedPrice =
        selectedBooking.transportationID.ticketCost * exchangeRate;
        return `${userPreferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
      }
    }
};

  const handleTransportationClick = (booking) => {
    if (booking.transportationID.isDeleted) {
      return toast({
        title: "Transportation Unavailable",
        description: "This transportation booking no longer exists",
        duration: 3000,
      })
    }
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  useEffect(() => {
    const role = Cookies.get("role") || "guest"
    setUserRole(role);

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const transportationsData = await fetchData(role, "touristTransportationHistory");
        setTransportations(transportationsData);
      } catch (err) {
        setError("An error occurred while fetching data")
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
    fetchUserInfo();
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  const noBookingsMessage = (
    <div className="text-center py-8">
      <p className="text-xl font-semibold text-gray-600">
        No past transportation bookings
      </p>
      <p className="text-gray-500 mt-2">
        Your completed trips will appear here
      </p>
    </div>
  )

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold mb-2">My Transportation History</h1>
    <p className="text-sm text-gray-500 mb-2">Transportation / Attended</p>
    
      <Card>
        <CardHeader>
          <CardDescription>Your completed transportation bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {transportations.length > 0
              ? transportations.map((booking) => (
                  <div key={booking._id} className="mb-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left whitespace-normal"
                      onClick={() => handleTransportationClick(booking)}
                    >
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4" />
                        <div>
                          <span>{`${booking.transportationID.from} to ${booking.transportationID.to}`}</span>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>
                              {`${new Date(booking.transportationID.timeDeparture).toLocaleDateString()} - ${booking.transportationID.vehicleType}`}
                            </span>
                            <span className="block">
                              {`${booking.seatsBooked} Ticket(s) - ${booking.transportationID.ticketCost} per ticket`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                    <Separator className="my-2" />
                  </div>
                ))
              : noBookingsMessage}
          </ScrollArea>
        </CardContent>
      </Card>
      <BookingDetails 
        booking={selectedBooking} 
        isOpen={isDialogOpen}
        formatPrice={formatPrice}
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  )
}