import React, { useEffect, useState } from "react";
import line1 from "../assets/images/line-1.svg";
import rating from "../assets/images/rating.svg";
import Cookies from 'js-cookie'
import axios from 'axios'


export const ItineraryCards = () => {
  const [itineraries, setItineraries] = useState([]);
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const token = Cookies.get('jwt')
        const response = await axios.get("http://localhost:4000/tourist/itineraries", {
          headers: {
            Authorization: `Bearer ${token}`,
        }} );
        const data = await response.data.slice(0, 4);
        setItineraries(data);
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className="flex items-center gap-[100px] pl-[182px] pr-0 py-[140px] relative">
      <div className="inline-flex items-center gap-8 relative flex-[0_0_auto]">
        <div className="inline-flex flex-col items-center justify-center gap-8 relative flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Playfair_Display-Regular',Helvetica] font-normal text-[#172432] text-[64px] tracking-[0] leading-[normal]">
              Itineraries
            </div>
            <img className="relative w-[231px] h-[3px]" alt="Line" src={line1} />
          </div>
          <p className="relative self-stretch [font-family:'Rubik-Regular',Helvetica] font-normal text-[#767e86] text-lg tracking-[0] leading-[normal]">
            20 years from now you will be more disappointed by the things that you didn’t do. Stop regretting and start
            travelling, start throwing off the bowlines.
          </p>
          <button className="all-[unset] box-border inline-flex items-center justify-center p-5 absolute top-[271px] left-10 bg-[#ff7757] rounded-xl">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Rubik-Regular',Helvetica] font-normal text-white text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              View all trip plans
            </div>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-8 relative flex-1 grow">
        {itineraries.map((itinerary) => (
          <div key={itinerary._id} className="relative w-[300px] h-[399px] bg-[#00000033] rounded-[26px]">
            <div className="flex flex-col items-start justify-end gap-3 px-5 py-5 relative h-full">
              <div className="flex items-start justify-between relative self-stretch w-full">
                <div className="relative [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg whitespace-nowrap">
                  {itinerary.title}
                </div>
                <div className="relative [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg whitespace-nowrap">
                  €{itinerary.price}/Day
                </div>
              </div>
              <div className="relative [font-family:'Playfair_Display-SemiBold',Helvetica] font-semibold text-[#172432] text-[20px]">
                {itinerary.description}
              </div>
              <div className="flex items-start justify-between relative self-stretch w-full">
                <img className="relative flex-[0_0_auto]" alt="Rating" src={rating} />
                <div className="relative w-fit [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg whitespace-nowrap">
                  {itinerary.availableDates.length > 0 
                    ? new Date(itinerary.availableDates[0].date).toLocaleDateString() 
                    : "No dates available"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
