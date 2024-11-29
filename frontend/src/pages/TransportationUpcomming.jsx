'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { format } from 'date-fns'
import { Eye, Trash2, MapPin, Clock, Car, DollarSign, Armchair ,CheckCircle} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const fetchUpcomingBookings = async () => {
  try {
    const response = await axios.get('http://localhost:4000/tourist/upcoming-transportation', {
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error)
    throw error
  }
}

export default function UpcomingTransportation() {
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = 
  useState(false);
  const [notificationIconType, setNotificationIconType] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [exchangeRate, setExchangeRate] = useState({});
  const [tourist, setTourist] = useState(null);

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
        setTourist(response.data);
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


  const formatWallet = (price) => {
    if (!tourist || !tourist.wallet) {
      console.log("Tourist or wallet not available.");
      return "Wallet not available";
    }
  
    
  
    const exchangedPrice = price * exchangeRate;
    exchangedPrice.toFixed(2);
    return `${userPreferredCurrency.symbol}${exchangedPrice}`;
  };

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true)
      try {
        const data = await fetchUpcomingBookings()
        fetchUserInfo();
        setBookings(data)
      } catch (err) {
        setError('Failed to load upcoming bookings')
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [])

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  const showNotification = (message, iconType) => {
    setNotificationMessage(message);
    setNotificationIconType(iconType);
    setIsNotificationDialogOpen(true);
  };

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBooking) return

    try {
      await axios.delete(`http://localhost:4000/tourist/transportation-booking/${selectedBooking._id}`, {
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
      })
      setBookings(bookings.filter((booking) => booking._id !== selectedBooking._id));
      setIsDeleteDialogOpen(false);
      const totalPrice = selectedBooking.totalCost; // Ensure paymentAmount is available and numeric
      const formattedTotalPrice = formatPrice(totalPrice);
      const newWalletBalance =
        selectedBooking.paymentMethod === "wallet"
          ? tourist.wallet + totalPrice
          : tourist.wallet;
      const newwallet = tourist.wallet + totalPrice;

          console.log("total price", formatPrice(selectedBooking.totalCost));
          console.log("wallet updated",formatWallet(tourist.wallet + totalPrice));
          console.log("paymentype", selectedBooking.paymentMethod);
  
      // Update wallet balance if necessary
      if (selectedBooking.paymentMethod === "wallet") {
        tourist.wallet = newWalletBalance;
      }
  
      // Display success notification with refund details
      showNotification(
        <>
          <p>Your booking has been successfully cancelled.</p>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Label className="text-right">Amount Refunded:</Label>
              <div>{formattedTotalPrice}</div>
            </div>
            {selectedBooking.paymentMethod === "wallet" && (
              <div className="grid grid-cols-2 gap-4">
                <Label className="text-right">New Wallet Balance:</Label>
                <div>{  formatWallet(newwallet.toFixed(2))}</div>
              </div>
            )}
          </div>
        </>,
        "success"
      );
     // window.location.reload();
      // You might want to show a success notification here
    } catch (error) {
      console.error('Error deleting booking:', error)
      // You might want to show an error notification here
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2">My Transportation Bookings</h1>
    <p className="text-sm text-gray-500 mb-2">Transportation / Upcoming</p>
    
      <Card>
        <CardHeader>
          <CardDescription>Your scheduled transportation</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking._id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{`${booking.transportationID.from} to ${booking.transportationID.to}`}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.transportationID.timeDeparture), 'PPP')}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleViewBooking(booking)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(booking)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xl font-semibold text-gray-600">No upcoming transportation bookings</p>
                <p className="text-gray-500 mt-2">Book your next trip now!</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">From:</span> {selectedBooking.transportationID.from}
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">To:</span> {selectedBooking.transportationID.to}
              </div>
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Departure:</span>{' '}
                {format(new Date(selectedBooking.transportationID.timeDeparture), 'PPP p')}
              </div>
              <div className="flex items-center gap-4">
                <Car className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Vehicle Type:</span> {selectedBooking.transportationID.vehicleType}
              </div>
              <div className="flex items-center gap-4">
                <Armchair className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Seats Booked:</span> {selectedBooking.seatsBooked}
              </div>
              <div className="flex items-center gap-4">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Total Cost:</span> {formatPrice(selectedBooking.totalCost)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transportation booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>
          {/* Dynamic Icon */}
          <div className="flex items-center gap-2">
            {notificationIconType === "error" && (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            {notificationIconType === "success" && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {notificationIconType === "warning" && (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            {/* Notification Message */}
            <p>{notificationMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotificationDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}