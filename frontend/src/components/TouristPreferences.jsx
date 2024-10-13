import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import Select from 'react-select';
import Cookies from 'js-cookie';

const schema = z.object({
  budget: z.number().positive().optional(),
  price: z.number().positive().optional(),
  categories: z.array(z.string()).optional(),
  tourLanguages: z.array(z.string()).optional(),
  tourType: z.array(z.string()).optional(),
  historicalPlaceType: z.array(z.string()).optional(),
  historicalPlacePeriod: z.array(z.string()).optional(),
});

const TravelPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [options, setOptions] = useState({
    languages: [],
    categories: [],
    tourTypes: [],
    historicalTypes: [],
    historicalPeriods: [],
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: preferences || {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("jwt"); 
        const headers = { Authorization: `Bearer ${token}` };

        const [prefsRes, langsRes, catsRes, typesRes, histTypesRes, histPeriodsRes] = await Promise.all([
          axios.get('http://localhost:4000/tourist/preferences', { headers }),
          axios.get('http://localhost:4000/api/getAllLanguages'),
          axios.get('http://localhost:4000/api/getAllCategories'),
          axios.get('http://localhost:4000/api/getAllTypes'),
          axios.get('http://localhost:4000/api/getAllHistoricalTypes'),
          axios.get('http://localhost:4000/api/getAllHistoricalPeriods'),
        ]);

        setPreferences(prefsRes.data);
        reset(prefsRes.data);

        setOptions({
          languages: langsRes.data.map(lang => ({ value: lang, label: lang })),
          categories: catsRes.data.map(cat => ({ value: cat.name, label: cat.name })),
          tourTypes: typesRes.data.map(type => ({ value: type, label: type })),
          historicalTypes: histTypesRes.data.map(type => ({ value: type, label: type })),
          historicalPeriods: histPeriodsRes.data.map(period => ({ value: period, label: period })),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get("jwt");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put('http://localhost:4000/tourist/preferences', data, { headers });
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences. Please try again.');
    }
  };

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Travel Preferences</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
                <input
                  {...field}
                  type="number"
                  id="budget"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  {...field}
                  type="number"
                  id="price"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            )}
          />
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Categories</label>
                <Select
                  {...field}
                  isMulti
                  options={options.categories}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="tourLanguages"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="tourLanguages" className="block text-sm font-medium text-gray-700">Tour Languages</label>
                <Select
                  {...field}
                  isMulti
                  options={options.languages}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="tourType"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="tourType" className="block text-sm font-medium text-gray-700">Tour Type</label>
                <Select
                  {...field}
                  isMulti
                  options={options.tourTypes}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="historicalPlaceType"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="historicalPlaceType" className="block text-sm font-medium text-gray-700">Historical Place Type</label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalTypes}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="historicalPlacePeriod"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="historicalPlacePeriod" className="block text-sm font-medium text-gray-700">Historical Place Period</label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalPeriods}
                  className="mt-1"
                />
              </div>
            )}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Update Preferences
        </button>
      </form>
    </div>
  );
};

export default TravelPreferences;