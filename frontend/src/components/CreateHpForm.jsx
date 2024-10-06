import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import  Cookies  from 'js-cookie';

// Form validation schema using zod
const formSchema = z.object({
  title: z.string().min(1, 'Please enter a name'),
  description: z.string().min(1, 'Please enter a description'),
  location: z.object({
    address: z.string().min(1, 'Please enter an address'),
    city: z.string().min(1, 'Please enter a city'),
    country: z.string().min(1, 'Please select a country'),
  }),
  historicalTag: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).min(1, 'Please select at least one historical tag'),
  openingHours: z.object({
    weekdays: z.string().optional(),
    weekends: z.string().optional(),
  }),
  ticketPrices: z.object({
    foreigner: z.string().optional().transform(val => val ? Number(val) : undefined),
    native: z.string().optional().transform(val => val ? Number(val) : undefined),
    student: z.string().optional().transform(val => val ? Number(val) : undefined),
  }),
});

export default function CreateHpForm() {
  const [historicalTags, setHistoricalTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countries, setCountries] = useState([]);
  const [pictures, setPictures] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
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
        foreigner: '',
        native: '',
        student: '',
      },
    },
  });

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

    const fetchHistoricalTags = async () => {
      try {
        const token = Cookies.get("jwt")
        const response = await axios.get(`http://localhost:4000/tourism-governor/historical-tag`,  {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoricalTags(response.data);
      } catch (err) {
        console.error('Error fetching historical tags:', err.message);
        setError('Failed to fetch tags. Please try again.');
      }
    };
    fetchHistoricalTags();
  }, []);

  const onSubmit = async (data) => {
   
    setLoading(true);
    setError('');
    setSuccess('');

    const token = Cookies.get('jwt');
    data["historicalTag"] = data["historicalTag"].map(tag=>tag.value);

    // const formData = new FormData();
    // for (const key in data) {
    //   if (data.hasOwnProperty(key)) {
    //     if (key === 'historicalTag') {
    //       formData.append(key, JSON.stringify(data[key].map(tag => tag.value)));
    //     } else if (key === 'ticketPrices') {
    //       formData.append(key, JSON.stringify({
    //         adult: data[key].adult !== '' ? Number(data[key].adult) : undefined,
    //         child: data[key].child !== '' ? Number(data[key].child) : undefined,
    //       }));
    //     } else {
    //       formData.append(key, JSON.stringify(data[key]));
    //     }
    //   }
    // }

    // pictures.forEach((picture) => {
    //   formData.append('pictures', picture);
    // });

    try {
      const response = await fetch(`http://localhost:4000/tourism-governor/historical-places`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',


        },
        body:JSON.stringify(data)
      });

      if (response.ok){
        setSuccess('Historical place created successfully!');
        navigate('/');
      }


    } catch (err) {
      setError('Failed to create historical place. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = (event) => {
    const files = Array.from(event.target.files);
    setPictures(files);
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

        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">Name</label>
          <input
            {...register('title')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="title"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            className="border border-gray-300 rounded-xl p-2 w-full h-24 mb-4"
            id="description"
          />
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Country</label>
          <select
            {...register('location.country')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
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
          <input
            {...register('location.city')}
            placeholder="Enter city"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.location?.city && <span className="text-red-500">{errors.location.city.message}</span>}

          <label className="block text-gray-700 mb-2">Address</label>
          <input
            {...register('location.address')}
            placeholder="Address"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.location?.address && <span className="text-red-500">{errors.location.address.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Historical Tags</label>
          <Controller
            name="historicalTag"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={historicalTags.map(tag => ({
                  value: tag._id,
                  label: `${tag.type} - ${tag.period}`
                }))}
                className="rounded-xl"
                classNamePrefix="select"
              />
            )}
          />
          {errors.historicalTag && <span className="text-red-500">{errors.historicalTag.message}</span>}
        </div>

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

        <div>
          <label className="block text-gray-700 mb-2">Ticket Price (Foreigners)</label>
          <input
            {...register('ticketPrices.foreigner')}
            type="number"
            placeholder="Price for Foreigners"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.ticketPrices?.foreigner && <span className="text-red-500">{errors.ticketPrices.foreigner.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Ticket Price (Native)</label>
          <input
            {...register('ticketPrices.native')}
            type="number"
            placeholder="Price for natives"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.ticketPrices?.native && <span className="text-red-500">{errors.ticketPrices.native.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Ticket Price (student)</label>
          <input
            {...register('ticketPrices.student')}
            type="number"
            placeholder="Price for students"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
          />
          {errors.ticketPrices?.student && <span className="text-red-500">{errors.ticketPrices.student.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Upload Pictures</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePictureChange}
            className="border border-gray-300 rounded-xl p-2 w-full mb-4"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white rounded-xl p-2 h-12 mt-4"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Historical Place'}
        </button>
      </form>

    </div>
  );
}