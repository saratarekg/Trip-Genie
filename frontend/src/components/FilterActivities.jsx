import React, { useState } from 'react';
import { Filter, ChevronDown, ArrowUpDown, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

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
  selectedCategories,
  setSelectedCategories,
  categoriesOptions,
  minStars,
  setMinStars,  // Add state to control minimum stars
  searchActivites,
  role,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  role = Cookies.get('role');
  // Handle Category Selection
  const handleCategoryChange = (type) => {
    if (selectedCategories.includes(type)) {
      setSelectedCategories(selectedCategories.filter((t) => t !== type));
    } else {
      setSelectedCategories([...selectedCategories, type]);
    }
  };
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (newStartDate > dateRange.end) {
      setDateRange({ start: newStartDate, end: newStartDate });
    } else {
      setDateRange({ ...dateRange, start: newStartDate });
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setDateRange({ ...dateRange, end: newEndDate });
  };

  // Handle minimum star rating selection
  const handleStarClick = (star) => {
    setMinStars(star);
  };

  const getSelectedCategoriesLabel = () => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return "Select Category(s)";
    }
    return selectedCategories.map((cat) => cat.name).join(', ');
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

          {role === "advertiser" && (  // Check if role is "tour-guide"
  <button
    onClick={() => handlemyActivities(!myActivities)} // Toggle myActivities state
    className={`flex items-center px-4 py-2 rounded-full shadow ${
      myActivities ? "bg-orange-500 text-white" : "bg-white text-black"
    }`}
  >
    <ContactRound strokeWidth={1.25} />
    My Activities
  </button>
)}

          <button onClick={clearFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            Clear Filters
          </button>



        </div>
        {role === 'advertiser'?  (
             <Link to="/create-activity" className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto">
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
                  value={dateRange.start}
                  onChange={handleStartDateChange}
                  className="w-full mt-1 border rounded-lg p-2"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={handleEndDateChange}
                  min={dateRange.start}
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
            </div>


            <div>
              <label className="block text-gray-700">Category</label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                 {getSelectedCategoriesLabel()}<ChevronDown className={`ml-1 transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {categoriesOptions.map((category) => (
                      <label key={category._id} className="flex items-center px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="form-checkbox"
                        />
                        <span className="ml-2">{category.name}</span>
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
            onClick={searchActivites}
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
