import React from 'react'
import TravelHero from '../components/TravelHero.jsx'
import { HistoricalPlaces } from '../components/HistoricalPlacesSlider.jsx';
import {Activities} from '../components/ActivitiesSlider.jsx'

const Home = () => {
  return (
    <>    
      <div className='text-5xl uppercase'>
        <TravelHero></TravelHero>
      </div>
      <div>
        <HistoricalPlaces />
      </div>
      <div>
        <Activities />
      </div>
    </>

  )
}

export default Home
