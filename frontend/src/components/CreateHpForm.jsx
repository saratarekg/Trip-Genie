import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router-dom";

// Form validation schema using zod
const formSchema = z.object({
  title: z.string().min(1, 'Please enter a name'),
  description: z.string().min(1, 'Please enter a description'),
  location: z.object({
    address: z.string().min(1, 'Please enter an address'),
    city: z.string().min(1, 'Please select a city'),
    country: z.string().min(1, 'Please select a country'),
  }),
  historicalTag: z.array(z.string()).min(1, 'Please enter at least one tag'),
  openingHours: z.object({
    weekdays: z.string().optional(),
    weekends: z.string().optional(),
  }),
  ticketPrices: z.object({
    adult: z.number().min(0, 'Please enter a valid adult price').optional(),
    child: z.number().min(0, 'Please enter a valid child price').optional(),
  }),
});

const CreateHpForm = () => {
  const [historicalTags, setHistoricalTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [pictures, setPictures] = useState([]); // State for uploaded pictures
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: {
        address: '',
        city: '',
        country: '',
      },
      historicalTag: [],
      openingHours: {
        weekdays: '',
        weekends: '',
      },
      ticketPrices: {
        adult: '',
        child: '',
      },
    },
  });

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countryList = response.data
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryList);
      } catch (err) {
        console.error('Error fetching countries:', err.message);
        setError('Failed to fetch countries. Please try again.');
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = async (selectedCountry) => {
    setCountry(selectedCountry);
    setCities([]);
    if (selectedCountry) {
      try {
        const response = await axios.get(`https://countries-and-cities-api.dev/api/cities/country/${selectedCountry}`);
        setCities(response.data.cities);
      } catch (err) {
        console.error('Error fetching cities:', err.message);
        setError('Failed to fetch cities. Please try again.');
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const token = Cookies.get('jwt');

    // Create FormData object
    const formData = new FormData();
    // Append form data to FormData
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, JSON.stringify(data[key])); // Append each field as JSON string
      }
    }
    // Append uploaded pictures
    pictures.forEach((picture) => {
      formData.append('pictures', picture); // Append each picture file
    });

    try {
      await axios.post('http://localhost:4000/historicalPlaces', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Set content type to multipart
        },
      });
      setSuccess('Historical place created successfully!');
      // Optionally, navigate or reset the form
      navigate('/'); // Adjust to your needs
    } catch (err) {
      setError('Failed to create historical place. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = (event) => {
    const files = Array.from(event.target.files);
    setPictures(files); // Store the file objects instead of URLs
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Historical Place</h2>

        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">Name</label>
          <input
            {...register('title')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="title"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            className="border border-gray-300 rounded-xl p-2 w-full h-24 mb-4"
            id="description"
          />
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-700 mb-2">Country</label>
          <select
            {...register('location.country')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.location?.country && <span className="text-red-500">{errors.location.country.message}</span>}

          <label className="block text-gray-700 mb-2">City</label>
          <select
            {...register('location.city')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            disabled={!country}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.location?.city && <span className="text-red-500">{errors.location.city.message}</span>}

          <label className="block text-gray-700 mb-2">Address</label>
          <input
            {...register('location.address')}
            placeholder="Address"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.location?.address && <span className="text-red-500">{errors.location.address.message}</span>}
        </div>

        {/* Historical Tags */}
        <label className="block text-gray-700 mb-2">Type</label>
        <input
          {...register('historicalTag.type')}
          placeholder="Type"
          className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
        />
        {errors.historicalTag?.type && <span className="text-red-500">{errors.historicalTag.type.message}</span>}

        <label className="block text-gray-700 mb-2">Period</label>
        <input
          {...register('historicalTag.period')}
          placeholder="example: 2000-2004"
          className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
        />
        {errors.historicalTag?.period && <span className="text-red-500">{errors.historicalTag.period.message}</span>}

        {/* Opening Hours */}
        <div>
          <label className="block text-gray-700 mb-2">Opening Hours (Weekdays)</label>
          <input
            {...register('openingHours.weekdays')}
            placeholder="e.g., 9 AM - 5 PM"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.openingHours?.weekdays && <span className="text-red-500">{errors.openingHours.weekdays.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Opening Hours (Weekends)</label>
          <input
            {...register('openingHours.weekends')}
            placeholder="e.g., 10 AM - 4 PM"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.openingHours?.weekends && <span className="text-red-500">{errors.openingHours.weekends.message}</span>}
        </div>

        {/* Ticket Prices */}
        <div>
          <label className="block text-gray-700 mb-2">Ticket Prices</label>
          <input 
            type="number"
            {...register('ticketPrices.adult')}
            placeholder="Adult Ticket Price"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.ticketPrices?.adult && <span className="text-red-500">{errors.ticketPrices.adult.message}</span>}
        </div>

        <div>
          <input 
            type="number"
            {...register('ticketPrices.child')}
            placeholder="Child Ticket Price"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.ticketPrices?.child && <span className="text-red-500">{errors.ticketPrices.child.message}</span>}
        </div>

        {/* Picture Upload Section */}
        <div>
          <label className="block text-gray-700 mb-2">Upload Pictures</label>
          <input
            type="file"
            multiple
            onChange={handlePictureChange}
            className="border border-gray-300 rounded-xl p-2 w-full mb-4"
          />
          <div className="mt-2">
            {pictures.length > 0 && (
              <ul className="list-disc pl-5">
                {pictures.map((pic, index) => (
                  <li key={index} className="text-gray-600">{pic.name}</li> // Displaying the name of the uploaded image
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white py-2 px-4 rounded-xl w-full mt-4"
        >
          {loading ? 'Creating...' : 'Create Historical Place'}
        </button>
      </form>
    </div>
  );
};

export default CreateHpForm;
