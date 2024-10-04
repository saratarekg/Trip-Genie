import React from 'react';
import { Filter, ChevronDown, ArrowUpDown } from 'lucide-react';

const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  sortOrder,
  sortBy,
  handleSort,
  price,
  setPrice,
  dateRange,
  setDateRange,
  selectedTypes = [], // Default to empty array
  setSelectedTypes,
  selectedLanguages = [], // Default to empty array
  setSelectedLanguages,
  searchItineraries,
  typesOptions = [], // Default to empty array for types options
  languagesOptions = [] // Default to empty array for language options
}) => {

  // Handle checkbox for types
  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Handle checkbox for languages
  const handleLanguageChange = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

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
            {/* Price Input */}
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

            {/* Date Range Input */}
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

            {/* Type Checkboxes */}
            <div>
              <label className="block text-gray-700">Type</label>
              <div className="flex flex-wrap">
                {typesOptions.map((type) => (
                  <label key={type} className="mr-4 mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)} // Check if type is selected
                      onChange={() => handleTypeChange(type)}
                      className="form-checkbox"
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language Checkboxes */}
            <div>
              <label className="block text-gray-700">Language</label>
              <div className="flex flex-wrap">
                {languagesOptions.map((language) => (
                  <label key={language} className="mr-4 mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language)} // Check if language is selected
                      onChange={() => handleLanguageChange(language)}
                      className="form-checkbox"
                    />
                    <span className="ml-2">{language}</span>
                  </label>
                ))}
              </div>
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
