import React from "react";
import TravelHero from "../components/TravelHero.jsx";
import { HistoricalPlaces } from "../components/HistoricalPlacesSlider.jsx";
import { Activities } from "../components/ActivitiesSlider.jsx";
import { ItineraryCards } from "../components/ItineraryCards.jsx";
import Cookies from "js-cookie";

const Home = () => {
  let role = Cookies.get("role");
  if (role === undefined) role = "guest";

  return (
    
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
      <TravelHero/>
      {/* if i am  a tour guide i can't view historical places */}
      {/* {role !== 'tour-guide' &&
      <HistoricalPlaces />
      } */}

      <HistoricalPlaces />
      
      <Activities />
      <ItineraryCards />
      </div>
    </>
  );
};

export default Home;
