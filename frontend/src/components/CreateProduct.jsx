import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a product name"),
  price: z.number().min(1, "Please enter a valid price"),
  description: z.string().min(1, "Please enter a description"),
  quantity: z.number().min(1, "Please enter a valid quantity"),
});

const CreateProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [pictures, setPictures] = useState([]);
  const navigate = useNavigate();
  const userRole = Cookies.get("role") || "guest";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      quantity: "",
    },
  });

  const handlePicturesUpload = (e) => {
    const files = e.target.files; // This is a FileList
    if (files) {
      const readers = []; // To keep track of all FileReader promises
      const newPictures = []; // Array to store base64 strings

      // Loop over each file
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        readers.push(
          new Promise((resolve) => {
            reader.onloadend = () => {
              newPictures.push(reader.result); // Store base64 image
              resolve();
            };
            reader.readAsDataURL(file);
          })
        );
      });

      // Once all FileReaders are done, update state
      Promise.all(readers).then(() => {
        setPictures([...pictures, ...newPictures]);
      });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    formData.append("quantity", data.quantity);
    pictures.forEach((picture) => {
      formData.append("pictures", picture);
    });

    const token = Cookies.get("jwt");
    try {
      const response = await axios.post(
        `http://localhost:4000/${userRole}/products`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Server response:", response.data);
      setSuccess("Product created successfully!");
      setShowDialog(true);
    } catch (err) {
      setError("Failed to create product. Please try again.");
      console.error(
        "Error creating product:",
        err.response ? err.response.data : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setShowDialog(false);
    navigate("/all-products");
  };

  const handleCreateNew = () => {
    setShowDialog(false);
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              Create Product
            </h2>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
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
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              The Product was created successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoBack}>Go to all products</Button>
            <Button variant="outline" onClick={handleCreateNew}>
              Create Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProductForm;
