import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import ItineraryDetail from './ItineraryDetail.jsx';
import defaultImage from "../assets/images/default-image.jpg";

const ItineraryCard = ({ itinerary, onSelect }) => (
  <div 
    className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
    onClick={() => onSelect(itinerary)}
  >
    <div className="overflow-hidden">
      <img
        src={itinerary.activities[0]?.pictures[0] || defaultImage}
        alt={itinerary.title}
        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      />
    </div>
    <div className="p-4">
      <span className="text-sm text-gray-500">
        {itinerary.activities[0]?.category[0] || 'N/A'}
      </span>
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
  const tripsPerPage = 6;
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  const getUserRole = () => {
    let role = Cookies.get('role');
    if (!role) role = 'guest';
    return role;
  };

  useEffect(() => {
    fetchItineraries();
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
      const url = new URL(`http://localhost:4000/${role}/itineraries/search`);
      url.searchParams.append('searchBy', searchTerm);

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
      console.error('Error fetching search results:', error);
      setError('Error fetching search results');
      setItineraries([]);
    }
  };

  const sortItineraries = async () => {
    try {
      const role = getUserRole();
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);

      const url = new URL(`http://localhost:4000/${role}/itineraries/sort`);
      url.searchParams.append('order', newSortOrder);

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
      console.error('Error fetching sorted results:', error);
      setError('Error fetching sorted results');
      setItineraries([]);
    }
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = itineraries.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(itineraries.length / tripsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleItinerarySelect = (itinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleBackToList = () => {
    setSelectedItinerary(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {selectedItinerary ? (
          <>
            <button
              onClick={handleBackToList}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="mr-1" /> Back to All Itineraries
            </button>
            <ItineraryDetail itinerary={selectedItinerary} />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">All Trip Plans</h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="relative w-full md:w-96 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Search trips..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 bg-white rounded-full shadow">
                  <Filter className="mr-2" size={18} />
                  Filters
                </button>

                <button
                  onClick={sortItineraries}
                  className="flex items-center px-4 py-2 bg-white rounded-full shadow"
                >
                  <ArrowUpDown className="mr-2" size={18} />
                  Sort by Price ({sortOrder === 'asc' ? 'Low to High' : 'High to Low'})
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentTrips.length > 0 ? (
                currentTrips.map((itinerary) => (
                  <ItineraryCard key={itinerary._id} itinerary={itinerary} onSelect={handleItinerarySelect} />
                ))
              ) : (
                <div className="text-center text-gray-500 col-span-full">
                  <p className="text-lg">No itineraries found</p>
                </div>
              )}
            </div>

            {itineraries.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}