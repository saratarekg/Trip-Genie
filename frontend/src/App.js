import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import SellerList from './pages/SellerList';
import Login from './pages/Login';
import ActivityList from './components/ActivityList';


function App() {
  return (
    <div className="App">
      <Router>
      <Navbar/> 
      {/* {isLoginPage ? null : <Navbar />} */}
      <div className='pages'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/seller' element={<SellerList />} />
            <Route path='/activity' element={<ActivityList />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
