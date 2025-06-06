import React, { useState } from 'react';
import { Filter, ChevronDown, ArrowUpDown, Plus, ContactRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const FilterComponent = ({
  filtersVisible,
  toggleFilters,
  //   sortOrder,
  //   sortBy,
  //   handleSort,
  clearFilters,
  myHistoricalPlaces,
  handlemyHistoricalPlaces,
  //   price,
  //   setPrice,
  //   dateRange,
  //   setDateRange,
  selectedTypes = [],
  setSelectedTypes,
  selectedPeriods,
  setSelectedPeriods,
  //   selectedLanguages = [],
  //   setSelectedLanguages,
  searchHistoricalPlaces,
  typesOptions = [],
  periodsOptions = [],
  //   languagesOptions = [], 
  role,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  //   const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Handle checkbox for types
  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getSelectedTypesLabel = () => {
    if (!selectedTypes || selectedTypes.length === 0) {
      return "Select Type(s)";
    }
    return selectedTypes.join(', ');
  };

  const getSelectedPeriodLabel = () => {
    if (!selectedPeriods || selectedPeriods.length === 0) {
      return "Select Period(s)";
    }
    return selectedPeriods.join(', ');
  };


  const handlePeriodChange = (period) => {
    if (selectedPeriods.includes(period)) {
      setSelectedPeriods(selectedPeriods.filter((t) => t !== period));
    } else {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  // Handle checkbox for languages
  //   const handleLanguageChange = (language) => {
  //     if (selectedLanguages.includes(language)) {
  //       setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
  //     } else {
  //       setSelectedLanguages([...selectedLanguages, language]);
  //     }
  //   };

  //   const handleLowerDateChange = (e) => {
  //     const newLowerDate = e.target.value;
  //     if (newLowerDate > dateRange.upper) {
  //       setDateRange({ lower: newLowerDate, upper: newLowerDate });
  //     } else {
  //       setDateRange({ ...dateRange, lower: newLowerDate });
  //     }
  //   };

  //   const handleUpperDateChange = (e) => {
  //     const newUpperDate = e.target.value;
  //     setDateRange({ ...dateRange, upper: newUpperDate });
  //   };

  return (
    <>
      <div className="flex mb-4">
        <div className="flex space-x-4">
          <button onClick={toggleFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <Filter className="mr-2" size={18} />
            Filters <ChevronDown className={`ml-1 transform ${filtersVisible ? 'rotate-180' : ''}`} />
          </button>

          {/* <button onClick={() => handleSort('price')} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Price {sortBy === 'price' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
          </button> */}
          {/* 
          <button onClick={() => handleSort('rating')} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Ratings {sortBy === 'rating' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
          </button> */}

          {/* {role === 'tourism-governor' ? (

          <button
            onClick={() => handlemyHistoricalPlaces(!myHistoricalPlaces)}
            className={`flex items-center px-4 py-2 rounded-full shadow ${myHistoricalPlaces ? "bg-orange-500 text-white" : "bg-white text-black"
              }`}          >
            <ContactRound strokeWidth={1.25} />
            My Places 
          </button>

           ) : null} */}
          <button onClick={clearFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            Clear Filters 
          </button>
         
        </div>



        {/* {role === 'tourism-governor' ? (
          <Link to="/create-historicalPlace" className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto">
            <Plus className="mr-2" size={18} />
            Create
          </Link>
        ) : null} */}


      </div>

      {filtersVisible && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            {/* Price Input */}
            {/* <div>
              <label className="block text-gray-700">Price</label>
              <input
                type="number"
                placeholder="Max budget"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div> */}

            {/* Date Range Input */}
            {/* <div>
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
            </div> */}

            {/* Type Dropdown */}
            <div>
              <label className="block text-gray-700">Type</label>
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  {getSelectedTypesLabel()} <ChevronDown className={`ml-1 transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
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

            <div>
              <label className="block text-gray-700">Period</label>
              <div className="relative">
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  {getSelectedPeriodLabel()} <ChevronDown className={`ml-1 transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showPeriodDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {periodsOptions.map((period) => (
                      <label key={period} className="flex items-center px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPeriods.includes(period)}
                          onChange={() => handlePeriodChange(period)}
                          className="form-checkbox"
                        />
                        <span className="ml-2">{period}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Language Dropdown */}
            {/* <div>
              <label className="block text-gray-700">Language</label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full mt-1 border rounded-lg p-2 flex justify-between items-center"
                >
                  Select Language(s) <ChevronDown className={`ml-1 transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLanguageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {languagesOptions.map((language) => (
                      <label key={language} className="flex items-center px-4 py-2">
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
            </div> */}
          </div>

          {/* Apply Filters Button */}
          <button
             onClick={() => {
              searchHistoricalPlaces();
              toggleFilters(); // Hide filters after applying them
            }}
            className="mt-12 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 "
          >
            Apply Filters
          </button>
        </div>
      )}
    </>
  );
};

export default FilterComponent;
