import React from "react";
import TravelHero from "../components/TravelHero.jsx";
import { HistoricalPlaces } from "../components/HistoricalPlacesSlider.jsx";
import { Activities } from "../components/ActivitiesSlider.jsx";
import { ItineraryCards } from "../components/ItineraryCards.jsx";

const Home = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
      <TravelHero/>
      <HistoricalPlaces />
      <Activities />
      <ItineraryCards />
      </div>
    </>
  );
};

export default Home;
