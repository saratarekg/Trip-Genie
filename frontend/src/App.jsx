import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Login from './components/login.jsx';
import SellerList from './components/SellerList.jsx';
import ActivityList from './components/ActivityList.jsx';

function App() {
  return (
    <div className="App">
      <Router>
      <Navbar/> 
      {/* {isLoginPage ? null : <Navbar />} */}
      <div className='pages'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/seller' element={<SellerList />} />
            <Route path = '/activity' element = {<ActivityList/>}/>

          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
