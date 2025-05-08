import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import '@/styles/sidebar.css';
import { LogOut, ChevronDown } from 'lucide-react'; // Added ChevronDown import

const Sidebar = ({ menuStructure, role, activeTab, onTabClick }) => {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);

  const handleTabClick = (tab) => {
    onTabClick(tab);
    navigate(`/account/${tab}`);
  };

  const toggleCategory = (category) => {
    setOpenCategory((prevCategory) => (prevCategory === category ? null : category));
  };

  return (
    <aside className="max-w-30 h-screen overflow-y-auto sidebar-scroll">
      <nav className="p-4">
        <h2 className="text-3xl font-bold mb-6">My Account</h2>
        <ul className="space-y-1">
          {Object.entries(menuStructure).map(([category, items]) => {
            const filteredItems = items.filter((item) => item?.roles?.includes(role));
            if (filteredItems.length === 0) return null;

            const isOpen = openCategory === category;

            return (
              <li key={category} className={`mb-1 ${isOpen ? 'open-category' : ''}`}>
                <button
                  onClick={() => toggleCategory(category)}
                  className={`flex justify-between items-center w-full text-left px-4 py-2 rounded-md text-gray-600 transition-transform transition-colors duration-200 ${
                    isOpen
                      ? 'font-bold text-black scale-105'
                      : 'hover:font-bold hover:scale-105 hover:text-black'
                  }`}
                >
                  <span className="font-semibold text-base">{category}</span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
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
                                ? 'bg-[#B5D3D1] text-black font-bold'
                                : 'text-gray-600 hover:bg-[#B5D3D1] hover:text-black '
                            }`}
                          >
                            {Icon && <Icon className="h-5 w-5 mr-3" strokeWidth="2.5" />}
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
        <div className="pt-4 border-t">
          <button
            className={`flex items-center w-full text-left px-4 py-2 pl-4 rounded-full transition-colors transition-transform duration-200 ${
              activeTab === 'logout'
                ? 'bg-[#B5D3D1] text-black font-bold scale-105'
                : 'text-gray-600 hover:text-red-500 hover:font-bold hover:scale-105 hover:text-black'
            }`}
            onClick={() => onTabClick('logout')}
          >
            <LogOut className="mr-3 h-5 w-5" strokeWidth="2.5" />
            <span className='font-bold'>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;