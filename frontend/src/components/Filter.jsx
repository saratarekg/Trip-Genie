import React from 'react';
import { Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
// import {handleSort} from './all-trip-plans'

const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  sortOrder,
  sortBy, // Get sortBy from props
  handleSort, // Get handleSort from props
  // sortItineraries,
  price,
  setPrice,
  dateRange,
  setDateRange,
  type,
  setType,
  language,
  setLanguage,
  searchItineraries,
  typesOptions,   // Props for types
  languagesOptions // Props for languages
}) => {

  const handleLowerDateChange = (e) => {
    const newLowerDate = e.target.value;
    if (newLowerDate > dateRange.upper) {
      setDateRange({ lower: newLowerDate, upper: newLowerDate });
    } else {
      setDateRange({ ...dateRange, lower: newLowerDate });
    }
  };

  const handleUpperDateChange = (e) => {
    const newUpperDate = e.target.value;
    setDateRange({ ...dateRange, upper: newUpperDate });
  };

  return (
    <>
      <div className="flex space-x-4 mb-4">
        <button onClick={toggleFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
          <Filter className="mr-2" size={18} />
          Filters <ChevronDown className={`ml-1 transform ${filtersVisible ? 'rotate-180' : ''}`} />
        </button>

        <button
                    onClick={() => handleSort('price')}
                    className="flex items-center px-4 py-2 bg-white rounded-full shadow"
                  >
                    <ArrowUpDown className="mr-2" size={18} />
                    Sort by Price {sortBy === 'price' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
                  </button>

                  <button
                    onClick={() => handleSort('rating')}
                    className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-4"
                  >
                    <ArrowUpDown className="mr-2" size={18} />
                    Sort by Ratings {sortBy === 'rating' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
                  </button>
      </div>

      {filtersVisible && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
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

            <div>
              <label className="block text-gray-700">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.lower}
                  onChange={handleLowerDateChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
                <input
                  type="date"
                  value={dateRange.upper}
                  onChange={handleUpperDateChange}
                  min={dateRange.lower}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              >
                <option value="">Select Type</option>
                {typesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-gray-700">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              >
                <option value="">Select Language</option>
                {languagesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
