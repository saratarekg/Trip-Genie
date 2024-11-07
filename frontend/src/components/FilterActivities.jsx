import React, { useState, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Star,
  ContactRound,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Range, getTrackBackground } from "react-range";

function DualHandleSliderComponent({ min, max, step, values, onChange, symbol }) {
  return (
    <div className="w-full px-4 py-8">
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props; // Exclude the 'key' from props
          return (
            <div
              {...restProps} // Spread remaining props without 'key'
              className="w-full h-3 pr-2 my-4 bg-gray-200 rounded-md"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ["#ccc", "#3b82f6", "#ccc"],
                  min,
                  max,
                }),
              }}
            >
              {React.Children.map(children, (child, index) => 
                React.cloneElement(child, { key: `thumb-${index}` }) // Add a unique key to each child
              )}
            </div>
          );
        }}
        renderThumb={({ props, isDragged }) => {
          const { key, ...restProps } = props; // Exclude the 'key' from props
          return (
            <div
              {...restProps} // Spread remaining props without 'key'
              className={`w-5 h-5 transform translate-x-10 bg-white rounded-full shadow flex items-center justify-center ${
                isDragged ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          );
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-gray-700">
          Min: {symbol}{values[0]}
        </span>
        <span className="text-sm font-medium text-gray-700">
          Max: {symbol}{values[1]}
        </span>
      </div>
    </div>
  );
}


const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  sortOrder,
  sortBy,
  handleSort,
  clearFilters,
  priceRange,
  setPriceRange,
  maxPrice,
  initialPriceRange,
  dateRange,
  setDateRange,
  myActivities,
  handlemyActivities,
  selectedCategories,
  setSelectedCategories,
  categoriesOptions,
  minStars,
  setMinStars,
  searchActivites,
  role,
  symbol,
  handleSortByPreference,
  isSortedByPreference,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState(initialPriceRange);
  const [isInitialized, setIsInitialized] = useState(false); // To track if it's the initial load


  useEffect(() => {
  if (isInitialized) {
    searchActivites();  // Trigger search only after the component has initialized
  } else {
    setIsInitialized(true);  // Set initialization flag to true after first render
  }
}, [priceRange]); // Dependency array that listens to changes in priceRange

  role = Cookies.get("role");
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
    if (minStars === star) {
      setMinStars(0); // Reset stars filter if clicked again
    } else {
      setMinStars(star);
    }
  };

  const handlePriceRangeChange = (newValues) => {
    setLocalPriceRange(newValues);
  };

  const applyFilters = () => {
    setPriceRange(localPriceRange);
    toggleFilters();
  };

  const getSelectedCategoriesLabel = () => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return "Select Category(s)";
    }
    return selectedCategories.map((cat) => cat.name).join(", ");
  };
  return (
    <>
      <div className="flex mb-4">
        <div className="flex space-x-4">
          <button
            onClick={toggleFilters}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            <Filter className="mr-2" size={18} />
            Filters{" "}
            <ChevronDown
              className={`ml-1 transform ${filtersVisible ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={() => handleSort("price")}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Price{" "}
            {sortBy === "price"
              ? sortOrder === 1
                ? "(Low to High)"
                : "(High to Low)"
              : ""}
          </button>

          <button
            onClick={() => handleSort("rating")}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Ratings{" "}
            {sortBy === "rating"
              ? sortOrder === 1
                ? "(Low to High)"
                : "(High to Low)"
              : ""}
          </button>

          {role === "tourist" && (
            <button
              onClick={handleSortByPreference}
              className={`flex items-center px-4 py-2 rounded-full shadow ${
                isSortedByPreference
                  ? "bg-orange-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              <Heart className="mr-2" size={18} />
              Sort by Preference
            </button>
          )}

          {/* {role === "advertiser" && ( // Check if role is "tour-guide"
            <button
              onClick={() => handlemyActivities(!myActivities)} // Toggle myActivities state
              className={`flex items-center px-4 py-2 rounded-full shadow ${
                myActivities
                  ? "bg-orange-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              <ContactRound strokeWidth={1.25} />
              My Activities
            </button>
          )} */}

          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            Clear Filters
          </button>
        </div>
        {/* {role === "advertiser" ? (
          <Link
            to="/create-activity"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto"
          >
            <Plus className="mr-2" size={18} />
            Create
          </Link>
        ) : null} */}
      </div>

      {filtersVisible && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            {/* Price Input */}
            <div>
              <Label className="block text-gray-700 mb-2">Price Range</Label>
              <DualHandleSliderComponent
                min={0}
                max={maxPrice}
                symbol={symbol}
                step={Math.max(1, Math.ceil(maxPrice / 100))}
                values={localPriceRange}
                onChange={handlePriceRangeChange}
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
                  {getSelectedCategoriesLabel()}
                  <ChevronDown
                    className={`ml-1 transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {categoriesOptions.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center px-4 py-2"
                      >
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
                    className={`p-2 rounded-full border ${
                      minStars >= star ? "bg-yellow-500" : "bg-gray-200"
                    }`}
                  >
                    <Star size={18} className="text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={applyFilters}
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
