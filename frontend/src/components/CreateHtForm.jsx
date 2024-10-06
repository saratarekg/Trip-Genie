import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Form validation schema using zod
const formSchema = z.object({
  type: z.string().min(1, 'Please enter a type'),
  period: z.string().min(1, 'Please enter a period'),
});

export default function CreateHtForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      period: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const token = Cookies.get('jwt');

    try {
      const response = await fetch(`http://localhost:4000/tourism-governor/historical-tag`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowDialog(true);
      } else {
        throw new Error('Failed to create historical tag.');
      }
    } catch (err) {
      setError('Failed to create historical tag. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setShowDialog(false);
    navigate('/');
  };

  const handleCreateNew = () => {
    setShowDialog(false);
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Historical Tag</h2>

        <div>
          <label htmlFor="type" className="block text-gray-700 mb-2">Type *</label>
          <input
            {...register('type')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="type"
          />
          {errors.type && <span className="text-red-500">{errors.type.message}</span>}
        </div>

        <div>
          <label htmlFor="period" className="block text-gray-700 mb-2">Period *</label>
          <input
            {...register('period')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="period"
          />
          {errors.period && <span className="text-red-500">{errors.period.message}</span>}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white rounded-xl p-2 h-12 mt-4"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Historical Tag'}
        </button>

        {error && <div className="text-red-500 mb-4">{error}</div>}
      </form>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Success!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              The historical tag was created successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-4">
            <Button colorScheme="blue" onClick={handleGoBack}>
              Go to All Tags
            </Button>
            <Button variant="outline" onClick={handleCreateNew}>
              Create Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
