'use client'

import React, { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import Cookies from "js-cookie"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Select from "react-select"
import { useNavigate } from "react-router-dom"

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
  isBookingOpen: z.boolean(),
  pictures: z.array(z.string()).optional(),
})

export default function CreateActivity() {
  const {
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
      isBookingOpen: true,
      pictures: [],
    },
  })

  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    longitude: 31.1342,
    latitude: 29.9792,
  })
  const [showDialog, setShowDialog] = useState(false)
  const navigate = useNavigate()

  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [citiesLoading, setCitiesLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(
        "http://localhost:4000/api/getAllCategories"
      )
      setCategories(
        response.data.map((cat) => ({ value: cat._id, label: cat.name }))
      )
    }

    const fetchTags = async () => {
      const response = await axios.get("http://localhost:4000/api/getAllTags")
      setTags(
        response.data.map((tag) => ({ value: tag._id, label: tag.type }))
      )
    }

    fetchCategories()
    fetchTags()
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all')
      const data = await response.json()
      const sortedCountries = data.map(country => ({
        value: country.name.common,
        label: country.name.common
      })).sort((a, b) => a.label.localeCompare(b.label))
      setCountries(sortedCountries)
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchCities = async (country) => {
    setCitiesLoading(true)
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.msg || 'Failed to fetch cities')
      }

      const sortedCities = data.data.sort().map(city => ({
        value: city,
        label: city
      }))
      setCities(sortedCities)
    } catch (err) {
      if (err.status === 404) {
        setCities([])
      }
      console.error('Error fetching cities: ', err)
      setCities([])
    } finally {
      setCitiesLoading(false)
    }
  }

  const onSubmit = async (data) => {
    console.log("Submitted data:", data)
    setLoading(true)
    const token = Cookies.get("jwt")
    const role = Cookies.get("role") || "guest"

    const activityData = {
      ...data,
      timing: new Date(data.timing),
      duration: Number(data.duration),
      price: Number(data.price),
      specialDiscount: Number(data.specialDiscount),
      location: {
        ...data.location,
        coordinates: location,
      },
      category: data.category.map((cat) => cat.value),
      tags: data.tags.map((tag) => tag.value),
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/${role}/activities`,
        activityData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log("Created activity:", response.data)
      setShowDialog(true)
    } catch (error) {
      console.error("Failed to create activity:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const MapClick = () => {
    useMapEvents({
      click: (e) => {
        setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng })
      },
    })
    return null
  }

  const handleGoBack = () => {
    navigate("/activity")
  }

  const handleCreateNew = () => {
    window.location.reload()
  }

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption)
    setSelectedCity(null)
    setCities([])
    fetchCities(selectedOption.value)
  }

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption)
    setValue('location.address', `${selectedOption.value}, ${selectedCountry.value}`)
  }

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
                  options={countries}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  options={cities}
                  value={selectedCity}
                  onChange={handleCityChange}
                  isLoading={citiesLoading}
                  isDisabled={!selectedCountry || citiesLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
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
                          const dateValue = new Date(e.target.value)
                          field.onChange(dateValue)
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

              <div className="space-y-2">
                <Label>Categories</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
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
                    <Select
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

              <div className="flex items-center space-x-2">
                <Controller
                  name="isBookingOpen"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isBookingOpen"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isBookingOpen">Is Booking Open?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pictures">Pictures (URLs)</Label>
                <Controller
                  name="pictures"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="pictures"
                      value={field.value.join(", ")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(",").map((url) => url.trim())
                        )
                      }
                      placeholder="Enter picture URLs separated by commas"
                    />
                  )}
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

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Activity"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Created Successfully</DialogTitle>
            <DialogDescription>
              Your activity has been created. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoBack}>Go to All Activities</Button>
            <Button onClick={handleCreateNew}>Create New Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}