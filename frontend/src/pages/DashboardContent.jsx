import React, { useEffect, useState } from "react";
import UserApproval from "../components/UserApproval.jsx";
import { ViewComplaints } from "../components/ViewComplaints.jsx";
import AdminGovernorPage from "./AdminGovernorPage.jsx";
import TagsPage from "./TagsPage.jsx";
import CategoriesPage from "./CategoriesPage.jsx";
import { DeleteAccount } from "../components/DeleteAccPopout.jsx";
import { ViewComplaintDetails } from "../components/ViewComplaintDetails.jsx";

export function DashboardContent({ activeTab, tabs, setActiveTab }) {
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [setActiveTab]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const getActiveTabDetails = () => {
    for (const tab of tabs) {
      if (tab.id === activeTab) return tab;
      if (tab.subItems) {
        const subItem = tab.subItems.find(item => item.id === activeTab);
        if (subItem) return { ...subItem, parent: tab.title };
      }
    }
    return null;
  };

  const activeTabDetails = getActiveTabDetails();

  if (!activeTabDetails) return null;

  return (
    <div className="p-6 mx-auto sm:p-8 lg:p-12 sm:mx-4 lg:mx-8 transition-all duration-500 ease-in-out">
      <h1 className="text-4xl font-bold mb-2">{activeTabDetails.title}</h1>
      <p className="text-m text-gray-500">
        {activeTabDetails.parent 
          ? `${activeTabDetails.parent} / ${activeTabDetails.title}`
          : activeTabDetails.title}
      </p>
      <div className="mt-6">
        {selectedComplaintId ? (
          <ViewComplaintDetails
            complaintId={selectedComplaintId}
            onBack={() => setSelectedComplaintId(null)}
          />
        ) : activeTab === 'review-registration' ? (
          <UserApproval />
        ) : activeTab === 'complaints' ? (
          <ViewComplaints onSelectComplaint={setSelectedComplaintId} />
        ) : activeTab === 'add-admin-governor' ? (
          <AdminGovernorPage />
        ) : activeTab === 'manage-tags' ? (
          <TagsPage />
        ) : activeTab === 'manage-categories' ? (
          <CategoriesPage />
        ) : activeTab === 'manage-accounts' ? (
          <DeleteAccount />
        ) : activeTab === 'my-products' ? (
          <div className="p-4 bg-gray-100 rounded">Content for My Products goes here.</div>
        ) : activeTab === 'create-product' ? (
          <div className="p-4 bg-gray-100 rounded">Content for Create Product goes here.</div>
        ) : activeTab === 'archived-products' ? (
          <div className="p-4 bg-gray-100 rounded">Content for Archived Products goes here.</div>
        ) : activeTab === 'create-promo-code' ? (
          <div className="p-4 bg-gray-100 rounded">Content for Create Promo Code goes here.</div>
        ) : activeTab === 'manage-products' ? (
          <div className="p-4 bg-gray-100 rounded">Content for Manage Products goes here.</div>
        ) : activeTab === 'historical-places' ? (
          <div className="p-4 bg-gray-100 rounded">Content for Historical Places goes here.</div>
        ) : (
          <div className="p-4 bg-gray-100 rounded">
            Content for {activeTabDetails.title} goes here.
          </div>
        )}
      </div>
    </div>
  );
}