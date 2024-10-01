import React, { useEffect, useState } from "react";
import line1 from "../assets/images/line-1.svg";
import rating from "../assets/images/rating.svg";
import Cookies from "js-cookie";
import axios from "axios";
import defaultImage from "../assets/images/default-image.jpg"; // Import your default image
import { Link } from "react-router-dom";

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
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-[100px] px-4 md:px-16 lg:px-[182px] py-[140px]">
      {/* Left Side: Itineraries Title, Line, Description, Button */}
      <div className="flex flex-col gap-5 flex-[1] max-w-full lg:max-w-[20%]">
        <div className="relative">
          <h1 className="text-[#172432] text-[40px] md:text-[64px] [font-family:'Playfair_Display-Regular',Helvetica]">
            Itineraries
          </h1>
          <img
            className="w-[150px] md:w-[231px] h-[2px] md:h-[3px] mt-2"
            alt="Line"
            src={line1}
          />
        </div>
        <p className="[font-family:'Rubik-Regular',Helvetica] text-[#767e86] text-base md:text-lg leading-[normal]">
          20 years from now you will be more disappointed by the things that you
          didn’t do. Stop regretting and start travelling, start throwing off
          the bowlines.
        </p>
        <Link to="/all-itineraries">
        <button className="self-start bg-[#ff7757] text-white text-sm md:text-lg p-4 md:p-5 rounded-xl mt-4 lg:mt-8 hover:bg-orange-600 bg-orange-500">
          View all itineraries
        </button>
        </Link>
      </div>

      {/* Right Side: Itineraries Cards */}
      <div className="flex flex-wrap gap-6">
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
                width: "250px",
                height: "350px",
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
                  <div className="[font-family:'Rubik-Regular',Helvetica] font-normal text-lg">
                    {itinerary.title}
                  </div>
                  <div className="[font-family:'Rubik-Regular',Helvetica] font-normal text-lg">
                    €{itinerary.price}/Day
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <div className="[font-family:'Rubik-Regular',Helvetica] font-normal text-lg">
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
