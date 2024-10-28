import React, { useState } from "react";
import {
  Filter,
  ChevronDown,
  ArrowUpDown,
  Plus,
  ContactRound,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import DualHandleSliderComponent from "./dual-handle-slider";

const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  sortOrder,
  sortBy,
  handleSort,
  clearFilters,
  price,
  priceRange,
  setPriceRange,
  maxPrice,
  myItineraries,
  handlemyItineraries,
  setPrice,
  dateRange,
  setDateRange,
  selectedTypes = [],
  setSelectedTypes,
  selectedLanguages = [],
  setSelectedLanguages,
  searchItineraries,
  typesOptions = [],
  languagesOptions = [],
  role,
  isBooked,
  setIsBooked,
  handleSortByPreference,
  isSortedByPreference,

}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

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

  const getSelectedTypesLabel = () => {
    if (!selectedTypes || selectedTypes.length === 0) {
      return "Select Type(s)";
    }
    return selectedTypes.join(", ");
  };

  const getSelectedLanguagesLabel = () => {
    if (!selectedLanguages || selectedLanguages.length === 0) {
      return "Select Language(s)";
    }
    return selectedLanguages.join(", ");
  };

  const handleIsBookedChange = () => {
    setIsBooked(!isBooked);
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

          {role === "tour-guide" && (
            <button
              onClick={() => handlemyItineraries(!myItineraries)}
              className={`flex items-center px-4 py-2 rounded-full shadow ${
                myItineraries
                  ? "bg-orange-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              <ContactRound strokeWidth={1.25} />
              My Itineraries
            </button>
          )}

          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-white rounded-full shadow"
          >
            Clear Filters
          </button>
        </div>

        {role === "tour-guide" ? (
          <Link
            to="/create-itinerary"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto"
          >
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
              <label className="block text-gray-700">Price Range</label>
              <DualHandleSliderComponent
                min={0}
                max={maxPrice}
                step={Math.max(1, Math.ceil(maxPrice / 100))}
                values={priceRange}
                middleColor="#2563EB"
                colorRing="blue"
                onChange={(values) => setPriceRange(values)}
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

            {/* Type Dropdown */}
            <div>
              <label className="block text-gray-700">Type</label>
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  {getSelectedTypesLabel()}{" "}
                  <ChevronDown
                    className={`ml-1 transform ${
                      showTypeDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {typesOptions.map((type) => (
                      <label key={type} className="flex items-center px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeChange(type)}
                          className="form-checkbox"
                        />
                        <span className="ml-2">{type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-gray-700">Language</label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  {getSelectedLanguagesLabel()}{" "}
                  <ChevronDown
                    className={`ml-1 transform ${
                      showLanguageDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showLanguageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {languagesOptions.map((language) => (
                      <label
                        key={language}
                        className="flex items-center px-4 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => handleLanguageChange(language)}
                          className="form-checkbox"
                        />
                        <span className="ml-2">{language}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {role === "tour-guide" && (
              <div>
                <div>
                  <label className="block text-gray-700">Booking Status</label>
                </div>
                <div className="mt-2 pl-1">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isBooked}
                      onChange={handleIsBookedChange}
                      className="form-checkbox w-5 h-5"
                    />
                    <span className="text-gray-700 text-l">Booked Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={() => {
              searchItineraries();
              toggleFilters(); // Hide filters after applying them
            }}
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
