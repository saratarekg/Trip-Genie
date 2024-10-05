import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    XCircle,
    CheckCircle,
    ChevronLeft,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Globe,
    Accessibility,
    Star,
    Edit,
    Trash2,
    Mail,
    Phone,
    Award,
    Clock,
    Info,
  } from 'lucide-react';
  import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { role } from '@/pages/login';
// Form validation schema using zod
const formSchema = z.object({
  name: z.string().min(1, 'Please enter a product name'),
  picture: z.string().url('Please enter a valid URL for the picture').min(1, 'Picture URL is required'),
  price: z.number().min(1, 'Please enter a valid price'),
  description: z.string().min(1, 'Please enter a description'),
  quantity: z.number().min(1, 'Please enter a valid quantity'),
});

const CreateProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      picture: '',
      price: '',
      description: '',
      quantity: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const token = Cookies.get('jwt'); // Assuming the token is stored in cookies
    try {
      await axios.post(`http://localhost:4000/${userRole}/products`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Product created successfully!');
      <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
            Itinerary Deleted
          </DialogTitle>
          <DialogDescription>
            The itinerary has been successfully deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="default" onClick={() => navigate('/all-products')}>
            Back to All Itineraries
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Product</h2>

        {/* Success/Error Messages */}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700">Product Name</label>
          <input
            {...register('name')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
            id="name"
          />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        </div>

        {/* Picture URL */}
        <div>
          <label htmlFor="picture" className="block text-gray-700">Picture URL</label>
          <input
            {...register('picture')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
            id="picture"
          />
          {errors.picture && <span className="text-red-500">{errors.picture.message}</span>}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-gray-700">Price</label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
            id="price"
          />
          {errors.price && <span className="text-red-500">{errors.price.message}</span>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700">Description</label>
          <textarea
            {...register('description')}
            className="border border-gray-300 rounded-xl p-2 w-full h-24"
            id="description"
          />
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-gray-700">Quantity</label>
          <input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
            id="quantity"
          />
          {errors.quantity && <span className="text-red-500">{errors.quantity.message}</span>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl w-full hover:bg-orange-600 transition duration-200 h-12"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
  
    </div>
  );
};

export default CreateProductForm;
