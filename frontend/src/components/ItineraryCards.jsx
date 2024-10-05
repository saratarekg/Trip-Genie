import React, { useEffect, useState } from "react";
import line1 from "../assets/images/line-1.svg";
import rating from "../assets/images/rating.svg";
import Cookies from "js-cookie";
import axios from "axios";
import defaultImage from "../assets/images/default-image.jpg";
import { Link } from "react-router-dom";
import Loader from "./Loader.jsx";

export const ItineraryCards = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const token = Cookies.get("jwt");
        let role = Cookies.get("role");
        if (role === undefined) role = "guest";
        const response = await axios.get(
          `http://localhost:4000/${role}/itineraries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.data.slice(0, 6);
        setItineraries(data);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row">
      {/* Left Side: Itineraries Title, Line, Description, Button */}
      <div className="w-full md:w-1/2 pr-8 mb-8 md:mb-0">
        <h2 className="text-3xl font-bold mb-6">Itineraries</h2>
        <hr className="border-red-500 w-1/2 mb-3 mt-1 border-t-2" />
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
        Discover our curated itineraries designed for every traveler, blending cultural experiences with thrilling adventures. From serene escapes to adrenaline-filled expeditions, our diverse journeys cater to all preferences. Let us turn your travel dreams into reality!
         </p>

        <div className="flex justify-center">
  <Link to="/all-itineraries">
    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-medium">
      View all itineraries
    </button>
  </Link>
</div>

      </div>

      {/* Right Side: Itineraries Cards */}
      <div className="w-full md:w-3/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => {
          const activityImage =
            itinerary.activities &&
            itinerary.activities.length > 0 &&
            itinerary.activities[0].pictures &&
            itinerary.activities[0].pictures.length > 0
              ? itinerary.activities[0].pictures[0]
              : defaultImage;

          return (
            <div
              key={itinerary._id}
              className="group relative bg-cover bg-center rounded-[26px] p-5 overflow-hidden"
              style={{
                width: "100%",
                height: "300px",
                backgroundImage: `url(${activityImage})`,
              }}
            >
              {/* Gradient Overlay - hidden initially */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#002845] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              ></div>

              {/* Itinerary content - hidden and slides up on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-full transition-transform duration-500 group-hover:translate-y-0"
              >
                <div className="flex justify-between">
                  <div className="font-normal text-lg">
                    {itinerary.title}
                  </div>
                  <div className="font-normal text-lg">
                    €{itinerary.price}/Day
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <div className="font-normal text-lg">
                    {itinerary.availableDates.length > 0
                      ? new Date(
                          itinerary.availableDates[0].date
                        ).toLocaleDateString()
                      : "No dates available"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};