import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Creates a Zod schema for the form
 * @returns {import('zod').ZodObject}
 */
const createFormSchema = () => z.object({
  title: z.string().min(1, 'Please enter a title'),
  body: z.string().min(1, 'Please enter a description')
});

export default function FileComplaintForm({ closeForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      title: '',
      body: ''
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const token = Cookies.get('jwt');

    try {
      const response = await axios.post(
        `http://localhost:4000/tourist/complaint`,
        { ...data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setShowDialog(true);
      } else {
        throw new Error('Failed to file complaint.');
      }
    } catch (err) {
      setError('Failed to file complaint. Please try again.');
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
    <div className="flex justify-center items-start h-screen p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl space-y-6"
      >
        {/* Form Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-black-800">File a Complaint</h2>

        </div>

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            {...register('title')}
            className="border border-teal-300 rounded-xl p-3 w-full h-12 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            id="title"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('body')}
            className="border border-teal-300 rounded-xl p-3 w-full h-32 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            id="description"
          />
          {errors.body && <span className="text-red-500 text-sm">{errors.body.message}</span>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center space-x-4">
  <button
    type="submit"
    className="w-[900px] flex justify-center items-center bg-orange-500 text-white rounded-xl p-3 h-12 font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
    disabled={loading}
  >
    {loading ? 'Submitting...' : 'File Complaint'}
  </button>
  <Button
    onClick={closeForm}
    className="w-full flex justify-center items-center bg-gray-300 text-black rounded-xl p-3 h-12 font-semibold hover:bg-gray-400 focus:outline-none"
  >
    Close
  </Button>
</div>



        {/* Error Message */}
        {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
      </form>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-teal-600">
              Success!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your complaint was filed successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-4">
            <Button
              onClick={handleGoBack}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              Go to Home
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateNew}
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              File Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
