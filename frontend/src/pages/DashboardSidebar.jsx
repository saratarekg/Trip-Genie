import React, { useState } from "react";
import { BarChart, Users, Gift, Activity, MessageSquare, Map, LogOut, Home, ChevronDown } from 'lucide-react';

const tabs = [
  { id: 'dashboard', title: 'Dashboard', icon: Home },
  { 
    id: 'accounts', 
    title: 'Accounts', 
    icon: Users,
    subItems: [
      { id: 'review-registration', title: 'Review Registration' },
      { id: 'manage-accounts', title: 'Manage Accounts' },
      { id: 'add-admin-governor', title: 'Add Admin/Governor' },
    ]
  },
  { id: 'complaints', title: 'Complaints', icon: MessageSquare },
  { 
    id: 'product', 
    title: 'Product', 
    icon: Gift,
    subItems: [
      { id: 'my-products', title: 'My Products' },
      { id: 'create-product', title: 'Create Product' },
      { id: 'archived-products', title: 'Archived Products' },
      { id: 'create-promo-code', title: 'Create Promo Code' },
      { id: 'manage-products', title: 'Manage Products' },
    ]
  },
  { 
    id: 'activities', 
    title: 'Activities', 
    icon: Activity,
    subItems: [
      { id: 'manage-categories', title: 'Manage Categories' },
      { id: 'manage-tags', title: 'Manage Tags' },
    ]
  },
  { id: 'manage-itineraries', title: 'Manage Itineraries', icon: Map },
  { 
    id: 'reports', 
    title: 'Reports', 
    icon: BarChart,
    subItems: [
      { id: 'sales-reports', title: 'Sales Reports' },
      { id: 'activity-reports', title: 'Activity Reports' },
      { id: 'products-reports', title: 'Products Reports' },
    ]
  },
  { id: 'historical-places', title: 'Historical Places', icon: Map },
];

export function DashboardSidebar({ 
  className, 
  defaultCollapsed = false,
  activeTab,
  setActiveTab
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menuId) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  return (
    <div
      className={`relative flex flex-col h-screen ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-end h-16 px-4 border-b border-[#1A3B47]/20 bg-[#1A3B47]">
        <button
          className="text-white hover:bg-white/10 p-2 rounded-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex flex-col items-center justify-center w-6 h-6">
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white"></div>
          </div>
          <span className="sr-only">Toggle sidebar</span>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto bg-[#1A3B47]">
        <div className="p-2 space-y-1">
          {tabs.map((tab) => (
            <React.Fragment key={tab.id}>
              {tab.subItems ? (
                <div>
                  <button
                    className={`flex items-center w-full p-2 rounded-md transition-colors text-white hover:bg-white/10 ${
                      activeTab === tab.id ? "bg-white/20" : ""
                    }`}
                    onClick={() => toggleMenu(tab.id)}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{tab.title}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openMenu === tab.id ? "transform rotate-180" : ""}`} />
                      </>
                    )}
                  </button>
                  {openMenu === tab.id && !isCollapsed && (
                    <div className="pl-7 space-y-1">
                      {tab.subItems.map((subItem) => (
                        <button 
                          key={subItem.id}
                          className={`flex items-center w-full p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 ${
                            activeTab === subItem.id ? "bg-white/20 text-white" : ""
                          }`}
                          onClick={() => setActiveTab(subItem.id)}
                        >
                          <span>{subItem.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className={`flex items-center w-full p-2 rounded-md transition-colors text-white hover:bg-white/10 ${
                    activeTab === tab.id ? "bg-white/20" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {!isCollapsed && <span>{tab.title}</span>}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[#1A3B47]/20 p-4 bg-[#1A3B47]">
        <button
          className="w-full flex items-center justify-start text-white hover:bg-white/10 p-2 rounded-md"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}