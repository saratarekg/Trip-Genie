'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_KEY = import.meta.env.VITE_HOTELS_API_KEY2;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HotelSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(addDays(new Date(), 1));
  const [adults, setAdults] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCurrency, setUserCurrency] = useState({ code: 'USD', symbol: '$' });
  const [exchangeRates, setExchangeRates] = useState({});
  const [showCheckInWarning, setShowCheckInWarning] = useState(false);

  const fetchUserCurrency = useCallback(async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await axios.get('http://localhost:4000/tourist/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currencyId = response.data.preferredCurrency;
      const currencyResponse = await axios.get(`http://localhost:4000/tourist/getCurrency/${currencyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCurrency(currencyResponse.data);
    } catch (error) {
      console.error('Error fetching user currency:', error);
    }
  }, []);

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/rates');
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserCurrency();
    fetchExchangeRates();
  }, [fetchUserCurrency, fetchExchangeRates]);

  const convertPrice = useCallback((priceUSD) => {
    if (!priceUSD) return null;
    const rate = exchangeRates[userCurrency.code] || 1;
    return (priceUSD * rate).toFixed(2);
  }, [exchangeRates, userCurrency.code]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery && checkInDate && checkOutDate) {
      setIsLoading(true);
      setError(null);
      try {
        const locationResponse = await fetch(
          `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=en-gb&name=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'x-rapidapi-host': 'booking-com.p.rapidapi.com',
              'x-rapidapi-key': API_KEY,
            },
          }
        );
        const locations = await locationResponse.json();
        const destId = locations[0]?.dest_id;

        if (!destId) {
          throw new Error('Destination not found');
        }

        const searchResponse = await fetch(
          `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${destId}&order_by=popularity&checkout_date=${format(checkOutDate, 'yyyy-MM-dd')}&checkin_date=${format(checkInDate, 'yyyy-MM-dd')}&adults_number=${adults}&room_number=1&units=metric&filter_by_currency=USD&locale=en-gb&dest_type=city`,
          {
            headers: {
              'x-rapidapi-host': 'booking-com.p.rapidapi.com',
              'x-rapidapi-key': API_KEY,
            },
          }
        );
        const searchResults = await searchResponse.json();
        setHotels(searchResults.result || []);
      } catch (err) {
        setError('An error occurred while searching for hotels. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCheckInDateChange = (date) => {
    setCheckInDate(date);
    setShowCheckInWarning(false);
    // Ensure check-out date is at least one day after check-in date
    if (!checkOutDate || date >= checkOutDate) {
      setCheckOutDate(addDays(date, 1));
    }
  };

  const handleCheckOutDateChange = (date) => {
    if (checkInDate && date > checkInDate) {
      setCheckOutDate(date);
    }
  };

  return (
    <div>
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Hotel Search</h1>
        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          <Input
            type="text"
            placeholder="Enter destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
            aria-label="Destination"
          />
          <div className="flex space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !checkInDate && "text-muted-foreground"
                  )}
                  aria-label="Select check-in date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, "PPP") : <span>Check-in date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={handleCheckInDateChange}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <div>
                {checkInDate ? (
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !checkOutDate && "text-muted-foreground"
                      )}
                      aria-label="Select check-out date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : <span>Check-out date</span>}
                    </Button>
                  </PopoverTrigger>
                ) : (
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal text-muted-foreground"
                    onClick={() => setShowCheckInWarning(true)}
                    aria-label="Select check-out date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Check-out date</span>
                  </Button>
                )}
                {showCheckInWarning && !checkInDate && (
                  <p className="text-sm text-red-500 mt-1">Please select a check-in date first.</p>
                )}
              </div>
              {checkInDate && (
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={handleCheckOutDateChange}
                    disabled={(date) => date <= checkInDate || date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              )}
            </Popover>
          </div>
          <Input
            type="number"
            placeholder="Number of adults"
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            min={1}
            required
            aria-label="Number of adults"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Hotels'}
          </Button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-6">
          {hotels.map((hotel) => (
            <Link 
              to={`/hotels/${hotel.hotel_id}?checkinDate=${format(checkInDate, 'yyyy-MM-dd')}&checkoutDate=${format(checkOutDate, 'yyyy-MM-dd')}&adults=${adults}`} 
              key={hotel.hotel_id} 
              className="block"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="relative w-[200px] h-[150px]">
                      <img
                        src={hotel.max_photo_url || '/placeholder.svg'}
                        alt={hotel.hotel_name}
                        className="object-cover rounded-md w-full h-full"
                      />
                    </div>
                    <div>
                      <CardHeader className="p-0">
                        <CardTitle className="text-xl">{hotel.hotel_name}</CardTitle>
                      </CardHeader>
                      <div className="mt-2 flex items-center">
                        {[...Array(Math.floor(hotel.review_score / 2) || 0)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {hotel.review_score ? `${(hotel.review_score/2).toFixed(1)}` : 'No reviews yet'}
                        </span>
                      </div>
                      <p className="mt-2">{hotel.address}</p>
                      <p className="mt-2 font-bold">
                        {userCurrency.symbol}{convertPrice(hotel.min_total_price)} - {userCurrency.symbol}{convertPrice(hotel.price_breakdown.all_inclusive_price)} per night
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}