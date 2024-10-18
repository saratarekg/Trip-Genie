import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import Select from 'react-select';
import Cookies from 'js-cookie';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  budget: z.number().min(0, "Budget must be a positive number").nullable(),
  price: z.number().min(0, "Price must be a positive number").nullable(),
  categories: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  tourLanguages: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  tourType: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  historicalPlaceType: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  historicalPlacePeriod: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      budget: null,
      price: null,
      categories: null,
      tourLanguages: null,
      tourType: null,
      historicalPlaceType: null,
      historicalPlacePeriod: null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('jwt');
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

        const optionsData = {
          languages: langsRes.data.map(lang => ({ value: lang, label: lang })),
          categories: catsRes.data.map(cat => ({ value: cat.name, label: cat.name })),
          tourTypes: typesRes.data.map(type => ({ value: type, label: type })),
          historicalTypes: histTypesRes.data.map(type => ({ value: type, label: type })),
          historicalPeriods: histPeriodsRes.data.map(period => ({ value: period, label: period })),
        };

        setOptions(optionsData);

        const formattedPrefs = {
          ...prefsRes.data,
          categories: prefsRes.data.categories?.map(cat => optionsData.categories.find(o => o.value === cat)) || null,
          tourLanguages: prefsRes.data.tourLanguages?.map(lang => optionsData.languages.find(o => o.value === lang)) || null,
          tourType: prefsRes.data.tourType?.map(type => optionsData.tourTypes.find(o => o.value === type)) || null,
          historicalPlaceType: prefsRes.data.historicalPlaceType?.map(type => optionsData.historicalTypes.find(o => o.value === type)) || null,
          historicalPlacePeriod: prefsRes.data.historicalPlacePeriod?.map(period => optionsData.historicalPeriods.find(o => o.value === period)) || null,
        };

        reset(formattedPrefs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get('jwt');
      const headers = { Authorization: `Bearer ${token}` };
      
      const updatedData = {
        budget: data.budget === null ? Infinity : data.budget,
        price: data.price === null ? Infinity : data.price,
        categories: data.categories?.map(item => item.value) || [],
        tourLanguages: data.tourLanguages?.map(item => item.value) || [],
        tourType: data.tourType?.map(item => item.value) || [],
        historicalPlaceType: data.historicalPlaceType?.map(item => item.value) || [],
        historicalPlacePeriod: data.historicalPlacePeriod?.map(item => item.value) || [],
      };

      await axios.put('http://localhost:4000/tourist/preferences', updatedData, { headers });
      setDialogMessage('Preferences updated successfully!');
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setDialogMessage('Failed to update preferences. Please try again.');
      setIsDialogOpen(true);
    }
  };

  if (Cookies.get("role") !== "tourist") {
    return null;
  }

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4 text-left">Travel Preferences</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="budget" className="text-sm font-medium text-gray-600 mb-1">Budget</Label>
                <Input
                  {...field}
                  type="number"
                  id="budget"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    if (value === null || value >= 0) {
                      field.onChange(value);
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
              </div>
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-600 mb-1">Price</Label>
                <Input
                  {...field}
                  type="number"
                  id="price"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    if (value === null || value >= 0) {
                      field.onChange(value);
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
            )}
          />
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="categories" className="text-sm font-medium text-gray-600 mb-1">Categories</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.categories}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
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
                <Label htmlFor="tourLanguages" className="text-sm font-medium text-gray-600 mb-1">Tour Languages</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.languages}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
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
                <Label htmlFor="tourType" className="text-sm font-medium text-gray-600 mb-1">Tour Type</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.tourTypes}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
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
                <Label htmlFor="historicalPlaceType" className="text-sm font-medium text-gray-600 mb-1">Historical Place Type</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalTypes}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
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
                <Label htmlFor="historicalPlacePeriod" className="text-sm font-medium text-gray-600 mb-1">Historical Place Period</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalPeriods}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
        </div>
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          Update Preferences
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>
          <p>{dialogMessage}</p>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelPreferences;