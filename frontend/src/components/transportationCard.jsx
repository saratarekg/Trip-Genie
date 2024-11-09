import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TransportationCard({ 
  transportation, 
  userRole, 
  onEdit, 
  onDelete, 
  onBook,
  displayPrice 
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const departureTime = new Date(transportation.timeDeparture);
  const arrivalTime = new Date(departureTime.getTime() + transportation.estimatedDuration * 60 * 1000);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toUpperCase();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tripCode = Array.from({ length: 12 }, () => 
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
  ).join('');

  const getFormattedVehicleType = (type) => {
    switch (type.toLowerCase()) {
      case 'bus':
        return 'SUPER DELUX AIR BUS';
      case 'microbus':
        return 'LUXURY MINI BUS';
      case 'car':
        return 'PREMIUM SEDAN';
      default:
        return type.toUpperCase();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(transportation._id);
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
  };

  // Calculate the price including VAT (assuming 20% VAT)
  const vatRate = 0.20;
  const priceWithVAT = transportation.ticketCost * (1 + vatRate);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <span className="text-sm text-[#5D9297]">Departure</span>
          <span className="text-lg font-semibold text-[#F88C33]">{transportation.from.toUpperCase()}</span>
          {/* Departure Time */}
          <div className="flex items-center">
            <span className="text-sm font-semibold">{formatTime(departureTime)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center mx-4 relative w-[70%]">
          <div className="border-t-2 border-[#5D9297] w-full absolute top-1/2 -translate-y-1/2" />
          
          {/* Trip Code */}
          <div className="absolute flex items-center justify-center bg-white px-2 text-sm text-[#5D9297] top-1">
            {`${Math.floor(transportation.estimatedDuration / 60)} hours and ${transportation.estimatedDuration % 60} minutes`}
          </div>

          {/* Date Below the Code */}
          <div className="absolute flex items-center justify-center bg-white px-2 text-xl font-semibold text-[#F88C33] -top-6">
            {formatDate(departureTime)}
          </div>
          

          {/* <div className="absolute flex items-center justify-center bg-white px-2 text-sm text-[#5D9297] -top-6">
            {transportation._id}
          </div> */}

          <div className="flex justify-between w-full mt-2 relative">
            <div className="w-4 h-4 rounded-full border-2 border-[#388A94] bg-white translate-y-[-15%]" />
            <div className="w-4 h-4 rounded-full border-2 border-[#388A94] bg-white translate-y-[-15%]" />
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm text-[#5D9297]">Arrival</span>
          <span className="text-lg font-semibold text-[#F88C33]">{transportation.to.toUpperCase()}</span>
          <span className="text-sm font-semibold">{formatTime(arrivalTime)}</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex flex-col items-start">
          <span className="text-sm text-[#5D9297]">Remaining Seats</span>
          <span className="text-lg font-semibold text-[#F88C33]">{transportation.remainingSeats}</span>
        </div>
        <div className="text-lg text-center text-[#5D9297] font-semibold">
          {getFormattedVehicleType(transportation.vehicleType)}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-[#1A3B47]">{displayPrice(transportation.ticketCost)}</div>

          {/* Price label with VAT text */}
          {/* <div className="text-xs text-[#5D9297] mt-2 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            <span>Price includes VAT*</span>
          </div> */}

          {userRole === "tourist" && transportation.remainingSeats > 0 ? (
            <Button 
              onClick={() => onBook(transportation)} 
              className="bg-[#F88C33] text-white px-4 py-2 rounded hover:bg-orange-500 transition-colors"
            >
              Book Now
            </Button>
          ) : userRole === "advertiser" ? (
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={() => onEdit(transportation)}
                className="p-2 h-10 w-10 rounded-full bg-[#B5D3D1] hover:bg-[#5D9297] transition duration-300 ease-in-out mr-2"
              >
                <Edit className="h-4 w-4 text-[#1A3B47]" />
              </Button>
              <Button
                type="button"
                onClick={handleDeleteClick}
                className="p-2 h-10 w-10 rounded-full bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transportation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              The transportation has been deleted successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDeleteSuccess(false)} variant="default">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
