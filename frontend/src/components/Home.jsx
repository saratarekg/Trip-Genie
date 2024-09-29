import React from 'react'
import TravelHero from './TravelHero.jsx'
import { HistoricalPlacesComponent } from './HistoricalPlaces.jsx';

const Home = () => {
  return (
    <>    <div >
      <TravelHero></TravelHero>

    </div>
      <div>
        <HistoricalPlacesComponent />
      </div></>

  )
}

export default Home
