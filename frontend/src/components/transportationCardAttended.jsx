import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TransportationCard({ 
  booking, 
  userRole, 
  onEdit, 
  onDelete, 
  onBook,
  displayPrice,
  tourist,
  setSelectedBooking,
  userPreferredCurrency,
  exchangeRate
}) {

  const formatPrice = (price, type) => {
    if (booking && userPreferredCurrency ) {
        if (userPreferredCurrency === "67140446ee157ee4f239d523") {
          return `${userPreferredCurrency.symbol}${booking.transportationID.ticketCost}`;
        } else {
          const exchangedPrice =
          booking.transportationID.ticketCost * exchangeRate;
          return `${userPreferredCurrency.symbol}${exchangedPrice.toFixed(2)}`;
        }
      }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  console.log(booking);

  const [showPopup, setShowPopup] = useState(false);

  const handleBookNowClick = () => {
    setSelectedBooking(booking)
    setShowPopup(true);
  };

  const departureTime = new Date(booking.transportationID?.timeDeparture);
  const arrivalTime = new Date(departureTime.getTime() + booking.transportationID?.estimatedDuration * 60 * 1000);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toUpperCase();
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFormattedVehicleType = (type) => {
    switch (type?.toLowerCase()) {
      case 'bus':
        return 'SUPER DELUX AIR BUS';
      case 'microbus':
        return 'LUXURY MINI BUS';
      case 'car':
        return 'PREMIUM SEDAN';
      default:
        return type?.toUpperCase();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(booking.transportationID?._id);
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
  };


  return (
    <div >
      <div 
  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-transform transform hover:scale-105 cursor-pointer" 
  onClick={handleBookNowClick} // Function to handle card click
>
  <div className="flex items-center justify-between">
    <div className="flex flex-col items-start w-1/5">
      <span className="text-sm text-[#5D9297]">Departure</span>
      <span className="text-base font-semibold text-[#F88C33]">{booking.transportationID?.from.toUpperCase()}</span>
      <div className="flex items-center">
        <span className="text-sm font-semibold">{formatTime(departureTime)}</span>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center w-3/5 relative">
      <div className="absolute flex items-center justify-center bg-white px-2 text-xs text-[#5D9297] top-1">
        {`${Math.floor(booking.transportationID.estimatedDuration / 60)} hours and ${booking.transportationID.estimatedDuration % 60} minutes`}
      </div>
      <div className="absolute flex items-center justify-center bg-white px-2 text-base font-semibold text-[#1A3B47] -top-6">
        {formatDate(departureTime)}
      </div>
    </div>

    <div className="flex flex-col items-end w-1/5">
      <span className="text-sm text-[#5D9297] ">Arrival</span>
      <span className="text-base font-semibold text-[#F88C33]">{booking.transportationID?.to.toUpperCase()}</span>
      <span className="text-sm font-semibold whitespace-nowrap">{formatTime(arrivalTime)}</span>
    </div>
  </div>

  <div className="mt-4 flex justify-between items-center">
    <div className="text-lg text-center text-[#5D9297] font-semibold">
      {getFormattedVehicleType(booking.transportationID?.vehicleType)}
    </div>
    <div className="text-2xl font-bold text-[#1A3B47]">{formatPrice(booking.transportationID?.ticketCost)}</div>
  </div>
</div>


      {/* Popup Modal for Booking Details */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
  <DialogContent className="sm:max-w-[330px] bg-white rounded-lg shadow-lg p-4">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-[#1A3B47]">
        <div>Transportation Details</div>
        <div className="text-[#388A94] text-xl font-bold">
          {booking.transportationID?.from} to {booking.transportationID?.to}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Trip Code: <span className=" font-semibold">
            {booking._id.substring(0, 10) || "N/A"}
          </span>
        </div>
      </DialogTitle>
    </DialogHeader>

    {/* Main content */}
    <div className="border-t border-gray-200 pt-4 space-y-4">
      {/* Date */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-400">Departure Date</p>
        <p className="text-[#1A3B47] font-semibold text-right">
          {new Date(booking.transportationID?.timeDeparture).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )}
        </p>
      </div>

      {/* Time */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-400">Departure Time</p>
        <p className="text-[#1A3B47] font-semibold text-right">
          {new Date(booking.transportationID?.timeDeparture).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}
        </p>
      </div>

      {/* Tourist Information */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-400">Tourist Name</p>
        <div className="text-right">
          <p className="text-[#1A3B47] font-semibold">
            {tourist?.fname || "John"} {tourist?.lname || "Doe"}
          </p>
          <p className="text-[#1A3B47] text-xs">
            {tourist?.email || "john.doe@example.com"}
          </p>
        </div>
      </div>

      {/* Seats Booked */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-400">Seats Booked</p>
        <p className="text-[#1A3B47] font-semibold text-right">
          {booking.seatsBooked || "N/A"} Seats
        </p>
      </div>

      {/* Total Price */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-xl font-semibold text-gray-600">Total Cost</p>
        <p className="text-2xl font-bold text-[#388A94]">
          {formatPrice(booking.totalCost || 0)}
        </p>
      </div>

      {/* Payment Method */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Payment Method</p>
        <p className="text-[#1A3B47] font-semibold text-right">
          via {booking.paymentMethod === "creditCard" || booking.paymentMethod === "debitCard" ? "Credit Card" : "Wallet"}
        </p>
      </div>
    </div>

    {/* Footer */}
    <div className="border-t border-gray-200 pt-4 text-center">
  <p className="text-sm text-[#1A3B47] font-medium">
    Thank you for choosing this transportation!
  </p>
  <div className="mt-2">
    <p className="text-xs text-gray-500">
      We hope you had a great trip.
    </p>
  </div>
</div>

  </DialogContent>
</Dialog>

    </div>
  
  );
}

