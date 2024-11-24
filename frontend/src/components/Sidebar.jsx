import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import '@/styles/sidebar.css';

const Sidebar = ({ menuStructure, role, activeTab, onTabClick }) => {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null); // Track only one open category

  const handleTabClick = (tab) => {
    onTabClick(tab);
    navigate(`/account/${tab}`);
  };

  const toggleCategory = (category) => {
    // If the clicked category is already open, close it, else open the clicked category
    setOpenCategory(prevCategory => (prevCategory === category ? null : category));
  };

  return (
    <aside className="max-w-30 h-screen overflow-y-auto sidebar-scroll">
      <nav className="p-4">
        <h2 className="text-3xl font-bold mb-6">My Account</h2>
        <ul className="space-y-1">
          {Object.entries(menuStructure).map(([category, items]) => {
            const filteredItems = items.filter((item) => item.roles.includes(role));
            if (filteredItems.length === 0) return null;

            const isOpen = openCategory === category; // Check if this category is open

            return (
              <li key={category} className={`mb-2 ${isOpen ? 'open-category' : ''}`}>
                <button
                  onClick={() => toggleCategory(category)} // Toggle the category open/close
                  className="flex justify-between items-center w-full text-left px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-base">{category}</span>
                  {/* <span className="text-gray-500">
                    {isOpen ? <Icons.ChevronDown className="w-4 h-4" /> : <Icons.ChevronRight className="w-4 h-4" />}
                  </span> */}
                </button>
                <ul className={`mt-2 space-y-1 submenu-entering`}>
                  {isOpen &&
                    filteredItems.map((item) => {
                      const Icon = Icons[item.icon];
                      return (
                        <li key={item.tab}>
                          <button
                            onClick={() => handleTabClick(item.tab)}
                            className={`flex items-center w-full text-left px-4 py-2 rounded-full transition-colors ${
                              activeTab === item.tab
                                ? 'bg-[#B5D3D1] text-black font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {Icon && <Icon className="h-5 w-5 mr-3" />}
                            <span>{item.name}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
