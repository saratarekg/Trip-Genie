import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, Calendar, ArrowRight, AlertTriangle, TriangleAlert } from 'lucide-react';
import Cookies from "js-cookie";

const airports = [
    { code: 'CAI', name: 'Cairo International Airport', region: 'Egypt' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', region: 'France' },
    { code: 'DXB', name: 'Dubai International Airport', region: 'United Arab Emirates' },
    { code: 'JFK', name: 'John F. Kennedy International Airport', region: 'USA' },
    { code: 'LHR', name: 'Heathrow Airport', region: 'UK' },
    { code: 'HND', name: 'Tokyo Haneda Airport', region: 'Japan' },
    { code: 'PEK', name: 'Beijing Capital International Airport', region: 'China' },
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', region: 'Australia' },
    { code: 'FRA', name: 'Frankfurt Airport', region: 'Germany' },
    { code: 'SIN', name: 'Singapore Changi Airport', region: 'Singapore' },
    { code: 'AMS', name: 'Amsterdam Schiphol Airport', region: 'Netherlands' },
    { code: 'ORD', name: 'O’Hare International Airport', region: 'USA' },
    { code: 'MEX', name: 'Mexico City International Airport', region: 'Mexico' },
    { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', region: 'Brazil' },
    { code: 'HKG', name: 'Hong Kong International Airport', region: 'Hong Kong' },
    { code: 'ICN', name: 'Incheon International Airport', region: 'South Korea' },
    { code: 'JNB', name: 'O.R. Tambo International Airport', region: 'South Africa' },
    { code: 'YYZ', name: 'Toronto Pearson International Airport', region: 'Canada' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', region: 'Spain' },
    { code: 'SVO', name: 'Sheremetyevo International Airport', region: 'Russia' },
    { code: 'LAX', name: 'Los Angeles International Airport', region: 'USA' },
    { code: 'IST', name: 'Istanbul Airport', region: 'Turkey' },
    { code: 'BCN', name: 'Barcelona-El Prat Airport', region: 'Spain' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', region: 'India' },
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', region: 'USA' },
    { code: 'MUC', name: 'Munich Airport', region: 'Germany' },
    { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', region: 'Italy' },
    { code: 'DME', name: 'Domodedovo International Airport', region: 'Russia' },
  ];
  

  const cities = [
    { code: 'CAI', name: 'Cairo', region: 'Egypt' },
    { code: 'PAR', name: 'Paris', region: 'France' },
    { code: 'DXB', name: 'Dubai', region: 'United Arab Emirates' },
    { code: 'NYC', name: 'New York', region: 'USA' },
    { code: 'LON', name: 'London', region: 'UK' },
    { code: 'TKY', name: 'Tokyo', region: 'Japan' },
    { code: 'PEK', name: 'Beijing', region: 'China' },
    { code: 'SYD', name: 'Sydney', region: 'Australia' },
    { code: 'BER', name: 'Berlin', region: 'Germany' },
    { code: 'SIN', name: 'Singapore', region: 'Singapore' },
    { code: 'AMS', name: 'Amsterdam', region: 'Netherlands' },
    { code: 'CHI', name: 'Chicago', region: 'USA' },
    { code: 'MEX', name: 'Mexico City', region: 'Mexico' },
    { code: 'SAO', name: 'São Paulo', region: 'Brazil' },
    { code: 'HKG', name: 'Hong Kong', region: 'Hong Kong' },
    { code: 'SEL', name: 'Seoul', region: 'South Korea' },
    { code: 'JNB', name: 'Johannesburg', region: 'South Africa' },
    { code: 'TOR', name: 'Toronto', region: 'Canada' },
    { code: 'MAD', name: 'Madrid', region: 'Spain' },
    { code: 'MOW', name: 'Moscow', region: 'Russia' },
    { code: 'LAX', name: 'Los Angeles', region: 'USA' },
    { code: 'IST', name: 'Istanbul', region: 'Turkey' },
    { code: 'BCN', name: 'Barcelona', region: 'Spain' },
    { code: 'MUM', name: 'Mumbai', region: 'India' },
    { code: 'ATL', name: 'Atlanta', region: 'USA' },
    { code: 'MUN', name: 'Munich', region: 'Germany' },
    { code: 'ROM', name: 'Rome', region: 'Italy' },
    { code: 'DME', name: 'Moscow (Domodedovo)', region: 'Russia' },
  ];  

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const BookingForm = () => {
  const userRole = Cookies.get("role") || 'guest';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('roundTrip');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [flightForm, setFlightForm] = useState({
    from: 'CAI',
    to: 'CDG',
    departDate: formatDate(new Date()),
    returnDate: formatDate(new Date(Date.now())), 
    tripType: tripType,
  });
  const [hotelForm, setHotelForm] = useState({
    city: 'CAI',
    checkIn: formatDate(new Date()),
    checkOut: formatDate(new Date(Date.now() + 86400000)), // Next day
    adults: '1',
  });

  useEffect(() => {
    // Ensure return date is after depart date
    if (new Date(flightForm.returnDate) <= new Date(flightForm.departDate)) {
      setFlightForm(prev => ({
        ...prev,
        returnDate: formatDate(new Date(new Date(prev.departDate).getTime()))
      }));
    }
  }, [flightForm.departDate, flightForm.returnDate]);

  useEffect(() => {
    // Ensure check-out date is after check-in date
    if (new Date(hotelForm.checkOut) <= new Date(hotelForm.checkIn)) {
      setHotelForm(prev => ({
        ...prev,
        checkOut: formatDate(new Date(new Date(prev.checkIn).getTime() + 86400000))
      }));
    }
  }, [hotelForm.checkIn, hotelForm.checkOut]);

  const handleFieldClick = () => {
    if (userRole === 'guest') {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  };

  const handleFlightSearch = (e) => {
    e.preventDefault();
    if (userRole === 'guest') {
      setShowLoginDialog(true);
      return;
    }
    const params = new URLSearchParams(flightForm);
    navigate(`/flights?${params.toString()}`);
  };

  const handleHotelSearch = (e) => {
    e.preventDefault();
    if (userRole === 'guest') {
      setShowLoginDialog(true);
      return;
    }
    const params = new URLSearchParams(hotelForm);
    navigate(`/hotels?${params.toString()}`);
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: '#1A3B47',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    tabsContainer: {
      display: 'flex',
      backgroundColor: '#388A94',
      padding: '10px 10px 0',
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      cursor: 'pointer',
      border: 'none',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      color: '#E6DCCF',
      backgroundColor: 'transparent',
      fontSize: '14px',
      marginRight: '4px',
      transition: 'background-color 0.3s, color 0.3s',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#888',
      },
    activeTab: {
      backgroundColor: 'white',
      color: '#388A94',
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '20px',
      transition: 'opacity 0.3s',
    },
    form: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
    },
    fieldGroup: {
      flex: 1,
      minWidth: '150px',
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px',
    },
    select: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
    },
    locationDisplay: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '4px',
    },
    locationSubtext: {
      fontSize: '12px',
      color: '#666',
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#1A3B47',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      alignSelf: 'flex-end',
      marginTop: '24px',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '380px',
        width: '100%',
        position: 'relative', // for close button positioning
      },
      modalButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
      },
  };

  const renderLocationDisplay = (code, type) => {
    const list = type === 'flight' ? airports : cities;
    const location = list.find(item => item.code === code);
    return location ? (
      <>
        <div style={styles.locationDisplay}>{location.name}</div>
        <div style={styles.locationSubtext}>{location.code}, {location.region}</div>
      </>
    ) : null;
  };

  return (
    <div className="mx-auto px-24 mb-24">
    <div className="text-center max-w-2xl mx-auto mb-4">
    <h1 className="text-4xl font-bold text-[#1A3B47] mb-4">Book Flights and Hotels</h1>
    <p className="text-[#1A3B47] mb-8">
    Discover seamless travel planning with our booking options for flights and hotels. Whether you're traveling for leisure or business, find the best deals, plan your perfect stay, and make your journey unforgettable. Start booking today!
    </p>
  </div>
    <div style={styles.container}>
      <div style={styles.tabsContainer}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'flights' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('flights')}
        >
          <Plane size={16} /> Flight
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'hotels' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('hotels')}
        >
          <Building2 size={16} /> Hotel
        </button>
      </div>

      <div style={{
        ...styles.formContainer,
        opacity: activeTab === 'flights' ? 1 : 0,
        position: activeTab === 'flights' ? 'static' : 'absolute',
        pointerEvents: activeTab === 'flights' ? 'auto' : 'none',
      }}>
        <form onSubmit={handleFlightSearch} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>TRIP TYPE</label>
            <select
              style={styles.select}
              value={tripType}
              onChange={(e) => handleFieldClick() && setTripType(e.target.value)}
            >
              <option value="roundTrip">Round Trip</option>
              <option value="oneWay">One Way</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>FROM</label>
            <select
              style={styles.select}
              value={flightForm.from}
              onChange={(e) => handleFieldClick() && setFlightForm({ ...flightForm, from: e.target.value })}
              required
            >
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code}) - {airport.region}
                </option>
              ))}
            </select>
            {renderLocationDisplay(flightForm.from, 'flight')}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>TO</label>
            <select
              style={styles.select}
              value={flightForm.to}
              onChange={(e) => handleFieldClick() && setFlightForm({ ...flightForm, to: e.target.value })}
              required
            >
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code}) - {airport.region}
                </option>
              ))}
            </select>
            {renderLocationDisplay(flightForm.to, 'flight')}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>DEPARTURE</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                style={styles.input}
                value={flightForm.departDate}
                min={formatDate(new Date())}
                onChange={(e) => handleFieldClick() && setFlightForm({ ...flightForm, departDate: e.target.value })}
                required
              />
              {/* <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
            </div>
            <div style={styles.locationDisplay}>
              {new Date(flightForm.departDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>

          {tripType === 'roundTrip' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>RETURN</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  style={styles.input}
                  value={flightForm.returnDate}
                  min={flightForm.departDate}
                  onChange={(e) => handleFieldClick() && setFlightForm({ ...flightForm, returnDate: e.target.value })}
                  required
                />
                {/* <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
              </div>
              <div style={styles.locationDisplay}>
                {new Date(flightForm.returnDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
            </div>
          )}

          <button type="submit" style={styles.button}>
            Search Flights <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <div style={{
        ...styles.formContainer,
        opacity: activeTab === 'hotels' ? 1 : 0,
        position: activeTab === 'hotels' ? 'static' : 'absolute',
        pointerEvents: activeTab === 'hotels' ? 'auto' : 'none',
      }}>
        <form onSubmit={handleHotelSearch} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>CITY</label>
            <select
              style={styles.select}
              value={hotelForm.city}
              onChange={(e) => handleFieldClick() && setHotelForm({ ...hotelForm, city: e.target.value })}
              required
            >
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name} ({city.code}) - {city.region}
                </option>
              ))}
            </select>
            {renderLocationDisplay(hotelForm.city, 'hotel')}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>CHECK IN</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                style={styles.input}
                value={hotelForm.checkIn}
                min={formatDate(new Date())}
                onChange={(e) => handleFieldClick() && setHotelForm({ ...hotelForm, checkIn: e.target.value })}
                required
              />
              {/* <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
            </div>
            <div style={styles.locationDisplay}>
              {new Date(hotelForm.checkIn).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>CHECK OUT</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                style={styles.input}
                value={hotelForm.checkOut}
                min={hotelForm.checkIn}
                onChange={(e) => handleFieldClick() && setHotelForm({ ...hotelForm, checkOut: e.target.value })}
                required
              />
              {/* <Calendar size={16} style={{ position: 'absolute',   right: '8px', top: '8px', pointerEvents: 'none' }} /> */}
            </div>
            <div style={styles.locationDisplay}>
              {new Date(hotelForm.checkOut).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ADULTS</label>
            <select
              style={styles.select}
              value={hotelForm.adults}
              onChange={(e) => handleFieldClick() && setHotelForm({ ...hotelForm, adults: e.target.value })}
              required
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>
            Search Hotels <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {showLoginDialog && (
  <div style={styles.modal}>
    <div style={styles.modalContent}>
      {/* Close button */}
      <button 
        onClick={() => setShowLoginDialog(false)} 
        className="absolute top-3 right-6 text-gray-500 hover:text-gray-800 text-2xl"
      >
        &times;
      </button>

      {/* Icon and Header Row */}
      <div className="flex items-center mb-4">
        <TriangleAlert className="text-[#F88C33] w-6 h-6 mr-2" />
        <h1 className="font-bold text-2xl">Login Required</h1>
      </div>

      <p>Please login first or sign up if you don't have an account.</p>

      {/* Buttons */}
      <div style={styles.modalButtons}>
        <button 
          onClick={() => navigate('/login')} 
          style={{ ...styles.button, backgroundColor:'#388A94' , border: '1px solid #388A94'}}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/sign-up')}
          style={{ ...styles.button, backgroundColor: 'white', color: '#388A94', border: '1px solid #388A94', marginRight: '20px' }}
        >
          Sign Up
        </button>
      </div>
    </div>
  </div>
)}

    </div>
    </div>
  );
};

export { BookingForm };