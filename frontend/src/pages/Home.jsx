import React from "react";
import TravelHero from "../components/TravelHero.jsx";
import { HistoricalPlaces } from "../components/HistoricalPlacesSlider.jsx";
import { Activities } from "../components/ActivitiesSlider.jsx";
import { ItineraryCards } from "../components/ItineraryCards.jsx";
import Cookies from "js-cookie";
import { ProductViewer } from "../components/ProductView.jsx";

const Home = () => {
  let role = Cookies.get("role");
  if (role === undefined) role = "guest";

  return (
    
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
      <TravelHero/>
      {role === "guest" && (
        <>
          <HistoricalPlaces />
          <Activities />
          <ItineraryCards />
          <ProductViewer />
        </>
      )}

      {role === "tourist" && (
         <>
         <HistoricalPlaces />
         <Activities />
         <ItineraryCards />
         <ProductViewer />
       </>
      )}

{role === "tourism-governor" && (
         <>
         <HistoricalPlaces />
       </>
      )}
      {role === "admin" && (
         <>
         <HistoricalPlaces />
         <Activities />
         <ItineraryCards />
         <ProductViewer />
       </>
      )}
      {role === "advertiser" && (
         <>
         <Activities />
        
       </>
      )}
      {role === "seller" && (
         <>
         
         <ProductViewer />
       </>
      )}

{role === "tour-guide" && (
         <>
         <Activities />
         <ItineraryCards />
       </>
      )}
      
      </div>
    </>
  );
};

export default Home;
