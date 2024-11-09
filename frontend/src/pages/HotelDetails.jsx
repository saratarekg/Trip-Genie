'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Coffee, Tv, AirVent } from 'lucide-react';

const API_KEY = import.meta.env.VITE_HOTELS_API_KEY;

export default function HotelDetails() {
  const { hotelId } = useParams();
  const [hotelData, setHotelData] = useState(null);
  const [hotelPhotos, setHotelPhotos] = useState([]);
  const [hotelFacilities, setHotelFacilities] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const parsedHotelId = parseInt(hotelId, 10);
        if (isNaN(parsedHotelId)) {
          throw new Error('Invalid hotel ID');
        }

        const headers = {
          'x-rapidapi-host': 'booking-com.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        };

        const fetchWithDelay = async (url) => {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          const response = await fetch(url, { headers });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        };

        const [data, photos, facilities, roomListData] = await Promise.all([
          fetchWithDelay(`https://booking-com.p.rapidapi.com/v1/hotels/data?hotel_id=${parsedHotelId}&locale=en-gb`),
          fetchWithDelay(`https://booking-com.p.rapidapi.com/v1/hotels/photos?hotel_id=${parsedHotelId}&locale=en-gb`),
          fetchWithDelay(`https://booking-com.p.rapidapi.com/v1/hotels/facilities?hotel_id=${parsedHotelId}&locale=en-gb`),
          fetchWithDelay(`https://booking-com.p.rapidapi.com/v1/hotels/room-list?checkin_date=2025-01-18&checkout_date=2025-01-19&hotel_id=${parsedHotelId}&adults_number_by_rooms=2&children_number_by_rooms=0&currency=USD&units=metric&locale=en-gb`)
        ]);

        setHotelData(data);
        setHotelPhotos(photos);
        setHotelFacilities(facilities);
        setRoomList(Object.values(roomListData.rooms || {}));
      } catch (err) {
        setError('An error occurred while fetching hotel details. Please try again.');
        console.error('Error fetching hotel details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error || !hotelData) {
    return <div className="container mx-auto p-4 text-red-500">{error || 'Failed to load hotel details'}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{hotelData.name}</h1>
      <div className="mb-6">
        <Carousel className="w-full max-w-xl">
          <CarouselContent>
            {hotelPhotos.map((photo, index) => (
              <CarouselItem key={index}>
                <img src={photo.url_1440} alt={`Hotel photo ${index + 1}`} className="w-full h-64 object-cover rounded-lg" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{hotelData.address}</p>
            <p className="mb-2">{hotelData.city}, {hotelData.country}</p>
            <div className="flex items-center mb-2">
              {[...Array(Math.floor(hotelData.review_score / 2))].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2">{hotelData.review_score} ({hotelData.review_nr} reviews)</span>
            </div>
            <p>{hotelData.description_translations?.en}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotelFacilities.map((facility, index) => (
                <Badge key={index} variant="secondary">
                  {facility.facility_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Rooms</TabsTrigger>
              {roomList.map((room, index) => (
                <TabsTrigger key={index} value={`room-${index}`}>{room.name}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomList.map((room, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>Max occupancy: {room.max_occupancy}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {room.highlights.map((highlight, i) => (
                          <Badge key={i} variant="outline">{highlight}</Badge>
                        ))}
                      </div>
                      <p className="font-bold mb-2">Bed Configuration:</p>
                      <ul className="list-disc list-inside mb-4">
                        {room.bed_configurations[0]?.bed_types.map((bed, i) => (
                          <li key={i}>{bed.name_with_count}</li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2">
                        {room.facilities.slice(0, 5).map((facility, i) => (
                          <Badge key={i} variant="secondary">
                            {facility.name === 'Free WiFi' && <Wifi className="w-4 h-4 mr-1" />}
                            {facility.name === 'Tea/Coffee maker' && <Coffee className="w-4 h-4 mr-1" />}
                            {facility.name === 'TV' && <Tv className="w-4 h-4 mr-1" />}
                            {facility.name === 'Air conditioning' && <AirVent className="w-4 h-4 mr-1" />}
                            {facility.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            {roomList.map((room, index) => (
              <TabsContent key={index} value={`room-${index}`}>
                <Card>
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>Max occupancy: {room.max_occupancy}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.highlights.map((highlight, i) => (
                        <Badge key={i} variant="outline">{highlight}</Badge>
                      ))}
                    </div>
                    <p className="font-bold mb-2">Bed Configuration:</p>
                    <ul className="list-disc list-inside mb-4">
                      {room.bed_configurations[0]?.bed_types.map((bed, i) => (
                        <li key={i}>{bed.name_with_count}</li>
                      ))}
                    </ul>
                    <p className="font-bold mb-2">Facilities:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {room.facilities.map((facility, i) => (
                        <Badge key={i} variant="secondary">
                          {facility.name === 'Free WiFi' && <Wifi className="w-4 h-4 mr-1" />}
                          {facility.name === 'Tea/Coffee maker' && <Coffee className="w-4 h-4 mr-1" />}
                          {facility.name === 'TV' && <Tv className="w-4 h-4 mr-1" />}
                          {facility.name === 'Air conditioning' && <AirVent className="w-4 h-4 mr-1" />}
                          {facility.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}