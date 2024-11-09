"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import TransportationCard from "@/components/transportationCard";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parse, set } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  vehicleType: z.enum(["Bus", "Car", "Microbus"], {
    required_error: "Vehicle type is required",
  }),
  ticketCost: z.number().min(0, "Ticket cost must be a positive number"),
  timeDeparture: z.date(),
  estimatedDuration: z.number().min(0, "Duration must be a positive number"),
  remainingSeats: z
    .number()
    .int()
    .min(0, "Remaining seats must be a non-negative integer"),
});

const getMaxSeats = (vehicleType) => {
  switch (vehicleType) {
    case "Bus":
      return 50;
    case "Car":
      return 5;
    case "Microbus":
      return 15;
    default:
      return 0;
  }
};

export default function TransportationPage() {
  const [transportations, setTransportations] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState("all");
  const [selectedTo, setSelectedTo] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [selectedTransportation, setSelectedTransportation] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [showTransportationBookingDialog, setShowTransportationBookingDialog] = useState(false);
  const [showTransportationSuccessDialog, setShowTransportationSuccessDialog] = useState(false);
  const [rates, setRates] = useState({});
  const [userPreferredCurrency, setUserPreferredCurrency] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [filteredTransportations, setFilteredTransportations] = useState([]);
  const transportationsPerPage = 6;
  

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to: "",
      vehicleType: "Bus",
      ticketCost: 0,
      timeDeparture: new Date(),
      estimatedDuration: 0,
      remainingSeats: 0,
    },
  });

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role);
    fetchTransportations();
    fetchUserInfo();
    fetchRates();
  }, []);

  const fetchUserInfo = async () => {
    const role = Cookies.get("role") || "guest";
    setUserRole(role);

    if (role === "tourist") {
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
    }
  };

  const fetchRates = async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates");
      setRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching rates:", error);
    }
  };

  const fetchTransportations = async () => {
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");
      const response = await axios.get(
        `http://localhost:4000/${role}/transportations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransportations(response.data);
      setFilteredTransportations(response.data);
      setFromLocations([...new Set(response.data.map((t) => t.from))]);
      setToLocations([...new Set(response.data.map((t) => t.to))]);
    } catch (error) {
      console.error("Error fetching transportations:", error);
    }
  };

  const handleClear = useCallback(() => {
setSearchTerm("");
setSelectedFrom("all");
setSelectedTo("all");
setSelectedDate(null);

  }, []);


  const handleSearch = useCallback(() => {
    const termsCar = "PREMIUM SEDAN";
    const termsBus = "SUPER DELUX AIR BUS";
    const termsMicrobus = "LUXURY MINI BUS";
    
    const filtered = transportations.filter((t) => {
      const matchesSearchTerm =
        t.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.vehicleType.toLowerCase() === 'car' && termsCar.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.vehicleType.toLowerCase() === 'bus' && termsBus.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.vehicleType.toLowerCase() === 'microbus' && termsMicrobus.toLowerCase().includes(searchTerm.toLowerCase()));
  
      const matchesFrom = selectedFrom === "all" || t.from === selectedFrom;
      const matchesTo = selectedTo === "all" || t.to === selectedTo;
  
      const matchesDate = !selectedDate ||
        format(new Date(t.timeDeparture), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  
      return matchesSearchTerm && matchesFrom && matchesTo && matchesDate;
    });
    // You might want to do something with the filtered results here
    console.log(filtered);
    setFilteredTransportations(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedFrom, selectedTo, selectedDate, transportations]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch, searchTerm, selectedFrom, selectedTo, selectedDate]);

  const displayPrice = (priceUSD) => {
    if (!userPreferredCurrency) return `$${priceUSD}`;
    const rate = rates[userPreferredCurrency.code];
    return `${userPreferredCurrency.symbol}${(priceUSD * rate).toFixed(2)}`;
  };


  const handleTransportationBooking = async () => {
    if (!selectedTransportation) return;

    setIsBooking(true);
    setBookingError("");
    try {
      const token = Cookies.get("jwt");
      const response = await axios.post(
        "http://localhost:4000/tourist/book-transportation",
        {
          transportationID: selectedTransportation._id,
          seatsToBook: seatsToBook,
          paymentMethod: paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === "Transportation Booking successful") {
        setShowTransportationSuccessDialog(true);
        const updatedTransportations = transportations.map((t) =>
          t._id === selectedTransportation._id
            ? { ...t, remainingSeats: response.data.remainingSeats }
            : t
        );
        setTransportations(updatedTransportations);
        setFilteredTransportations(updatedTransportations);
      } else {
        setBookingError(
          response.data.message || "Failed to book transportation"
        );
      }
    } catch (error) {
      console.error("Error booking transportation:", error);
      setBookingError(
        error.response?.data?.message || "An error occurred while booking"
      );
    } finally {
      setIsBooking(false);
      setShowTransportationBookingDialog(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAdd = async (data) => {
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");
      data.isStandAlone = true;

      const response = await axios.post(`http://localhost:4000/${role}/transportations`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTransportations([...transportations, response.data]);
      setFilteredTransportations([...filteredTransportations, response.data]);
      
      form.reset({
        from: "",
        to: "",
        vehicleType: "Bus",
        ticketCost: 0,
        timeDeparture: new Date(),
        estimatedDuration: 0,
        remainingSeats: 0,
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding transportation:", error);
    }
  };

  const handleEdit = async (data) => {
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");

      const response = await axios.put(
        `http://localhost:4000/${role}/transportations/${editingTransportation._id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const updatedTransportations = transportations.map(t => 
        t._id === editingTransportation._id ? response.data : t
      );
      setTransportations(updatedTransportations);
      setFilteredTransportations(updatedTransportations);
      form.reset({
        from: "",
        to: "",
        vehicleType: "Bus",  // or other default values
        ticketCost: 0,
        timeDeparture: new Date(),
        estimatedDuration: 0,
        remainingSeats: 0,
      });
      setEditingTransportation(null);
    } catch (error) {
      console.error("Error editing transportation:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");
      await axios.delete(
        `http://localhost:4000/${role}/transportations/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedTransportations = transportations.filter(t => t._id !== id);
      setTransportations(updatedTransportations);
      setFilteredTransportations(updatedTransportations);
    } catch (error) {
      console.error("Error deleting transportation:", error);
    }
  };

  const sortedTransportations = [...filteredTransportations].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastTransportation = currentPage * transportationsPerPage;
  const indexOfFirstTransportation = indexOfLastTransportation - transportationsPerPage;
  const currentTransportations = sortedTransportations.slice(
    indexOfFirstTransportation,
    indexOfLastTransportation
  );

  const handleEditClick = (transportation) => {
    setEditingTransportation(transportation);
    form.reset({
      ...transportation,
      timeDeparture: new Date(transportation.timeDeparture),
    });
  };

  const DateTimePicker = ({ field }) => {
    const [date, setDate] = useState(field.value);
    const [time, setTime] = useState(format(field.value, "HH:mm"));

    const handleDateChange = (newDate) => {
      setDate(newDate);
      updateDateTime(newDate, time);
    };

    const handleTimeChange = (e) => {
      setTime(e.target.value);
      updateDateTime(date, e.target.value);
    };

    const updateDateTime = (newDate, newTime) => {
      const [hours, minutes] = newTime.split(":");
      const updatedDate = set(newDate, {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
      });
      field.onChange(updatedDate);
    };

    return (
      <div className="flex flex-col space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-[#1A3B47]">Transportation Management</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <Input
            type="text"
            placeholder="Search transportations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={selectedFrom} onValueChange={setSelectedFrom}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {fromLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTo} onValueChange={setSelectedTo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {toLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  handleSearch();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* <Button onClick={handleSearch} className="bg-[#5D9297]">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button> */}
<Button 
  onClick={handleClear} 
  className="bg-white text-[#5D9297] hover:text-black !important"
>            Clear
          </Button>
          {userRole === "advertiser" && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1A3B47]">
                  <Plus className="mr-2 h-4 w-4" /> Add Transportation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Transportation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From</FormLabel>
                          <FormControl>
                            <Input placeholder="From location" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To</FormLabel>
                          <FormControl>
                            <Input placeholder="To location" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Type</FormLabel>
                          <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("remainingSeats", getMaxSeats(value));
                      }}
                      defaultValue={field.value}
                    >                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bus">Bus</SelectItem>
                              <SelectItem value="Car">Car</SelectItem>
                              <SelectItem value="Microbus">Microbus</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ticketCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Cost</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ticket cost"
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
  control={form.control}
  name="timeDeparture"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Departure Time</FormLabel>
      <FormControl>
        <DateTimePicker
          field={field}
          disablePastminDate={new Date().setDate(new Date().getDate() + 1)} // Setting minimum date to tomorrow
        />
      </FormControl>
    </FormItem>
  )}
/>

                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Estimated duration"
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="remainingSeats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remaining Seats</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Remaining seats"
                              {...field}
                              onChange={(e) => {
                                const value = +e.target.value;
                                const maxSeats = getMaxSeats(form.getValues("vehicleType"));
                                field.onChange(Math.min(value, maxSeats));
                              }}
                              max={getMaxSeats(form.getValues("vehicleType"))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="bg-[#1A3B47]">Add Transportation</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {currentTransportations.map((transportation) => (
    <div key={transportation._id}>
      <TransportationCard
        transportation={transportation}
        userRole={userRole}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onBook={() => {
          setSelectedTransportation(transportation);
          setShowTransportationBookingDialog(true);
        }}
        displayPrice={displayPrice}
      />

      {/* Dialog for editing transportation */}
      <Dialog
        open={editingTransportation === transportation}
        onOpenChange={(open) => {
          if (!open) handleEditClose();
        }}
      >
       
        {editingTransportation === transportation && (
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Transportation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-8">
                <FormField control={form.control} name="from" render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input placeholder="From location" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="to" render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="To location" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("remainingSeats", getMaxSeats(value));
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Bus">Bus</SelectItem>
                                <SelectItem value="Car">Car</SelectItem>
                                <SelectItem value="Microbus">Microbus</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                <FormField control={form.control} name="ticketCost" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Cost</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ticket cost" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                    </FormControl>
                  </FormItem>
                )} />
              <FormField control={form.control} name="timeDeparture" render={({ field }) => (
  <FormItem>
    <FormLabel>Departure Time</FormLabel>
    <FormControl>
      <DateTimePicker
        field={field}
        disablePast
        minDate={new Date().setDate(new Date().getDate() + 1)} // Setting minimum date to tomorrow
      />
    </FormControl>
  </FormItem>
)} />

                <FormField control={form.control} name="estimatedDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Estimated duration" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="remainingSeats"
                  render={({ field }) => {
                    const maxSeats = getMaxSeats(form.getValues("vehicleType"));
                    const value = +field.value;

                    // Check if the value exceeds maxSeats
                    const isExceedingMax = value > maxSeats;

                    return (
                      <FormItem>
                        <FormLabel>Remaining Seats</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Remaining seats"
                            {...field}
                            onChange={(e) => {
                              const inputValue = +e.target.value;
                              // Update the value only if it's less than or equal to maxSeats
                              if (inputValue <= maxSeats) {
                                field.onChange(inputValue);
                              } else {
                                // Update to maxSeats value if the user tries to exceed it
                                field.onChange(maxSeats);
                              }
                            }}
                            max={maxSeats}
                          />
                        </FormControl>
                        {isExceedingMax && (
                          <p className="text-red-500 text-sm mt-1">
                            Max {maxSeats} seats allowed.
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />


                <Button type="submit" className="bg-[#1A3B47]">Update Transportation</Button>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  ))}
</div>


        <div className="mt-6 flex justify-center items-center space-x-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="border-[#388A94] text-[#388A94] hover:bg-[#388A94] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {sortedTransportations.length > 0 ? (
  <span className="text-[#1A3B47]">
    Page {currentPage} of {Math.ceil(sortedTransportations.length / transportationsPerPage)}
  </span>
) : (
  <span className="text-[#1A3B47]">No transportations available</span>
)}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(sortedTransportations.length / transportationsPerPage)}
            variant="outline"
            className="border-[#388A94] text-[#388A94] hover:bg-[#388A94] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      <Dialog
        open={showTransportationBookingDialog}
        onOpenChange={setShowTransportationBookingDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Transportation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seats" className="text-right">
                Seats
              </Label>
              <Input
                id="seats"
                type="number"
                className="col-span-3"
                value={seatsToBook}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setSeatsToBook(
                    Math.max(
                      0,
                      Math.min(
                        value,
                        selectedTransportation?.remainingSeats || 0
                      )
                    )
                  );
                }}
                min="0"
                max={selectedTransportation?.remainingSeats}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total Price</Label>
              <div className="col-span-3">
                {displayPrice(seatsToBook * selectedTransportation?.ticketCost)}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Payment</Label>
              <RadioGroup
                defaultValue="creditCard"
                className="col-span-3"
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creditCard" id="creditCard" />
                  <Label htmlFor="creditCard">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debitCard" id="debitCard" />
                  <Label htmlFor="debitCard">Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet">Wallet</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowTransportationBookingDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleTransportationBooking} disabled={isBooking}>
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <Dialog
          open={showTransportationSuccessDialog}
          onOpenChange={setShowTransportationSuccessDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  Transportation Booked Successfully
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                You have successfully booked {seatsToBook} seat(s) for the
                transportation from {selectedTransportation?.from} to{" "}
                {selectedTransportation?.to}.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowTransportationSuccessDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!(bookingError==="")}
          onOpenChange={setBookingError}
        >
          <DialogContent>
            <DialogHeader>
            <div className="py-4">
            {bookingError}
            </div>
              <DialogTitle>
                <div className="flex items-center">
                  <XCircle className="w-6 h-6 text-red-500 mr-2" />
                  Failed to book transportation
                </div>
              </DialogTitle>
            </DialogHeader>
           
            <DialogFooter>
              <Button onClick={() => setBookingError("")}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}