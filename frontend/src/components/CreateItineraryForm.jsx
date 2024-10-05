import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  language: z.string().min(1, 'Language is required'),
  price: z.number().min(1, 'Price is required'),
  pickUpLocation: z.string().min(1, 'Pick-up location is required'),
  dropOffLocation: z.string().min(1, 'Drop-off location is required'),
  activities: z.array(z.string()).min(1, 'At least one activity must be selected'),
  availableDates: z
    .array(
      z.object({
        date: z.string().min(1, 'Date is required'),
        times: z.array(
          z.object({
            startTime: z.string().min(1, 'Start time is required'),
            endTime: z.string().min(1, 'End time is required'),
          })
        ),
      })
    )
    .min(1, 'At least one date is required'),
  accessibility: z.boolean().optional(),
});

const ItineraryForm = () => {
  const [activities, setActivities] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      timeline: '',
      language: '',
      price: '',
      availableDates: [{ date: '', times: [{ startTime: '', endTime: '' }] }],
      activities: [],
      pickUpLocation: '',
      dropOffLocation: '',
      accessibility: false,
    },
  });

  const { fields: availableDates, append: appendDate, remove: removeDate } = useFieldArray({
    control,
    name: 'availableDates',
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = Cookies.get('jwt');
        let role = Cookies.get('role');
        if (role === undefined) role = 'guest';
        const response = await axios.get(`http://localhost:4000/${role}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(response.data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchActivities();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const token = Cookies.get('jwt');
    const role = Cookies.get('role') || 'guest';
    
    try {
      const response = await axios.post(`http://localhost:4000/${role}/itineraries`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Itinerary created successfully!');
      console.log('Created itinerary:', response.data);
    } catch (err) {
      setError('Failed to create itinerary. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Itinerary</h2>

        {/* Display success or error messages */}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Form Fields */}
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="title">Title</label>
          <input
            {...register('title')}
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="title"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="timeline">Timeline</label>
          <input
            {...register('timeline')}
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="timeline"
          />
          {errors.timeline && <span className="text-red-500">{errors.timeline.message}</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="language">Language</label>
          <input
            {...register('language')}
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="language"
          />
          {errors.language && <span className="text-red-500">{errors.language.message}</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="price">Price</label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="price"
          />
          {errors.price && <span className="text-red-500">{errors.price.message}</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="pickUpLocation">Pick-Up Location</label>
          <input
            {...register('pickUpLocation')}
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="pickUpLocation"
          />
          {errors.pickUpLocation && <span className="text-red-500">{errors.pickUpLocation.message}</span>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="dropOffLocation">Drop-Off Location</label>
          <input
            {...register('dropOffLocation')}
            className="border border-gray-300 rounded-xl p-2 w-full"
            id="dropOffLocation"
          />
          {errors.dropOffLocation && <span className="text-red-500">{errors.dropOffLocation.message}</span>}
        </div>

        {/* Activities Selection */}
        <div className="mb-4 relative">
          <label className="block text-gray-700" htmlFor="activities">Activities</label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border border-gray-300 rounded-xl p-2 w-full text-left"
          >
            {watch('activities').length > 0
              ? `Selected: ${activities
                  .filter((activity) => watch('activities').includes(activity._id))
                  .map((activity) => activity.name)
                  .join(', ')}`
              : 'Select activities'}
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-full border border-gray-300 rounded-xl bg-white shadow-lg max-h-60 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-center p-2">
                  <input
                    type="checkbox"
                    value={activity._id}
                    {...register('activities')}
                    className="mr-2"
                  />
                  <label>{activity.name}</label>
                </div>
              ))}
            </div>
          )}
          {errors.activities && <span className="text-red-500">{errors.activities.message}</span>}
        </div>

        {/* Available Dates */}
        {availableDates.map((date, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Available Date {index + 1}</label>
            <Controller
              name={`availableDates.${index}.date`}
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  className="border border-gray-300 rounded-xl p-2 w-full"
                  {...field}
                />
              )}
            />
            {errors.availableDates?.[index]?.date && <span className="text-red-500">{errors.availableDates[index].date.message}</span>}
            
            {/* Times */}
            {date.times.map((_, timeIndex) => (
              <div key={timeIndex} className="flex space-x-4">
                <Controller
                  name={`availableDates.${index}.times.${timeIndex}.startTime`}
                  control={control}
                  render={({ field }) => (
                    <input
                      type="time"
                      className="border border-gray-300 rounded-xl p-2 w-full"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`availableDates.${index}.times.${timeIndex}.endTime`}
                  control={control}
                  render={({ field }) => (
                    <input
                      type="time"
                      className="border border-gray-300 rounded-xl p-2 w-full"
                      {...field}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          type="button"
          className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-xl w-full hover:bg-gray-600 transition duration-200"
          onClick={() =>
            appendDate({ date: '', times: [{ startTime: '', endTime: '' }] })
          }
        >
          Add Another Date
        </button>

        {/* Accessibility Checkbox */}
        <div className="mb-4 mt-4">
          <label className="block text-gray-700" htmlFor="accessibility">Accessibility</label>
          <input
            type="checkbox"
            {...register('accessibility')}
            className="mr-2"
            id="accessibility"
          />
          Accessible for Disabled?
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl w-full hover:bg-orange-600 transition duration-200"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm;
