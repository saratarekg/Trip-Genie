import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const images = [
  "/images/travelHero(1).jpeg",
  "/images/travelHero(2).jpeg",
  "/images/travelHero(2).jpg",
  "/images/travelHero(3).jpg",
  "/images/travelHero(6).jpg",
  "/images/travel-sam.jpg",
];

export default function TravelHero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (direction) => {
    setCurrentImage((prev) => {
      if (direction === "up") {
        return prev === 0 ? images.length - 1 : prev - 1;
      } else {
        return (prev + 1) % images.length;
      }
    });
  };

  const getVisibleDotIndices = () => {
    const totalDots = 5;
    const half = Math.floor(totalDots / 2);
    const indices = [];

    for (let i = -half; i <= half; i++) {
      indices.push((currentImage + i + images.length) % images.length);
    }

    return indices;
  };

  const visibleDotIndices = getVisibleDotIndices();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={`Travel destination ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Overlay Text */}
      <div className="absolute inset-0 bg-black bg-opacity-40">
        <div className="container mx-auto h-full px-4">
          <div className="flex h-[calc(100%-5rem)] flex-col justify-between">
            <div className="mt-20 max-w-2xl">
              <h1 className="mb-4 text-5xl font-bold text-white">
                Start your unforgettable journey with us.
              </h1>
              <p className="text-xl text-white">
                The best travel for your journey begins now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Up Button */}
          <button
            onClick={() => navigate("up")}
            className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous image"
          >
            <ChevronUp size={18} />
          </button>

          {/* Dots */}
          <div className="flex flex-col items-center space-y-2">
            {visibleDotIndices.map((index, dotPosition) => {
              const isActive = index === currentImage;
              const distanceFromActive = Math.abs(
                dotPosition - Math.floor(visibleDotIndices.length / 2)
              );

              // Determine size and transparency based on proximity to the active dot
              const size = 12 - distanceFromActive * 2; // Active dot is largest, surrounding dots smaller
              const opacity = 1 - distanceFromActive * 0.3; // Active dot fully opaque, surrounding dots more transparent

              return (
                <div
                  key={index}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 1)" // Active dot is white
                      : "rgba(211, 211, 211, 0.7)", // Inactive dots are very light grey
                    opacity: opacity,
                  }}
                  aria-label={`Image ${index + 1} of ${images.length}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentImage(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setCurrentImage(index);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Down Button */}
          <button
            onClick={() => navigate("down")}
            className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300"
            aria-label="Next image"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
