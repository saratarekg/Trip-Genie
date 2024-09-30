import React from "react";
import TravelHero from "./TravelHero.jsx";
import { HistoricalPlacesComponent } from "./HistoricalPlaces.jsx";
import { ItineraryCards } from "./ItineraryCards.jsx";

const Home = () => {
  return (
    <>
      {" "}
      <div className="flex flex-col justify-center items-center">
        <TravelHero />
        <HistoricalPlacesComponent/>
        <ItineraryCards/>
      </div>
    </>
  );
};

export default Home;
