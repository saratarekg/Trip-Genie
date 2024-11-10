import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Coffee, Tv, AirVent } from "lucide-react";
import Loader from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_KEY = import.meta.env.VITE_HOTELS_API_KEY;

export default function HotelDetails() {
  const { hotelId } = useParams();
  const [hotelData, setHotelData] = useState(null);
  const [hotelPhotos, setHotelPhotos] = useState([]);
  const [hotelFacilities, setHotelFacilities] = useState([]);
  const [groupedRooms, setGroupedRooms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [isBookingConfirmationOpen, setIsBookingConfirmationOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const hotelDataFetched = useRef(false);
  const hotelPhotosFetched = useRef(false);
  const hotelFacilitiesFetched = useRef(false);
  const roomListFetched = useRef(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const parsedHotelId = parseInt(hotelId, 10);
        if (isNaN(parsedHotelId)) {
          throw new Error("Invalid hotel ID");
        }

        const headers = {
          "x-rapidapi-host": "booking-com.p.rapidapi.com",
          "x-rapidapi-key": API_KEY,
        };

        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const fetchWithCache = async (url, cachedData, setData, fetchFlag) => {
          if (fetchFlag.current) return;
          fetchFlag.current = true;
          const response = await fetch(url, { headers });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setData(data);
          await delay(1000);
        };

        await fetchWithCache(
          `https://booking-com.p.rapidapi.com/v1/hotels/data?hotel_id=${parsedHotelId}&locale=en-gb`,
          hotelData,
          setHotelData,
          hotelDataFetched
        );

        await fetchWithCache(
          `https://booking-com.p.rapidapi.com/v1/hotels/photos?hotel_id=${parsedHotelId}&locale=en-gb`,
          hotelPhotos,
          setHotelPhotos,
          hotelPhotosFetched
        );

        await fetchWithCache(
          `https://booking-com.p.rapidapi.com/v1/hotels/facilities?hotel_id=${parsedHotelId}&locale=en-gb`,
          hotelFacilities,
          setHotelFacilities,
          hotelFacilitiesFetched
        );

        await fetchWithCache(
          `https://booking-com.p.rapidapi.com/v1/hotels/room-list?checkin_date=2025-01-18&checkout_date=2025-01-19&hotel_id=${parsedHotelId}&adults_number_by_rooms=2&children_number_by_rooms=0&currency=${currencyCode}&units=metric&locale=en-gb`,
          null,
          (data) => {
            if (data && data[0]) {
              const extractRoomInfo = (data) => {
                return data[0].block.map((room) => ({
                  name: room.room_name,
                  price: room.price_breakdown?.gross_price,
                  allInclusivePrice: room.price_breakdown?.all_inclusive_price || null,
                  currency: room.price_breakdown?.currency,
                }));
              };

              const extractMoreRoomInfo = (data) => {
                if (data[0].rooms && Array.isArray(data[0].rooms)) {
                  return data[0].rooms;
                } else if (data[0].rooms && typeof data[0].rooms === 'object') {
                  return Object.values(data[0].rooms);
                } else {
                  console.error('Unexpected rooms data structure:', data[0].rooms);
                  return [];
                }
              };

              const basicRoomInfo = extractRoomInfo(data);
              const moreRoomInfo = extractMoreRoomInfo(data);

              const mergedRoomInfo = basicRoomInfo
                .map((room, index) => ({
                  ...room,
                  ...(moreRoomInfo[index] || {}),
                }))
                .filter(room => 
                  (room.bed_configurations && room.bed_configurations.length > 0) &&
                  (room.facilities && room.facilities.length > 0)
                );

              // Group rooms by name
              const grouped = mergedRoomInfo.reduce((acc, room) => {
                if (!acc[room.name]) {
                  acc[room.name] = [];
                }
                acc[room.name].push(room);
                return acc;
              }, {});

              console.log("Grouped Rooms data:", grouped);
              setGroupedRooms(grouped);
            } else {
              setGroupedRooms({});
              console.log("No rooms data available:", data);
            }
          },
          roomListFetched
        );
      } catch (err) {
        setError(
          "An error occurred while fetching hotel details. Please try again."
        );
        console.error("Error fetching hotel details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId, currencyCode]);

  const handleBookRoom = (room, isAllInclusive) => {
    setSelectedRoom({
      ...room,
      isAllInclusive,
      totalPrice: isAllInclusive ? room.allInclusivePrice : room.price
    });
    setIsBookingConfirmationOpen(true);
  };

  const renderRoomGroup = (roomName, rooms) => {
    const validRooms = rooms.filter(room => 
      room.bed_configurations && 
      room.bed_configurations.length > 0 && 
      room.facilities && 
      room.facilities.length > 0
    );

    if (validRooms.length === 0) {
      return null;
    }

    return (
      <AccordionItem value={roomName} key={roomName}>
        <AccordionTrigger>{roomName}</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validRooms.map((room, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>
                    {room.price && room.currency ? (
                      <div>
                        <span className="font-semibold text-xl">
                          Price: {room.currency} {room.price}
                        </span>
                        {room.allInclusivePrice && room.allInclusivePrice !== room.price && (
                          <div className="text-sm text-muted-foreground">
                            All Inclusive: {room.currency} {room.allInclusivePrice}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Price not available</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full mb-6">
                    <CarouselContent>
                      {room.photos && room.photos.map((photo, photoIndex) => (
                        <CarouselItem
                          key={photoIndex}
                          className="md:basis-1/2 lg:basis-1/3"
                        >
                          <img
                            src={photo.url_original}
                            alt={`Room photo ${photoIndex + 1}`}
                            className={`aspect-${photo.ratio} rounded-lg`}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.highlights && room.highlights.map((highlight, i) => (
                      <Badge key={i} variant="outline">
                        {highlight.translated_name}
                      </Badge>
                    ))}
                  </div>
                  <p className="font-bold mb-2">Bed Configuration:</p>
                  <ul className="list-disc list-inside mb-4">
                    {room.bed_configurations && room.bed_configurations[0]?.bed_types.map((bed, i) => (
                      <li key={i}>{bed.name_with_count}</li>
                    ))}
                  </ul>
                  <p className="font-bold mb-2">Facilities:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {room.facilities && room.facilities.map((facility, i) => (
                      <Badge key={i} variant="secondary">
                        {facility.name === "Free WiFi" && <Wifi className="w-4 h-4 mr-1" />}
                        {facility.name === "Tea/Coffee maker" && <Coffee className="w-4 h-4 mr-1" />}
                        {facility.name === "TV" && <Tv className="w-4 h-4 mr-1" />}
                        {facility.name === "Air conditioning" && <AirVent className="w-4 h-4 mr-1" />}
                        {facility.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 space-x-2">
                    <Button onClick={() => handleBookRoom(room, false)}>Book Now</Button>
                    {room.allInclusivePrice && room.allInclusivePrice !== room.price && (
                      <Button onClick={() => handleBookRoom(room, true)}>Book All Inclusive</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !hotelData) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        {error || "Failed to load hotel details"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-5">
      <h1 className="text-3xl font-bold mb-6">{hotelData.name}</h1>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/2">
          <Carousel className="w-full max-w-xl">
            <CarouselContent>
              {hotelPhotos.map((photo, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <img
                    src={photo.url_1440}
                    alt={`Hotel photo ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <Card className="md:w-1/2">
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{hotelData.address}</p>
            <p className="mb-2">
              {hotelData.city}, {hotelData.country}
            </p>
            <div className="flex items-center mb-2">
              {[...Array(Math.floor(hotelData.review_score / 2))].map(
                (_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                )
              )}
              <span className="ml-2">
                {hotelData.review_score} ({hotelData.review_nr} reviews)
              </span>
            </div>
            <p>{hotelData.description_translations?.en}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedRooms)
              .filter(([_, rooms]) => rooms.some(room => 
                room.bed_configurations && 
                room.bed_configurations.length > 0 && 
                room.facilities && 
                room.facilities.length > 0
              ))
              .map(([roomName, rooms]) => renderRoomGroup(roomName, rooms))
            }
          </Accordion>
        </CardContent>
      </Card>
      <Dialog open={isBookingConfirmationOpen} onOpenChange={setIsBookingConfirmationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please confirm your room booking details.
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="mt-4">
              <p><strong>Room:</strong> {selectedRoom.name}</p>
              <p><strong>Price:</strong> {selectedRoom.currency} {selectedRoom.totalPrice}</p>
              <p><strong>Type:</strong> {selectedRoom.isAllInclusive ? 'All Inclusive' : 'Standard'}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsBookingConfirmationOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // Handle booking confirmation here
              setIsBookingConfirmationOpen(false);
              // You might want to show a success message or redirect the user
            }}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}