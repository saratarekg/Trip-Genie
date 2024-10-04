import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ItineraryDetail from './ItineraryDetail.jsx';
import FilterComponent from './Filter.jsx'; 
import defaultImage from "../assets/images/default-image.jpg";
import axios from 'axios';

const ItineraryCard = ({ itinerary, onSelect }) => (
  <div className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"   onClick={() => onSelect(itinerary)}>
    
        <div className="overflow-hidden">
          <img
            src={itinerary.activities &&
            itinerary.activities.length > 0 &&
            itinerary.activities[0].pictures &&
            itinerary.activities[0].pictures.length > 0
              ? itinerary.activities[0].pictures[0]
              : defaultImage}
            alt={itinerary.title}
            className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="p-4 ">
          <h3 className="text-xl font-semibold mt-2">{itinerary.title}</h3>
          <h3 className="text-sm mt-2 text-gray-700">{itinerary.description}</h3>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold text-blue-600">€{itinerary.price}/Day</span>
            <span className="text-sm text-gray-500">
              {itinerary.language} 
            </span>
          </div>
        </div>
      </div>
  );
  

export function AllItinerariesComponent() {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [dateRange, setDateRange] = useState({ lower: '', upper: '' });
  const [type, setType] = useState('');
  const [language, setLanguage] = useState('');
  const tripsPerPage = 6;
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [typesOptions, setTypesOptions] = useState([]); 
  const [languagesOptions, setLanguagesOptions] = useState([]); 


  const getUserRole = () => {
    let role = Cookies.get('role');
    if (!role) role = 'guest';
    return role;
  };

  

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      console.log('Fetching Languages');
      try {
        const response = await axios.get('http://localhost:4000/api/getAllLanguages');
        console.log('Languages:', response.data);
        setLanguagesOptions(response.data);
      }catch(error){
        console.error('Error fetching Languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    // Fetch types from the backend
    const fetchType = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/getAllTypes');
        console.log('Type:', response.data);
        setTypesOptions(response.data);
      }catch(error){
        console.error('Error fetching Type:', error);
      }
    };
    fetchType();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchItineraries();
      } else {
        fetchItineraries();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchItineraries = async () => {
    try {
      const token = Cookies.get('jwt');
      const role = getUserRole();
      const response = await fetch(
        `http://localhost:4000/${role}/itineraries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItineraries(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setError('Error fetching itineraries');
      setItineraries([]);
    }
  };

  const searchItineraries = async () => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/itineraries`);
  
      // Add the search term and filter parameters
      if (searchTerm) {
        url.searchParams.append('searchBy', searchTerm);
      }
      if (price && price !== '') {
        url.searchParams.append('budget', price);
      }
      
      if (dateRange.upper) {
        url.searchParams.append('upperDate', dateRange.upper);
      }
      if (dateRange.lower) {
        url.searchParams.append('lowerDate', dateRange.lower);
      }
      if (type) {
        url.searchParams.append('types', type);
      }
      if (language) {
        url.searchParams.append('languages', language);
      }
  
      const token = Cookies.get('jwt');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      setItineraries(data);
      setError(null);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching filtered results:', error);
      setError('Error fetching filtered results');
      setItineraries([]);
    }
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const sortItineraries = (key) => {
    const sortedItineraries = [...itineraries].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    setItineraries(sortedItineraries);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      {selectedItinerary ? (
        <>
          <button
            onClick={() => setSelectedItinerary(null)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="mr-1" /> Back to All Itineraries
          </button>
          <ItineraryDetail itinerary={selectedItinerary} />
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">All Trip Plans</h1>

          <div className="flex flex-col mb-8">
            <div className="relative w-full mb-4">
              <input
                type="text"
                placeholder="Search trips..."
                className="w-full pl-10 pr-4 py-2 border rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <FilterComponent
              filtersVisible={filtersVisible}
              toggleFilters={toggleFilters}
              sortOrder={sortOrder}
              sortItineraries={sortItineraries}
              price={price}
              setPrice={setPrice}
              dateRange={dateRange}
              setDateRange={setDateRange}
              type={type}
              setType={setType}
              language={language}
              setLanguage={setLanguage}
              searchItineraries={searchItineraries}
              typesOptions={typesOptions}   // Passing the fetched types
              languagesOptions={languagesOptions} // Passing the fetched languages
            />
          </div>

          {error ? (
            <div className="text-red-600 mb-4">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {itineraries
                  .slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage)
                  .map((itinerary) => (
                    <ItineraryCard
                      key={itinerary.id}
                      itinerary={itinerary}
                      onSelect={(itinerary) => setSelectedItinerary(itinerary)}
                    />
                  ))}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-full ${currentPage === 1 ? 'opacity-50' : ''}`}
                >
                  <ChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {Math.ceil(itineraries.length / tripsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(itineraries.length / tripsPerPage)))}
                  disabled={currentPage === Math.ceil(itineraries.length / tripsPerPage)}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-full ${
                    currentPage === Math.ceil(itineraries.length / tripsPerPage) ? 'opacity-50' : ''
                  }`}
                >
                  <ChevronRight />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  </div>
  );
}
