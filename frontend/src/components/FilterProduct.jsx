import React, { useState } from 'react';
import { Filter, ChevronDown, ArrowUpDown, Plus, ContactRound } from 'lucide-react';
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
  searchProducts,
  role,
  myProducts,
  handlemyProducts,
}) => {

  return (
    <>
      <div className="flex mb-4">
        <div className="flex space-x-4">
          <button onClick={toggleFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <Filter className="mr-2" size={18} />
            Filters <ChevronDown className={`ml-1 transform ${filtersVisible ? 'rotate-180' : ''}`} />
          </button>

          <button onClick={() => handleSort('rating')} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            <ArrowUpDown className="mr-2" size={18} />
            Sort by Ratings {sortBy === 'rating' ? (sortOrder === 1 ? '(Low to High)' : '(High to Low)') : ''}
          </button>

          {(role === 'seller') && (
            <button
              onClick={() => handlemyProducts(!myProducts)} // Toggle myProducts state
              className={`flex items-center px-4 py-2 rounded-full shadow ${
                myProducts ? 'bg-orange-500 text-white' : 'bg-white text-black'
              }`}
            >
              <ContactRound strokeWidth={1.25} />
              My Products
            </button>
          )}

          <button onClick={clearFilters} className="flex items-center px-4 py-2 bg-white rounded-full shadow">
            Clear Filters
          </button>

         
          </div>

          {(role === 'seller' || role === 'admin')?  (
             <Link to="/create-product" className="flex items-center px-4 py-2 bg-white rounded-full shadow ml-auto">
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
                min ="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={searchProducts}
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
