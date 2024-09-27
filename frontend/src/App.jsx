import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';

function App() {
  return (
    <div className="App">
      <Router>
      <Navbar/> 
      {/* {isLoginPage ? null : <Navbar />} */}
      <div className='pages'>
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
