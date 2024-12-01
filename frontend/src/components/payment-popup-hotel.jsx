import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const PaymentPopup = ({
  isBookingConfirmationOpen,
  setIsBookingConfirmationOpen,
  selectedRoom,
  price,
  currencyCode,
  currencySymbol,
  checkinDate,
  checkoutDate,
  numberOfAdults,
  hotelName,
  stripeKey,
  hotelID,
  roomName,
  maxRooms = 10,
  onWalletPayment,
  onError,
  onSuccess,
  returnLocation,
}) => {
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [paymentType, setPaymentType] = useState("CreditCard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(Number(price));
  const [bookingPopupError, setBookingPopupError] = useState("");

  useEffect(() => {
    setTotalPrice(Number(price) * numberOfRooms);
  }, [numberOfRooms, price]);

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setBookingPopupError("");

    if (paymentType === "Wallet") {
      try {
        await onWalletPayment("Wallet", "10", "selectedDateStr", hotelID, roomName, checkinDate, checkoutDate, numberOfRooms, numberOfAdults,totalPrice);
        onSuccess({
          open: true,
          paymentMethod : "Wallet",
          totalPrice,
        });
      } catch (error) {
        setBookingPopupError(error.message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      const stripe = await loadStripe(stripeKey);
      if (!stripe) throw new Error("Stripe initialization failed");

      const payload = {
        hotelID,
        hotelName,
        checkinDate,
        checkoutDate,
        numberOfRooms,
        roomName,
        price: totalPrice, // Total price for all rooms
        numberOfAdults,
        paymentType,
        returnLocation,
        currency: currencyCode // Replace with a desired return location
      };

      const response = await fetch("http://localhost:4000/create-hotel-booking-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking session");
      }

      const { id: sessionId } = await response.json();
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }

      onSuccess();
    } catch (error) {
      setBookingPopupError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isBookingConfirmationOpen} onOpenChange={setIsBookingConfirmationOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Please confirm your room booking details.
          </DialogDescription>
        </DialogHeader>
        {selectedRoom && (
          <div className="mt-4 space-y-4">
            <p>
              <strong>Room:</strong> {roomName || selectedRoom.name}
            </p>
            <p>
              <strong>Price:</strong>{currencySymbol}{totalPrice.toFixed(2)} 
            </p>
            <p>
              <strong>Check-in Date:</strong> {checkinDate}
            </p>
            <p>
              <strong>Check-out Date:</strong> {checkoutDate}
            </p>
            <p>
              <strong>Number of Adults:</strong> {numberOfAdults}
            </p>
            <div className="space-y-2">
              <Label htmlFor="numberOfRooms">Number of Rooms</Label>
              <Select
                value={numberOfRooms.toString()}
                onValueChange={(value) => setNumberOfRooms(parseInt(value))}
              >
                <SelectTrigger id="numberOfRooms">
                  <SelectValue placeholder="Select number of rooms" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxRooms }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Payment Type</Label>
                <RadioGroup value={paymentType} onValueChange={setPaymentType} className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CreditCard" id="credit" />
                    <Label htmlFor="CreditCard">Credit Card/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Wallet" id="Wallet" />
                    <Label htmlFor="Wallet">Wallet</Label>
                  </div>
                </RadioGroup>
              </div>
              {bookingPopupError && (
                <div className="text-red-500 text-sm mt-2">{bookingPopupError}</div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => {setIsBookingConfirmationOpen(false), setBookingPopupError("")}}>Cancel</Button>
          <Button
            onClick={handleConfirmBooking}
            disabled={isProcessing}
            className="bg-[#1A3B47] hover:bg-[#1A3B47]/90 text-white"
          >
            {isProcessing ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPopup;
