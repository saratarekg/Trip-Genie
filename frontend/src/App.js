import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

// pages and components
import Home from './pages/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
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
