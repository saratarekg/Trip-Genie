import React, { useState } from 'react';
import { Filter, ChevronDown, ArrowUpDown, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  sortOrder,
  sortBy,
  handleSort,
  clearFilters,
  price,
  setPrice,
  dateRange,
  setDateRange,
  selectedCategory,
  setSelectedCategory,
  categoriesOptions = [],
  minStars,
  setMinStars,  // Add state to control minimum stars
  searchItineraries,
  role,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Handle Category Selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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

  // Handle minimum star rating selection
  const handleStarClick = (star) => {
    setMinStars(star);
  };

  return (
    <>
      <div className="flex mb-4">
        <div className="flex space-x-4">
          <button onClick={toggleFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <Filter className="mr-2" size={18} />
            Filters <ChevronDown className={`ml-1 transform ${filtersVisible ? 'rotate-180' : ''}`} />
          </button>

          <button onClick={() => handleSort('price')} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Price {sortBy === 'price' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
          </button>

          <button onClick={() => handleSort('rating')} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Ratings {sortBy === 'rating' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
          </button>

          <button onClick={clearFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            Clear Filters
          </button>
        </div>

        {role === 'tour-guide' ? (
          <Link to="/create-itinerary" className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto">
            <Plus className="mr-2" size={18} />
            Create
          </Link>
        ) : null}
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

            {/* Category Dropdown */}
            <div>
              <label className="block text-gray-700">Category</label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  {selectedCategory || 'Select Category'} <ChevronDown className={`ml-1 transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {categoriesOptions.map((category) => (
                      <label key={category} className="flex items-center px-4 py-2">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => handleCategoryChange(category)}
                          className="form-radio"
                        />
                        <span className="ml-2">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Minimum Star Rating Selector */}
            <div>
              <label className="block text-gray-700">Minimum Star Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`p-2 rounded-full border ${minStars >= star ? 'bg-yellow-500' : 'bg-gray-200'}`}
                  >
                    <Star size={18} className="text-white" />
                  </button>
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
