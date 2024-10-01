import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar1 from './components/Navbar1.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/login.jsx';
import SellerList from './components/SellerList.jsx';
import ActivityList from './components/ActivityListAdvertiser.jsx';
import ItineraryList from './components/ItineraryListTourGuide.jsx';
import HistoricalPlaceList from './components/HistoricalPlaceListGovernor.jsx';
import Tghome from './components/TourGuideHome.jsx';
import Hero from './components/Hero.jsx';
import { NavbarComponent } from './components/navbar.jsx';
import { FooterComponent } from './components/footer.jsx';
import { AllItinerariesComponent } from './components/all-trip-plans.jsx';

function App() {
  return (
    <div className="App">
      <Router>
      <NavbarComponent/> 


      {/* {isLoginPage ? null : <Navbar />} */}
      <div className='pages'>
          <Routes>
            <Route path='/' element={<Home />} />
            {/* <Route path='/tour-guide-home' element={<Tghome />} /> */}
            <Route path='/login' element={<Login />} />
            <Route path='/seller' element={<SellerList />} />
            <Route path = '/activity' element = {<ActivityList/>}/>
            <Route path = '/all-itineraries' element = {<AllItinerariesComponent/>}/>
            {/* <Route path = '/museums' element = {<HistoricalPlaceList/>}/> */}
          </Routes>
        </div>
      </Router>
      <FooterComponent/>
    </div>
  );
}

export default App;
