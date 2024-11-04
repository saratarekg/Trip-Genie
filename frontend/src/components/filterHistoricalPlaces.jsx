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
    <div className="bg-white rounded-lg shadow-lg p-6">
      
      <div className="space-y-6">
        {/* Top buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleFilters}
            className="flex items-center px-4 py-2 bg-[#388A94] hover:bg-[#5D9297] text-white rounded-full shadow"
          >
            <Filter className="mr-2 " size={18} />
            Filters
          </button>

          {role === 'tourism-governor' && (
            <button
              onClick={() => handlemyHistoricalPlaces(!myHistoricalPlaces)}
              className={`flex items-center px-4 py-2 rounded-full shadow ${
                myHistoricalPlaces ? "bg-orange-500 text-white" : "bg-white text-black"
              }`}
            >
              <ContactRound strokeWidth={1.25} className="mr-2" />
              My Places
            </button>
          )}

          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-[#388A94] hover:bg-[#5D9297] text-white rounded-full shadow"
          >
            Clear Filters
          </button>

          {role === 'tourism-governor' && (
            <Link
              to="/create-historicalPlace"
              className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto"
            >
              <Plus className="mr-2" size={18} />
              Create
            </Link>
          )}
        </div>

        {/* Types Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Types</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {typesOptions.map((type) => (
              <label key={type} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="rounded border-gray-300 text-[#388A94] focus:ring-[#388A94]"
                />
                <span className="text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Periods Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Periods</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {periodsOptions.map((period) => (
              <label key={period} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(period)}
                  onChange={() => handlePeriodChange(period)}
                  className="rounded border-gray-300 text-[#388A94] focus:ring-[#388A94]"
                />
                <span className="text-gray-700">{period}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={() => {
            searchHistoricalPlaces();
            toggleFilters();
          }}
          className="w-full bg-[#388A94] text-white py-2 px-4 rounded-lg hover:bg-[#5D9297] transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
