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
  pictures: z.array(z.string()).optional(),
});

const CreateHpForm = () => {
  const [historicalTags, setHistoricalTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      pictures: [''],
    },
  });


  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all')
        const countryList = response.data
          .map((country) => ({
            name: country.name.common,
            code: country.cca2, // 2-letter country code
          }))
          .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
        setCountries(countryList)
      } catch (err) {
        console.error('Error fetching countries:', err.message)
        setError('Failed to fetch countries. Please try again.')
      }
    }
    fetchCountries()
  }, [])
  const handleCountryChange = async (selectedCountry) => {
    setCountry(selectedCountry);
    setCities([]);
    if (selectedCountry) {
      try {
        const response = await axios.get(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${selectedCountry}/regions`,
          {
            headers: {
              'X-RapidAPI-Key': '05e8bc9985msh099e96f1fd96549p140950jsnc61e911fbf8a',
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            },
          }
        );
        setCities(response.data.data.map((city) => city.name));
      } catch (err) {
        console.error('Error fetching cities:', err.message);
      }
    }
  };

 


  // useEffect(() => {
  //   const fetchTags = async () => {
  //     try {
  //       const token = Cookies.get('jwt');
  //       const response = await axios.get('http://localhost:4000/tags', {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setHistoricalTags(response.data);
  //     } catch (err) {
  //       console.error(err.message);
  //     }
  //   };
  //   fetchTags();
  // }, []);

  // const handleCountryChange = (selectedCountry) => {
  //   setCountry(selectedCountry);
  //   setCities(countries[selectedCountry] || []);
  // };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const token = Cookies.get('jwt');
    try {
      await axios.post('http://localhost:4000/historicalPlaces', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Historical place created successfully!');
    } catch (err) {
      setError('Failed to create historical place. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mt-20 mb-20 space-y-4" // Added space-y-4 for spacing between fields
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Create Historical Place</h2>

        {/* Success/Error Messages */}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-gray-700">Name</label>
          <input
            {...register('title')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12" // Set a consistent height
            id="title"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700">Description</label>
          <textarea
            {...register('description')}
            className="border border-gray-300 rounded-xl p-2 w-full h-24" // Set a consistent height
            id="description"
          />
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        {/* Location */}
        {/* <div>
          <label className="block text-gray-700">Country</label>
          <select
            {...register('location.country')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12" // Set a consistent height
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select a country</option>
            {Object.keys(countries).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.location?.country && <span className="text-red-500">{errors.location.country.message}</span>}

          <label className="block text-gray-700 mt-2">City</label>
          <select
            {...register('location.city')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12" // Set a consistent height
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

          <label className="block text-gray-700 mt-2">Address</label>
          <input
            {...register('location.address')}
            placeholder="Address"
            className="border border-gray-300 rounded-xl p-2 w-full h-12" // Set a consistent height
          />
          {errors.location?.address && <span className="text-red-500">{errors.location.address.message}</span>}
        </div> */}

<div>
          <label className="block text-gray-700">Country</label>
          <select
            {...register('location.country')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
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

          <label className="block text-gray-700 mt-2">City</label>
          <select
            {...register('location.city')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
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

          <label className="block text-gray-700 mt-2">Address</label>
          <input
            {...register('location.address')}
            placeholder="Address"
            className="border border-gray-300 rounded-xl p-2 w-full h-12"
          />
          {errors.location?.address && <span className="text-red-500">{errors.location.address.message}</span>}
        </div>

        {/* Historical Tags */}
        <label className="block text-gray-700 mt-2 ">Type</label>
          <input
            {...register('historicalTag.type')}
            placeholder="Type"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 " // Set a consistent height
          />
          {errors.historicalTag?.type && <span className="text-red-500">{errors.historicalTag.type.message}</span>}


          <label className="block text-gray-700 mt-2">Period</label>
          <input
            {...register('historicalTag.period')}
            placeholder="example: 2000-2004"
            className="border border-gray-300 rounded-xl p-2 w-full h-12" // Set a consistent height
          />
          {errors.historicalTag?.period && <span className="text-red-500">{errors.historicalTag.period.message}</span>}


        {/* Opening Hours */}
        <div>
          <label className="block text-gray-700">Opening Hours</label>
          <input {...register('openingHours.weekdays')} placeholder="Weekdays" className="border border-gray-300 rounded-xl p-2 w-full h-12" />
          <input {...register('openingHours.weekends')} placeholder="Weekends" className="border border-gray-300 rounded-xl p-2 w-full h-12 mt-2" />
        </div>

        {/* Ticket Prices */}
        <div>
          <label className="block text-gray-700">Ticket Prices</label>
          <input {...register('ticketPrices.adult', { valueAsNumber: true })} placeholder="Adult Price" min="0" type="number" className="border border-gray-300 rounded-xl p-2 w-full h-12" />
          <input {...register('ticketPrices.child', { valueAsNumber: true })} placeholder="Child Price" min="0" type="number" className="border border-gray-300 rounded-xl p-2 w-full h-12 mt-2" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl w-full hover:bg-orange-600 transition duration-200 h-12" // Set a consistent height
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CreateHpForm;
