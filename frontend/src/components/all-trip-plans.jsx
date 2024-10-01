'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const ItineraryCard = ({ trip }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
    <img src={trip.activities[0]?.pictures[0] || '/placeholder.svg'} alt={trip.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <span className="text-sm text-gray-500">{trip.activities[0]?.category || 'UNKNOWN TYPE'}</span>
      <h3 className="text-xl font-semibold mt-2">{trip.title}</h3>
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`} // Assuming 5 stars for now
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-bold text-blue-600">€{trip.price}/Day</span>
        <span className="text-sm text-gray-500">{trip.activities[0]?.duration || 'N/A'} Hours</span>
      </div>
    </div>
  </div>
)

export function AllItinerariesComponent() {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 6;

  useEffect(() => {
    fetch('http://localhost:4000/guest/itineraries')
      .then(response => response.json())
      .then(data => setItineraries(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const filteredTrips = itineraries.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Trip Plans</h1>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search trips..."
              className="w-full pl-10 pr-4 py-2 border rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-white rounded-full shadow">
              <Filter className="mr-2" size={18} />
              Filters
            </button>
            <button className="flex items-center px-4 py-2 bg-white rounded-full shadow">
              Sort by
              <ChevronDown className="ml-2" size={18} />
            </button>
          </div>
        </div>
        
        {/* Trip Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentTrips.map(trip => (
            <ItineraryCard key={trip._id} trip={trip} />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {[...Array(Math.ceil(filteredTrips.length / tripsPerPage))].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}>
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredTrips.length / tripsPerPage)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
