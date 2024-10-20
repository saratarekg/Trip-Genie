import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Label } from "@/components/ui/label";
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
 * @param {boolean} isCityDisabled - Whether the city field is disabled
 * @returns {import('zod').ZodObject}
 */
const createFormSchema = (isCityDisabled) => z.object({
  title: z.string().min(1, 'Please enter a name'),
  description: z.string().min(1, 'Please enter a description'),
  location: z.object({
    address: z.string().min(1, 'Please enter an address'),
    city: isCityDisabled ? z.string().optional() : z.string().min(1, 'Please enter a city'),
    country: z.string().min(1, 'Please select a country'),
  }),
  historicalTag: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    ),
  openingHours: z.object({
    weekdays: z.string().min(1, 'Please enter weekday opening hours'),
    weekends: z.string().min(1, 'Please enter weekend opening hours'),
  }),
  ticketPrices: z.object({
    foreigner: z.string().min(1, 'Please enter foreigner ticket price'),
    native: z.string().min(1, 'Please enter native ticket price'),
    student: z.string().min(1, 'Please enter student ticket price'),
  }),
  currency: z.string().min(1, 'Please select a currency'),
  pictures: z.string().min(1, 'Please enter at least one picture URL')
    .refine(
      (value) => value.split('\n').every(url => url.trim().startsWith('http')),
      'All URLs must start with http:// or https://'
    ),
});

export default function CreateHpForm() {
  const [historicalTags, setHistoricalTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [isCityDisabled, setIsCityDisabled] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(createFormSchema(isCityDisabled)),
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
      currency: '',
      pictures: '',
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

    const fetchCurrencies = async () => {
      try {
        const token = Cookies.get('jwt');
        const response = await axios.get(`http://localhost:4000/tourism-governor/currencies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrencies(response.data);
      } catch (err) {
        console.error('Error fetching currencies:', err.message);
        setError('Failed to fetch currencies. Please try again.');
      }
    };

    fetchCurrencies();
  }, []);

    const fetchHistoricalTags = async () => {
      try {
        const token = Cookies.get('jwt');
        const response = await axios.get(`http://localhost:4000/tourism-governor/historical-tag`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoricalTags(response.data);
      } catch (err) {
        console.error('Error fetching historical tags:', err.message);
        setError('Failed to fetch tags. Please try again.');
      }
    };

  const fetchCities = async (country) => {
    setCitiesLoading(true);
    setIsCityDisabled(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg || 'Failed to fetch cities');
      }

      const sortedCities = data.data.sort();
      setCities(sortedCities);
      setIsCityDisabled(sortedCities.length === 0);
    } catch (err) {
      console.error('Error fetching cities: ', err);
      setCities([]);
      setIsCityDisabled(true);
    } finally {
      setCitiesLoading(false);
      trigger('location.city');
    }
  };

  const handleCountryChange = (event) => {
    const country = event.target.value;
    fetchCities(country);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const token = Cookies.get('jwt');

    try {
      const response = await fetch(`http://localhost:4000/tourism-governor/historical-places`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          historicalTag: data.historicalTag.map(tag => tag.value),
          // currency: data.currency,
          pictures: data.pictures.split('\n').map(url => url.trim()).filter(url => url),
        }),
      });

      if (response.ok) {
        setShowDialog(true);
      } else {
        throw new Error('Failed to create historical place.');
      }
    } catch (err) {
      setError('Failed to create historical place. Please try again.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setShowDialog(false);
    navigate('/all-historical-places');
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
        <h2 className="text-xl font-semibold mb-4 text-center">Create Historical Place</h2>

        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">Name *</label>
          <input
            {...register('title')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="title"
          />
          {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 mb-2">Description *</label>
          <textarea
            {...register('description')}
            className="border border-gray-300 rounded-xl p-2 w-full h-24 mb-4"
            id="description"
          />
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        <div>
          <label htmlFor="country" className="block text-gray-700 mb-2">Country *</label>
          <select
            {...register('location.country')}
            onChange={handleCountryChange}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="country"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.location?.country && <span className="text-red-500">{errors.location.country.message}</span>}
        </div>

        <div>
          <label htmlFor="city" className="block text-gray-700 mb-2">City {isCityDisabled ? '' : '*'}</label>
          <select
            {...register('location.city')}
            disabled={isCityDisabled}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="city"
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.location?.city && <span className="text-red-500">{errors.location.city.message}</span>}
          {isCityDisabled && (
            <span className="text-blue-500">No cities available for this country. You can proceed without selecting a city.</span>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-gray-700 mb-2">Address *</label>
          <input
            {...register('location.address')}
            placeholder="Address"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="address"
          />
          {errors.location?.address && <span className="text-red-500">{errors.location.address.message}</span>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Historical Tags *</label>
          <Controller
            name="historicalTag"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={historicalTags.map((tag) => ({
                  value: tag._id,
                  label: `${tag.type} - ${tag.period}`,
                }))}
                className="rounded-xl"
                classNamePrefix="select"
              />
            )}
          />
          {errors.historicalTag && <span className="text-red-500">{errors.historicalTag.message}</span>}
        </div>

        <div>
          <label htmlFor="weekdays" className="block text-gray-700 mb-2">Opening Hours (Weekdays) *</label>
          <input
            {...register('openingHours.weekdays')}
            placeholder="e.g., 9 AM - 5 PM"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="weekdays"
          />
          {errors.openingHours?.weekdays && <span className="text-red-500">{errors.openingHours.weekdays.message}</span>}
        </div>

        <div>
          <label htmlFor="weekends" className="block text-gray-700 mb-2">Opening Hours (Weekends) *</label>
          <input
            {...register('openingHours.weekends')}
            placeholder="e.g., 10 AM - 4 PM"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="weekends"
          />
          {errors.openingHours?.weekends && <span className="text-red-500">{errors.openingHours.weekends.message}</span>}
        </div>

        <div>
          <label htmlFor="foreigner" className="block text-gray-700 mb-2">Ticket Prices (Foreigner) *</label>
          <input
            {...register('ticketPrices.foreigner')}
            placeholder="Enter foreigner ticket price"
            type="number"
            min="0"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="foreigner"
          />
          {errors.ticketPrices?.foreigner && <span className="text-red-500">{errors.ticketPrices.foreigner.message}</span>}
        </div>

        <div>
          <label htmlFor="native" className="block text-gray-700 mb-2">Ticket Prices (Native) *</label>
          <input
            {...register('ticketPrices.native')}
            placeholder="Enter native ticket price"
            type="number"
            min="0"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="native"
          />
          {errors.ticketPrices?.native && <span className="text-red-500">{errors.ticketPrices.native.message}</span>}
        </div>

        <div>
          <label htmlFor="student" className="block text-gray-700 mb-2">Ticket Prices (Student) *</label>
          <input
            {...register('ticketPrices.student')}
            placeholder="Enter student ticket price"
            type="number"
            min="0"
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="student"
          />
          {errors.ticketPrices?.student && <span className="text-red-500">{errors.ticketPrices.student.message}</span>}
        </div>

        <div>
          <Label htmlFor="currency">Currency *</Label>
          <select
            {...register('currency')}
            className="border border-gray-300 rounded-xl p-2 w-full h-12 mb-4"
            id="currency"
          >
            <option value="">Select currency</option>
            {currencies.map((currency) => (
              <option key={currency._id} value={currency._id}>
                {currency.code} - {currency.name}  ({currency.symbol})
              </option>
            ))}
          </select>
          {errors.currency && <span className="text-red-500">{errors.currency.message}</span>}
        </div>

        <div>
          <label htmlFor="pictures" className="block text-gray-700 mb-2">Picture URLs</label>
          <textarea
            {...register('pictures')}
            placeholder="Enter picture URLs (one per line)"
            className="border border-gray-300 rounded-xl p-2 w-full h-32 mb-4"
            id="pictures"
          />
          {errors.pictures && <span className="text-red-500">{errors.pictures.message}</span>}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white rounded-xl p-2 h-12 mt-4"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Historical Place'}
        </button>

        {error && <div className="text-red-500 mb-4">{error}</div>}
      </form>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Success!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              The historical place was created successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-4">
            <Button onClick={handleGoBack}>
              Go to All Historical Places
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