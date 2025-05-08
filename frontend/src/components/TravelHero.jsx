import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Clock, Mountain, Twitter, Instagram, Facebook, ArrowRight, Sun, Leaf, Umbrella, Camera, Map, MapPin, Snowflake } from "lucide-react";
const userCluster = localStorage.getItem("cluster");

const images = [
  {
    src: "/images/travelHero(1).jpeg",
    link: "/activity/6730aa20d631fe670db3e832",
    title: "Explore The Majestic Mountains",
    icon: Mountain,
    info: "Experience breathtaking views year-round",
    bestTime: "Summer and early fall",
    destination: "Swiss Alps"
  },
  {
    src: "/images/travelHero(2).jpeg",
    link: "/activity/6730abded631fe670db3f22f",
    title: "Arctic Dog Sledding Adventure",
    icon: Snowflake,
    info: "A dog sledding journey through snowy landscapes.",
    bestTime: "Winter",
    destination: "Lapland, Finland"
  },
  {
    src: "/images/travelHero(2).jpg",
    link: "activity/6730b24bd631fe670db46def",
    title: "Chase the Aurora Borealis by 4x4",
    icon:  Leaf,
    info: "Off-road journey under the mesmerizing green skies.",
    bestTime: "Late fall to early spring",
    destination: "Icelandic Highlands"
  },
  {
    src: "/images/travelHero(3).jpg",
    link: "/activity/6730b374d631fe670db47fa2",
    title: "Paddle Through Pristine Waters",
    icon: Sun, // Adjust icon to match the activity, if needed
    info: "Serene lake perfect for an unforgettable kayaking journey.",
    bestTime: "Spring and summer",
    destination: "Lake District, UK"
  },
  {
    src: "/images/travelHero(6).jpg",
    link: "/activity/6730b4a5d631fe670db4870a",
    title: "Sail Through Majestic Peaks at Sunset",
    icon: Sun,
    info: "A tranquil boat ride framed by mountains and a breathtaking sunset.",
    bestTime: "Summer evenings",
    destination: "Lake Lucerne, Switzerland"
  },
  {
    src: "/images/travel-sam.jpg",
    link: "/activity/672905d1ed7744e2389a216c",
    title: "Picturesque Lake Among Snowy Peaks",
    icon: Snowflake,
    info: "Stunning views of a calm lake surrounded by snow-capped mountains.",
    bestTime: "Winter and early spring",
    destination: "Banff National Park, Canada"
  },
];

export default function TravelHero({  
  userRole,  
}) {
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
      {/* Image Slider */}
      {images.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
          <img
            src={image.src}
            alt={`Travel destination ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Main Content */}
      <div className="absolute inset-0">
        <div className="container mx-auto h-full px-4">
          <div className="flex h-full flex-col justify-between py-12">
            {/* Top Content */}
            <div className="ml-32 mt-32 max-w-2xl">
              <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm text-white backdrop-blur-sm">
                Feel The Experience
              </span>
              <h1 className="mb-6 text-6xl font-bold text-white">
                {images[currentImage].title}
              </h1>
              {(userRole === "tourist" || userRole === "tour-guide" || userRole === "guest") && (
  <>
    <div className="h-16"> {/* Fixed height container for button */}
      <a
        href={images[currentImage].link}
        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A3B47] transition-all duration-1000 hover:bg-white/90"
      >
        View More Details
        <ArrowRight className="ml-2 h-4 w-4" />
      </a>
    </div>
  </>
)}


            </div>

            {/* Bottom Content */}
            <div className="ml-32 flex items-end justify-start">
              <div className="flex gap-8">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="h-6 w-6" />
                  <p className="max-w-[200px] text-sm">
                    {images[currentImage].destination}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-6 w-6" />
                  <p className="max-w-[200px] text-sm">
                    Best time to visit: {images[currentImage].bestTime}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white">
                  {React.createElement(images[currentImage].icon, { className: "h-6 w-6" })}
                  <p className="max-w-[200px] text-sm">
                    {images[currentImage].info}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots and Arrows */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center justify-center space-y-2">
          <div className="group">
            <button
              onClick={() => navigate("up")}
              className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous image"
            >
              <ChevronUp className="h-4 w-4" />
              {(userCluster == "0-0" || userCluster == "1-1" ||userCluster == "3-1") &&

                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-20">
                                 Previous
                               </div>
              }
            </button>
</div>
            <div className="flex flex-col items-center space-y-2">
              {visibleDotIndices.map((index, dotPosition) => {
                const isActive = index === currentImage;
                const distanceFromActive = Math.abs(
                  dotPosition - Math.floor(visibleDotIndices.length / 2)
                );
                const size = 12 - distanceFromActive * 2;
                const opacity = 1 - distanceFromActive * 0.3;

                return (
                  <div
                    key={index}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(211, 211, 211, 0.7)",
                      opacity: opacity,
                    }}
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
<div className="group">
            <button
              onClick={() => navigate("down")}
              className="text-white opacity-50 hover:opacity-100 transition-opacity duration-300"
              aria-label="Next image"
            >
              <ChevronDown className="h-4 w-4" />
               {(userCluster == "0-0" || userCluster == "1-1" ||userCluster == "3-1") &&

                                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-20">
                                               Next
                                             </div>
                            }
                          </button>
              </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="absolute right-12 bottom-12 flex flex-col gap-4">
          <a
            href="#"
            className="text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}