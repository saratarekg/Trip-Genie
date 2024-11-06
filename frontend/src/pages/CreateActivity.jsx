"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import Cookies from "js-cookie";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

const vehicleTypes = ["bus", "car", "microbus"];

const getMaxSeats = (vehicleType) => {
  switch (vehicleType) {
    case "bus":
      return 50;
    case "car":
      return 5;
    case "microbus":
      return 15;
    default:
      return 0;
  }
};

const transportationSchema = z.object({
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  vehicleType: z.enum(vehicleTypes),
  ticketCost: z.number().positive("Ticket cost must be positive"),
  timeDeparture: z.string().min(1, "Departure time is required"),
  estimatedDuration: z.number().positive("Duration must be positive"),
  remainingSeats: z.number().int().positive("Remaining seats must be positive").refine((val, ctx) => {
    const maxSeats = 100 ; // Assuming max seats is 100
    return val <= maxSeats;
  }, {
    message: "Remaining seats must not exceed the maximum for the selected vehicle type",
  }),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    coordinates: z.object({
      longitude: z.number(),
      latitude: z.number(),
    }),
  }),
  duration: z.number().int().positive("Duration must be a positive integer"),
  timing: z.date().refine((date) => date > new Date(), {
    message: "Timing must be a future date",
  }),
  price: z.number().int().positive("Price must be a positive integer"),
  currency: z.string().min(1, "Please select a currency"),
  category: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .nonempty("At least one category is required"),
  tags: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .nonempty("At least one tag is required"),
  specialDiscount: z
    .number()
    .int()
    .nonnegative("Discount must be a non-negative integer"),
  pictures: z.array(z.string()).optional(),
  transportations: z.array(z.string()).optional(),
});

export default function CreateActivity() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      location: {
        address: "",
        coordinates: { longitude: 0, latitude: 0 },
      },
      category: [],
      tags: [],
      pictures: [],
      transportations: [],
    },
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({
    longitude: 31.1342,
    latitude: 29.9792,
  });
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [pictures, setPictures] = useState([]);

  const [transportations, setTransportations] = useState([]);
  const [showTransportationForm, setShowTransportationForm] = useState(false);
  const [editingTransportationIndex, setEditingTransportationIndex] = useState(null);

  const {
    register: registerTransportation,
    handleSubmit: handleSubmitTransportation,
    reset: resetTransportation,
    setValue: setTransportationValue,
    watch: watchTransportation,
    formState: { errors: transportationErrors },
  } = useForm({
    resolver: zodResolver(transportationSchema),
  });

  const selectedVehicleType = watchTransportation("vehicleType");

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(
        "http://localhost:4000/api/getAllCategories"
      );
      setCategories(
        response.data.map((cat) => ({ value: cat._id, label: cat.name }))
      );
    };

    const fetchTags = async () => {
      const response = await axios.get("http://localhost:4000/api/getAllTags");
      setTags(
        response.data.map((tag) => ({ value: tag._id, label: tag.type }))
      );
    };

    fetchCategories();
    fetchTags();
    fetchCurrencies();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      const sortedCountries = data
        .map((country) => ({
          value: country.name.common,
          label: country.name.common,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handlePicturesUpload = (e) => {
    const files = e.target.files;
    if (files) {
      setPictures([...pictures, ...Array.from(files)]);
    }
  };

  const fetchCities = async (country) => {
    setCitiesLoading(true);
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/cities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg || "Failed to fetch cities");
      }

      const sortedCities = data.data.sort().map((city) => ({
        value: city,
        label: city,
      }));
      setCities(sortedCities);
    } catch (err) {
      if (err.status === 404) {
        setCities([]);
      }
      console.error("Error fetching cities: ", err);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/advertiser/currencies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrencies(response.data);
    } catch (err) {
      console.error("Error fetching currencies:", err.message);
    }
  };

  const onSubmitTransportation = async (data) => {
    try {
      if (!data.vehicleType) {
        throw new Error("Please select a vehicle type");
      }
      const token = Cookies.get("jwt");
      let response;
      if (editingTransportationIndex !== null) {
        // Update existing transportation
        response = await axios.put(
          `http://localhost:4000/advertiser/transportations/${transportations[editingTransportationIndex]._id}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedTransportations = [...transportations];
        updatedTransportations[editingTransportationIndex] = response.data;
        setTransportations(updatedTransportations);
      } else {
        // Create new transportation
        response = await axios.post(
          "http://localhost:4000/advertiser/transportations",
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransportations((prevTransportations) => [...prevTransportations, response.data]);
      }
      setShowTransportationForm(false);
      resetTransportation();
      setEditingTransportationIndex(null);
    } catch (error) {
      console.error("Failed to create/update transportation:", error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const token = Cookies.get("jwt");
    const role = Cookies.get("role") || "guest";

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("timing", data.timing.toISOString());
    formData.append("duration", data.duration);
    formData.append("price", data.price);
    formData.append("specialDiscount", data.specialDiscount);
    formData.append("currency", data.currency);
    formData.append("location[address]", data.location.address);
    formData.append("location[coordinates][longitude]", location.longitude);
    formData.append("location[coordinates][latitude]", location.latitude);

    data.category.forEach((cat) => formData.append("category[]", cat.value));
    data.tags.forEach((tag) => formData.append("tags[]", tag.value));

    pictures.forEach((picture, index) => {
      formData.append("pictures", picture);
    });

    // Append transportation IDs
    transportations.forEach((transport) => {
      formData.append("transportations[]", transport._id);
    });

    try {
      const response = await axios.post(
        `http://localhost:4000/${role}/activities`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Created activity:", response.data);
      setShowDialog(true);
    } catch (error) {
      console.error("Failed to create activity:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setSelectedCity(null);
    setCities([]);
    fetchCities(selectedOption.value);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setValue(
      "location.address",
      `${selectedOption.value}, ${selectedCountry.value}`
    );
  };

  const handleGoBack = () => {
    navigate("/activity");
  };

  const handleCreateNew = () => {
    window.location.reload();
  };

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });
    return null;
  };

  const handleEditTransportation = (index) => {
    const transportation = transportations[index];
    Object.keys(transportation).forEach((key) => {
      setTransportationValue(key, transportation[key]);
    });
    setEditingTransportationIndex(index);
    setShowTransportationForm(true);
  };

  const handleDeleteTransportation = async (index) => {
    try {
      const token = Cookies.get("jwt");
      await axios.delete(
        `http://localhost:4000/advertiser/transportations/${transportations[index]._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedTransportations = transportations.filter((_, i) => i !== index);
      setTransportations(updatedTransportations);
    } catch (error) {
      console.error("Failed to delete transportation:", error);
    }
  };

  return (
    <>
      <div className="pt-[100px] pb-[40px]">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create New Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="name" {...field} />}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="description" {...field} />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={(value) => handleCountryChange({ value, label: value })}
                  value={selectedCountry?.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  onValueChange={(value) => handleCityChange({ value, label: value })
                  }
                  value={selectedCity?.value}
                  disabled={!selectedCountry || citiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        id="duration"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timing">Timing</Label>
                  <Controller
                    name="timing"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="datetime-local"
                        id="timing"
                        value={
                          field.value
                            ? field.value.toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = new Date(e.target.value);
                          field.onChange(dateValue);
                        }}
                      />
                    )}
                  />
                  {errors.timing && (
                    <p className="text-red-500 text-sm">
                      {errors.timing.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        id="price"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialDiscount">Special Discount (%)</Label>
                  <Controller
                    name="specialDiscount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        id="specialDiscount"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  {errors.specialDiscount && (
                    <p className="text-red-500 text-sm">
                      {errors.specialDiscount.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Currency </Label>
                <Select onValueChange={(value) => setValue("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency._id} value={currency._id}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <span className="text-red-500">
                    {errors.currency.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      options={categories}
                      isMulti
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      options={tags}
                      isMulti
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.tags && (
                  <p className="text-red-500 text-sm">{errors.tags.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pictures">Pictures</Label>
                <Input
                  id="pictures"
                  type="file"
                  multiple
                  onChange={handlePicturesUpload}
                />
              </div>

              <div className="space-y-2">
                <Label>Location (click to set)</Label>
                <div className="h-64 w-full rounded-md overflow-hidden">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    <MapClick />
                    <Marker
                      position={[location.latitude, location.longitude]}
                    />
                  </MapContainer>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transportation Options</Label>
                {transportations.map((transport, index) => (
                  <div key={index} className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <p>From: {transport.from}</p>
                      <p>To: {transport.to}</p>
                      <p>Vehicle: {transport.vehicleType}</p>
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => handleEditTransportation(index)}
                        className="bg-[#388A94] hover:bg-[#2c6d75] text-white mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDeleteTransportation(index)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => setShowTransportationForm(true)}
                  className="bg-[#388A94] hover:bg-[#2c6d75] text-white w-full mt-2"
                >
                  Add Transportation
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#388A94] hover:bg-[#2c6d75] text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Activity"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTransportationForm} onOpenChange={setShowTransportationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransportationIndex !== null ? "Edit Transportation" : "Add Transportation"}</DialogTitle>
            <DialogDescription>
              Please fill in the details for the transportation option.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTransportation(onSubmitTransportation)} className="space-y-4">
            <div>
              <Label htmlFor="from">From</Label>
              <Input {...registerTransportation("from")} />
              {transportationErrors.from && <p className="text-red-500">{transportationErrors.from.message}</p>}
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input {...registerTransportation("to")} />
              {transportationErrors.to && <p className="text-red-500">{transportationErrors.to.message}</p>}
            </div>
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select onValueChange={(value) => setTransportationValue("vehicleType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {transportationErrors.vehicleType && <p className="text-red-500">{transportationErrors.vehicleType.message}</p>}
            </div>
            <div>
              <Label htmlFor="ticketCost">Ticket Cost</Label>
              <Input type="number" step="0.01" {...registerTransportation("ticketCost", { valueAsNumber: true })} />
              {transportationErrors.ticketCost && <p className="text-red-500">{transportationErrors.ticketCost.message}</p>}
            </div>
            <div>
              <Label htmlFor="timeDeparture">Departure Time</Label>
              <Input type="datetime-local" {...registerTransportation("timeDeparture")} />
              {transportationErrors.timeDeparture && <p className="text-red-500">{transportationErrors.timeDeparture.message}</p>}
            </div>
            <div>
              <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
              <Input type="number" step="0.1" {...registerTransportation("estimatedDuration", { valueAsNumber: true })} />
              {transportationErrors.estimatedDuration && <p className="text-red-500">{transportationErrors.estimatedDuration.message}</p>}
            </div>
            <div>
              <Label htmlFor="remainingSeats">Remaining Seats</Label>
              <Input 
                type="number" 
                {...registerTransportation("remainingSeats", { valueAsNumber: true })} 
                max={getMaxSeats(selectedVehicleType)}
              />
              {transportationErrors.remainingSeats && <p className="text-red-500">{transportationErrors.remainingSeats.message}</p>}
            </div>
            <Button type="submit" className="bg-[#388A94] hover:bg-[#2c6d75] text-white">
              {editingTransportationIndex !== null ? "Update Transportation" : "Add Transportation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Created Successfully</DialogTitle>
            <DialogDescription>
              Your activity has been created. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoBack} className="bg-[#388A94] hover:bg-[#2c6d75] text-white">Go to All Activities</Button>
            <Button variant="outline" onClick={handleCreateNew}>
              Create New Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}