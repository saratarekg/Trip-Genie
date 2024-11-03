import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import defaultImage from "../assets/images/default-image.jpg";
import { Link } from "react-router-dom";

export function HistoricalPlaces() {
  const [places, setPlaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);

  // Number of visible slides (4 cards at a time)
  const visibleSlides = 4;

  useEffect(() => {
    const fetchHistoricalPlaces = async () => {
      try {
        const token = Cookies.get("jwt");
        let role = Cookies.get("role");
        if (role === undefined) role = "guest";
        const api = `http://localhost:4000/${role}/historical-places`;
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlaces(response.data.slice(0, 10));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHistoricalPlaces();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < places.length - visibleSlides ? prevIndex + 1 : prevIndex
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : prevIndex);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full sm:w-1/2">
          <h1 className="text-3xl font-bold">Historical Places</h1>
          <hr className="border-red-500 w-1/2 mb-3 mt-1 border-t-2" />
          <p className="text-gray-600 mt-2 mb-8">
            Explore the world's most captivating historical landmarks, where rich cultural heritage and architectural wonders come to life. Each destination tells a story of the past, offering a unique journey through history. Plan your adventure today!
          </p>
        </div>

        <Link to="/all-historical-places">
          <Button
            variant="primary"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            View More
          </Button>
        </Link>
      </div>

      {/* Slider container with relative positioning */}
      <div className="relative px-12">
        {/* Navigation Buttons - Positioned absolutely on the sides */}
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentIndex === 0}
          aria-label="Previous place"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentIndex >= places.length - visibleSlides}
          aria-label="Next place"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Overflow container */}
        <div className="overflow-hidden px-4">
          {/* Sliding content */}
          <div
            className="flex transition-transform duration-300 bg-white"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleSlides)}%)`,
            }}
          >
            {places.map((place, index) => (
              <Link
                to={`/historical-place/${place._id}`}
                key={place._id}
                className="w-full min-w-[25%] px-3 transition-all duration-300 group"
                style={{
                  transform: index < currentIndex ? 'scale(0)' : 'scale(1)',
                  opacity: index < currentIndex ? 0 : 1,
                }}
              >
                <div className="mt-8 cursor-pointer relative aspect-[3/4] rounded-lg hover:-translate-y-8 transition-transform duration-300">
                  <img
                    src={Array.isArray(place.pictures) && place.pictures.length > 0
                      ? place.pictures[0]
                      : defaultImage}
                    alt={place.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{place.title}</h3>
                    <p className="flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {place.location.city}, {place.location.country}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}