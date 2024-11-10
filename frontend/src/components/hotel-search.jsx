'use client'

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_KEY = import.meta.env.VITE_HOTELS_API_KEY;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HotelSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState();
  const [checkOutDate, setCheckOutDate] = useState();
  const [adults, setAdults] = useState(2);
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery && checkInDate && checkOutDate) {
      setIsLoading(true);
      setError(null);
      try {
        // First, get the destination ID
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

        // Now, search for hotels using v1 endpoint
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

  return (
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
                onSelect={setCheckInDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
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
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
              />
            </PopoverContent>
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
          <Link to={`/hotels2/${hotel.hotel_id}`} key={hotel.hotel_id} className="block">
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
                        {hotel.review_score ? `${hotel.review_score.toFixed(1)} (${hotel.review_count} reviews)` : 'No reviews yet'}
                      </span>
                    </div>
                    <p className="mt-2">{hotel.address}</p>
                    <p className="mt-2 font-bold">
                      ${hotel.min_total_price ? hotel.min_total_price.toFixed(2) : 'N/A'} per night
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}