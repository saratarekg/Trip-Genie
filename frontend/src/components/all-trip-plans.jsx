import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import defaultImage from "../assets/images/default-image.jpg"; // Import your default image
import ItineraryDetail from './ItineraryDetail.jsx';

// ItineraryCard Component
// const ItineraryCard = ({ trip }) => (
//   <div className="bg-white rounded-lg overflow-hidden shadow-lg">
//     <img
//       src={trip.activities[0]?.pictures[0] || '/placeholder.svg'}
//       alt={trip.title}
//       className="w-full h-48 object-cover"
//     />
//     <div className="p-4">
//       <span className="text-sm text-gray-500">
//       {trip.activities && trip.activities.length > 0 ? trip.activities[0].category : ''}
//       </span>
//       <h3 className="text-xl font-semibold mt-2">{trip.title}</h3>
//       <div className="flex items-center mt-2">
//         {[...Array(5)].map((_, i) => (
//           <svg
//             key={i}
//             className={`w-5 h-5 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path
//               d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
//             />
//           </svg>
//         ))}
//       </div>
//       <div className="flex justify-between items-center mt-4">
//         <span className="text-lg font-bold text-blue-600">€{trip.price}/Day</span>
//         <span className="text-sm text-gray-500">
//           {trip.activities[0]?.duration || 'N/A'} Hours
//         </span>
//       </div>
//     </div>
//   </div>
// );

// AllItinerariesComponent
export function AllItinerariesComponent() {
  // State Variables
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 6;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  // Function to get the user's role, defaulting to 'guest'
  const getUserRole = () => {
    let role = Cookies.get('role');
    if (!role) role = 'guest';
    return role;
  };

  // Fetch itineraries on component mount
  useEffect(() => {
    fetchItineraries();
  }, []);

  // Fetch itineraries when searchTerm changes with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchItineraries();
      } else {
        fetchItineraries();
      }
    }, 300); // Delay to prevent too many API calls

    return () => clearTimeout(delayDebounceFn); // Cleanup on unmount
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to fetch itineraries
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
      setError(null); // Clear any previous errors
      setCurrentPage(1); // Reset to first page after fetching
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setError('Error fetching itineraries');
      setItineraries([]); // Clear itineraries on error
    }
  };

  // Function to search itineraries
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
      setError(null); // Clear any previous errors
      setCurrentPage(1); // Reset to first page after searching
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Error fetching search results');
      setItineraries([]); // Clear itineraries on error
    }
  };

  // Function to sort itineraries
  const sortItineraries = async (sortTerm) => {
    try {
      const role = getUserRole();
      const url = new URL(`http://localhost:4000/${role}/itineraries/sort`);
      url.searchParams.append('sortBy', sortTerm);

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
      setError(null); // Clear any previous errors
      setCurrentPage(1); // Reset to first page after sorting
      setIsDropdownOpen(false); // Close dropdown after selection
    } catch (error) {
      console.error('Error fetching sorted results:', error);
      setError('Error fetching sorted results');
      setItineraries([]); // Clear itineraries on error
    }
  };

  // Handle sort option selection
  const handleSortSelect = (option) => {
    sortItineraries(option);
  };

  // ItineraryCard Component
const ItineraryCard = ({ itinerary }) => (
<div className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-150 hover:shadow-xl">
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
        <span className="text-sm text-gray-500">
          {itinerary.activities && itinerary.activities.length > 0 ? itinerary.activities[0].category[0] : ''}
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


  // Pagination logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = itineraries.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(itineraries.length / tripsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Function to handle itinerary selection
  const handleItinerarySelect = (itinerary) => {
    setSelectedItinerary(itinerary);
  };

  // Function to go back to the list view
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
            {/* Heading */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">All Trip Plans</h1>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              {/* Search Input */}
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

              {/* Filters and Sort */}
              <div className="flex space-x-4">
                {/* Filters Button */}
                <button className="flex items-center px-4 py-2 bg-white rounded-full shadow">
                  <Filter className="mr-2" size={18} />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative inline-block text-left" ref={dropdownRef}>
                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      id="menu-button"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      Sort by
                      <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                      tabIndex="-1"
                    >
                      <div className="py-1" role="none">
                        <button
                          onClick={() => handleSortSelect('price')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex="-1"
                          id="menu-item-0"
                        >
                          Price
                        </button>
                        <button
                          onClick={() => handleSortSelect('date')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex="-1"
                          id="menu-item-1"
                        >
                          Date
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* End Sort Dropdown */}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Trip Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentTrips.length > 0 ? (
                currentTrips.map((trip) => (
                  <ItineraryCard key={trip._id} trip={trip} onSelect={handleItinerarySelect} />
                ))
              ) : (
                <div className="text-center text-gray-500 col-span-full">
                  <p className="text-lg">No itineraries found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {itineraries.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {/* Previous Button */}
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

                  {/* Page Numbers */}
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

                  {/* Next Button */}
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
