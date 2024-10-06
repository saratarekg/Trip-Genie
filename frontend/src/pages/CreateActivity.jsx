import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Select from "react-select";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDropzone } from "react-dropzone";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  duration: z.number().min(1, { message: "Duration is required" }),
  timing: z.string().min(1, { message: "Date is required" }),
  price: z.number().min(1, { message: "Price is required" }),
  category: z.object({
    value: z.string(),
    label: z.string(),
  }),
  tags: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  ),
  specialDiscount: z.number().min(0).optional(),
  isBookingOpen: z.boolean(),
  pictures: z.array(z.string()).optional(),
});

export default function CreateActivity() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [latLng, setLatLng] = useState({ lat: 30.0444, lng: 31.2357 });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Fetch categories
    axios
      .get("http://localhost:4000/api/getAllCategories")
      .then((res) =>
        setCategories(
          res.data.map((category) => ({
            value: category.id,
            label: category.name,
          }))
        )
      )
      .catch((err) => console.error("Failed to fetch categories:", err));

    // Fetch tags (fix the mapping to suit backend response)
    axios
      .get("http://localhost:4000/api/getAllTypes")
      .then((res) =>
        setTags(res.data.map((tag) => ({ value: tag, label: tag })))
      )
      .catch((err) => console.error("Failed to fetch tags:", err));
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLatLng(e.latlng);
        setValue("coordinates", e.latlng);
      },
    });
    return null;
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*", // Ensure the file type is correctly set for images
    onDrop: (acceptedFiles) => {
      const files = acceptedFiles.map((file) => URL.createObjectURL(file));
      setUploadedFiles(files);
      setValue("pictures", files);
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const token = Cookies.get("jwt");

    try {
      const response = await axios.post(
        `http://localhost:4000/advertiser/activities`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Activity created successfully!");
      console.log("Created activity:", response.data);

      setTimeout(() => {
        navigate("/all-activities");
      }, 2000);
    } catch (err) {
      setError("Failed to create activity. Please try again.");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create New Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {loading && <p className="text-orange-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Cairo, Egypt"
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            {/* Map */}
            <div className="space-y-2">
              <Label>Location (click to set)</Label>
              <div className="h-64 w-full rounded-md overflow-hidden">
                <MapContainer
                  center={latLng}
                  zoom={13}
                  style={{
                    height: "100%",
                    width: "100%",
                    zIndex: 0,
                    position: "relative",
                  }} 
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={latLng} />
                  <MapClickHandler />
                </MapContainer>
              </div>
              {errors.coordinates && (
                <p className="text-red-500 text-sm">
                  {errors.coordinates.message}
                </p>
              )}
            </div>

            {/* Duration and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input type="number" id="duration" {...register("duration")} />
                {errors.duration && (
                  <p className="text-red-500 text-sm">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timing">Date</Label>
                <Input type="date" id="timing" {...register("timing")} />
                {errors.timing && (
                  <p className="text-red-500 text-sm">
                    {errors.timing.message}
                  </p>
                )}
              </div>
            </div>

            {/* Price and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" {...register("price")} />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialDiscount">Special Discount</Label>
                <Input
                  type="number"
                  id="specialDiscount"
                  {...register("specialDiscount")}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={categories}
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

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={tags}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                )}
              />
              {errors.tags && (
                <p className="text-red-500 text-sm">{errors.tags.message}</p>
              )}
            </div>

            {/* Booking Open */}
            <div className="space-y-2">
              <Label>
                <Checkbox {...register("isBookingOpen")} />
                Booking Open
              </Label>
            </div>

            {/* Dropzone */}
            <div className="space-y-2">
              <Label>Pictures</Label>
              <div
                {...getRootProps({
                  className:
                    "border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-orange-500 transition-colors",
                })}
              >
                <input {...getInputProps()} />
                <p>Drag & drop some files here, or click to select files</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {uploadedFiles.map((file, index) => (
                    <img
                      key={index}
                      src={file}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? "Submitting..." : "Create Activity"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
