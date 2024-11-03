import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a product name"),
  price: z.number().min(1, "Please enter a valid price"),
  description: z.string().min(1, "Please enter a description"),
  quantity: z.number().min(1, "Please enter a valid quantity"),
  currency: z.string().min(1, "Please select a currency"),
});

const CreateProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const navigate = useNavigate();
  const userRole = Cookies.get("role") || "guest";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      quantity: "",
      currency: "",
    },
  });

  useEffect(() => {
    const fetchSupportedCurrencies = async () => {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get(
          "http://localhost:4000/seller/currencies",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrencies(response.data);
      } catch (error) {
        console.error("Error fetching supported currencies:", error);
      }
    };

    fetchSupportedCurrencies();
  }, []);

  const handlePicturesUpload = (e) => {
    const files = e.target.files;
    if (files) {
      setPictures([...pictures, ...Array.from(files)]);
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
    formData.append("currency", data.currency);
    pictures.forEach((picture, index) => {
      formData.append("pictures", picture); // Automatically adds as binary
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
              <Label htmlFor="currency">Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    position="item-aligned"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency._id}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && (
                <p className="text-red-500 text-sm">
                  {errors.currency.message}
                </p>
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
