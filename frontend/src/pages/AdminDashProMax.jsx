"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";

// Register all the chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// Reusable DashboardCard component
const DashboardCard = ({ title, value, subtitle, icon }) => (
  <Card className="bg-white border-[#B5D3D1] border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-[#1A3B47]">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-[#1A3B47]">{value}</div>
      <p className="text-xs text-[#388A94]">{subtitle}</p>
    </CardContent>
  </Card>
);

const tabs = [
  { id: 'dashboard', title: 'Dashboard', icon: 'Home' },
  { 
    id: 'accounts', 
    title: 'Accounts', 
    icon: 'Users',
    subItems: [
      { id: 'review-registration', title: 'Review Registration' },
      { id: 'manage-accounts', title: 'Manage Accounts' },
      { id: 'add-admin-governor', title: 'Add Admin/Governor' },
    ]
  },
  { id: 'complaints', title: 'Complaints', icon: 'MessageSquare' },
  { 
    id: 'giftshop', 
    title: 'Gift Shop', 
    icon: 'Gift',
    subItems: [
      { id: 'create-promo-code', title: 'Create Promo Code' },
      { id: 'manage-products', title: 'Manage Products' },
    ]
  },
  { 
    id: 'activities', 
    title: 'Activities', 
    icon: 'Activity',
    subItems: [
      { id: 'manage-categories', title: 'Manage Categories' },
      { id: 'manage-tags', title: 'Manage Tags' },
    ]
  },
  { id: 'manage-itineraries', title: 'Manage Itineraries', icon: 'Map' },
  { 
    id: 'product', 
    title: 'Product', 
    icon: 'Gift',
    subItems: [
      { id: 'my-products', title: 'My Products' },
      { id: 'create-product', title: 'Create Product' },
      { id: 'archived-products', title: 'Archived Products' },
      { id: 'create-promo-code', title: 'Create Promo Code' },
      { id: 'manage-products', title: 'Manage Products' },
    ]
  },
  { id: 'historical-places', title: 'Historical Places', icon: 'Map' },
  { 
    id: 'reports', 
    title: 'Reports', 
    icon: 'BarChart',
    subItems: [
      { id: 'sales-reports', title: 'Sales Reports' },
      { id: 'activity-reports', title: 'Activity Reports' },
      { id: 'products-reports', title: 'Products Reports' },
    ]
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto transition-all duration-1000 ease-in-out transform">
        <DashboardContent activeTab={activeTab} tabs={tabs} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}
