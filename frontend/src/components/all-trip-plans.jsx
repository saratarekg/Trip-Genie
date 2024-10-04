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
  const [sortOrder, setSortOrder] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [dateRange, setDateRange] = useState({ lower: '', upper: '' });
  const [selectedTypes, setSelectedTypes] = useState([]); // Changed to selectedTypes array
  const [selectedLanguages, setSelectedLanguages] = useState([]); // Changed to selectedLanguages array
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

  useEffect(() => {
    if (sortBy) {
      searchItineraries();
    }
  }, [sortBy, sortOrder]);


  const handleSort = (attribute) => {
    const newSortOrder = sortOrder === 1 ? -1 : 1;
    setSortBy(attribute);
    setSortOrder(newSortOrder);
    searchItineraries(); // Call this to fetch sorted itineraries
  };
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
  const clearFilters = () => {
    // Reset all filter states to initial values
    setSearchTerm('');
    setPrice('');
    setDateRange({ lower: '', upper: '' });
    setType('');
    setLanguage('');
    setSortBy('');
    setSortOrder('');
    
    // Fetch itineraries without any filters
    fetchItineraries();
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
      if (selectedTypes.length > 0) {
        url.searchParams.append('types', selectedTypes.join(',')); // Multiple types as a comma-separated string
      }
      if (selectedLanguages.length > 0) {
        url.searchParams.append('languages', selectedLanguages.join(',')); // Multiple languages as a comma-separated string
      }

  // Add sorting parameters
  if (sortBy) {
    url.searchParams.append('sort', sortBy);
  }
  if (sortOrder) {
    url.searchParams.append('asc', sortOrder);
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
  
  // Handle type and language selections
  const handleTypeSelection = (option) => {
    setSelectedTypes(prev => 
      prev.includes(option) ? prev.filter(type => type !== option) : [...prev, option]
    );
  };

  const handleLanguageSelection = (option) => {
    setSelectedLanguages(prev => 
      prev.includes(option) ? prev.filter(lang => lang !== option) : [...prev, option]
    );
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
              sortBy={sortBy}
              handleSort={handleSort}
              clearFilters={clearFilters}
              // sortItineraries={sortItineraries}
              price={price}
              setPrice={setPrice}
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedTypes={selectedTypes} // Pass selectedTypes array
              setSelectedTypes={setSelectedTypes} // Pass setSelectedTypes function
              selectedLanguages={selectedLanguages} // Pass selectedLanguages array
              setSelectedLanguages={setSelectedLanguages} // Pass setSelectedLanguages function
              searchItineraries={searchItineraries}
              typesOptions={typesOptions}
              languagesOptions={languagesOptions}
            />
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries
              .slice(
                (currentPage - 1) * tripsPerPage,
                currentPage * tripsPerPage
              )
              .map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  onSelect={setSelectedItinerary}
                />
              ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full bg-white shadow ${
                currentPage === 1 ? 'text-gray-300' : 'text-blue-600'
              }`}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(itineraries.length / tripsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(itineraries.length / tripsPerPage)}
              className={`px-4 py-2 rounded-full bg-white shadow ${
                currentPage === Math.ceil(itineraries.length / tripsPerPage)
                  ? 'text-gray-300'
                  : 'text-blue-600'
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  </div>
  );
}
