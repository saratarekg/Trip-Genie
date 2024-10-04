import React from 'react';
import { Filter, ChevronDown, ArrowUpDown } from 'lucide-react';

const FilterComponent = ({ 
  filtersVisible, 
  toggleFilters, 
  sortOrder, 
  sortItineraries, 
  price, 
  setPrice, 
  dateRange, 
  setDateRange, 
  type, 
  setType, 
  language, 
  setLanguage, 
  searchItineraries 
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex space-x-4 mb-4 sm:mb-0">
          {/* Toggle Filters Button */}
          <button onClick={toggleFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <Filter className="mr-2" size={18} />
            Filters <ChevronDown className={`ml-1 transform ${filtersVisible ? 'rotate-180' : ''}`} />
          </button>

          {/* Sort Button */}
          <button
            onClick={() => sortItineraries('price')}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Price ({sortOrder === 'asc' ? 'Low to High' : 'High to Low'})
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {filtersVisible && (
        <div className="mb-8 bg-white p-4 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Filter */}
            <div>
              <label className="block text-gray-700">Price</label>
              <input
                type="number"
                placeholder="Max budget"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.lower}
                  onChange={(e) => setDateRange({ ...dateRange, lower: e.target.value })}
                  className="w-full mt-1 border rounded-lg p-2"
                />
                <input
                  type="date"
                  value={dateRange.upper}
                  onChange={(e) => setDateRange({ ...dateRange, upper: e.target.value })}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-gray-700">Type</label>
              <input
                type="text"
                placeholder="Type of trip"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-gray-700">Language</label>
              <input
                type="text"
                placeholder="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={searchItineraries}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;