import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const PaymentPopup = ({
  isOpen,
  onClose,
  title,
  items,
  onWalletPayment,
  stripeKey,
  onConfirm,
  initialTickets = 1,
  maxTickets = 15,
  priceOne,
  currency,
  returnLoc,
  symbol,
  error,
  availableDates,
  selectedItineraryDate,
  setError,
}) => {
  const formatDate = (date) => {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  // State to keep the date as a string for both display and selection
  const [formattedDate, setFormattedDate] = useState(
    selectedItineraryDate ? formatDate(selectedItineraryDate) : ""
  );

  const [paymentType, setPaymentType] = useState("CreditCard");
  const [numberOfTickets, setNumberOfTickets] = useState(initialTickets);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(Number(priceOne));

  useEffect(() => {
    setTotalPrice(Number(priceOne) * numberOfTickets);
  }, [numberOfTickets, priceOne]);

  useEffect(() => {
    if (selectedItineraryDate) {
      setFormattedDate(formatDate(selectedItineraryDate));
    }
  }, [selectedItineraryDate]);

  const handleConfirm = async () => {

    setIsProcessing(true);
    
    // Convert the formattedDate string back to a Date object
    const selectedDate = new Date(formattedDate.split("-").reverse().join("-")); // Convert to Date object
   
    if (paymentType === "Wallet") {
      onWalletPayment(paymentType, numberOfTickets, selectedDate); // Pass the Date object here
    } else {
      try {
        const stripe = await loadStripe(stripeKey);
        if (!stripe) throw new Error("Stripe failed to initialize");
  
        const response = await fetch("http://localhost:4000/create-booking-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              product: { name: item.name },
              quantity: numberOfTickets,
              totalPrice: item.price / 100, // divide by 100 again
            })),
            currency: currency.toLowerCase(),
            returnLocation: returnLoc,
            quantity: numberOfTickets,
            selectedDate: selectedDate.toISOString(), // Pass the Date object as ISO string
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to create checkout session: ${errorData.error || response.statusText}`
          );
        }
  
        const { id: sessionId } = await response.json();
        const result = await stripe.redirectToCheckout({ sessionId });
  
        if (result.error) {
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.error("Error in Stripe checkout:", error);
      }
    }
    
    setIsProcessing(false);
    onConfirm(paymentType, numberOfTickets, selectedDate); // Pass the Date object here
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {availableDates && availableDates.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dates" className="text-right">
                Select Date
              </Label>
              <Select
                id="dates"
                value={formattedDate} // Use the formatted string date for display and selection
                onValueChange={(value) => {
                  setFormattedDate(value); // Directly update the formatted date string
                }}
                className="col-span-3"
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue value={formattedDate} placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(({ date, _id }) => (
                    <SelectItem key={_id} value={formatDate(date)}>
                      {formatDate(date)} {/* Display formatted date */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tickets" className="text-right">
              Tickets
            </Label>
            <Input
              id="tickets"
              type="number"
              value={numberOfTickets}
              onChange={(e) =>
                setNumberOfTickets(Math.min(maxTickets, Math.max(1, parseInt(e.target.value))))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Price</Label>
            <div className="col-span-3 font-medium">
              {symbol}
              {totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex flex-col gap-4 py-4">
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

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setError(""); }}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing} className="w-full sm:w-auto bg-[#1A3B47] hover:bg-[#1A3B47]/90 text-white">
            {isProcessing ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPopup;
