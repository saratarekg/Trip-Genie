import React, { useState } from 'react';
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

  const handleLowerDateChange = (e) => {
    const newLowerDate = e.target.value;
    if (newLowerDate <= dateRange.upper || !dateRange.upper) {
      setDateRange({ ...dateRange, lower: newLowerDate });
    } else {
      alert("The start date must be before the end date.");
    }
  };

  const handleUpperDateChange = (e) => {
    const newUpperDate = e.target.value;
    if (newUpperDate >= dateRange.lower || !dateRange.lower) {
      setDateRange({ ...dateRange, upper: newUpperDate });
    } else {
      alert("The end date must be after the start date.");
    }
  };

  return (
    <>
      {/* Filters and Sort Button in a horizontal row */}
      <div className="flex space-x-4 mb-4">
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

      {/* Filters Section - Display below the buttons */}
      {filtersVisible && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
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
              <div className="flex space-x-2">
                {/* Lower Date */}
                <input
                  type="date"
                  value={dateRange.lower}
                  onChange={handleLowerDateChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />

                {/* Upper Date */}
                <input
                  type="date"
                  value={dateRange.upper}
                  onChange={handleUpperDateChange}
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
    </>
  );
};

export default FilterComponent;
