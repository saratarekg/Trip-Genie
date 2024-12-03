import React, { useEffect, useState } from "react";
import UserApproval from "../components/UserApproval.jsx";
import { ViewComplaints } from "../components/ViewComplaints.jsx";
import AdminGovernorPage from "./AdminGovernorPage.jsx";
import TagsPage from "./TagsPage.jsx";
import CategoriesPage from "./CategoriesPage.jsx";
import { DeleteAccount } from "../components/DeleteAccPopout.jsx";
import { ViewComplaintDetails } from "../components/ViewComplaintDetails.jsx";
import ViewAllHistoricalPlaces from "./viewAllHistoricalPlacesAdmin.jsx";
import { AllProducts } from "../components/all-products-admin.jsx";
import CreateProductForm from "../components/CreateProductAdmin.jsx";
import ProductArchive from "../components/product-archive-admin.jsx";
import { MyProducts } from "../components/myProductsAdmin.jsx";
import ProductDetail from "../components/ProductDetailAdmin.jsx";
import ItineraryDetail from "../components/ItineraryDetailAdmin.jsx";
import AllTripPlansAdmin from "../components/all-trip-plans-admin.jsx";
import ProductReport from "../components/ProductReport.jsx";
import ProductReportSeller from "../components/ProductReportSeller.jsx";
import ItineraryReport from "../components/ItineraryReport.jsx";
import ActivityReport from "@/components/ActivityReport.jsx";
import UserStats from "@/components/UserStats.jsx";
import AllActivitiesComponent from "./AllActivitiesAdmin.jsx";
import SingleActivityAdmin from "./SingleActivityAdmin.jsx";
import { Dashboard } from "../components/AdminDashboard.jsx";
import NotificationsPage from "@/pages/AdminNotifications.jsx"
import { CreatePromoCode } from "../components/CreatePromoCode.jsx";
import { AllPromoCodes } from "../components/AllPromoCodes.jsx"; // Import AllPromoCodes component

import logo from "../assets/images/TGlogo.svg";

export function DashboardContent({ activeTab, tabs, setActiveTab }) {
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [previousTab, setPreviousTab] = useState(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [setActiveTab]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
    setSelectedComplaintId(null); // Reset selectedComplaintId when activeTab changes
    setSelectedProductId(null); // Reset selectedProductId when activeTab changes
  }, [activeTab]);

  const handleReportClick = (reportId) => {
    setActiveTab(reportId);
  };

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
    <div>
      <div className="p-6 mx-auto sm:p-8 lg:p-12 sm:mx-4 lg:mx-8 transition-all duration-500 ease-in-out overflow-y-auto h-full">
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
          ) : selectedProductId ? (
            <ProductDetail
              productId={selectedProductId}
              onBack={() => {
                setSelectedProductId(null);
                setActiveTab(previousTab);
              }}
            />
          ) : selectedItineraryId ? (
            <ItineraryDetail
              id={selectedItineraryId}
              onBack={() => setSelectedItineraryId(null)}
            />
          ) : activeTab === 'all-trip-plans' ? (
            <AllTripPlansAdmin onSelectItinerary={setSelectedItineraryId} />
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
            <MyProducts onSelectProduct={(id) => {
              setPreviousTab(activeTab);
              setSelectedProductId(id);
            }} />
          ) : activeTab === 'create-product' ? (
            <CreateProductForm />
          ) : activeTab === 'archived-products' ? (
            <ProductArchive onSelectProduct={(id) => {
              setPreviousTab(activeTab);
              setSelectedProductId(id);
            }} />
          ) : activeTab === 'create-promo-code' ? (
            <CreatePromoCode />
          ) : activeTab === 'all-promo-codes' ? (
            <AllPromoCodes />
          ) : activeTab === 'manage-products' ? (
            <AllProducts onSelectProduct={(id) => {
              setPreviousTab(activeTab);
              setSelectedProductId(id);
            }} />
          ) : activeTab === 'historical-places' ? (
            <ViewAllHistoricalPlaces />
          ) : activeTab === 'manage-itineraries' ? (
            <AllTripPlansAdmin onSelectItinerary={setSelectedItineraryId} />
          ) : activeTab === 'products-reports' ? (
            <div className="p-4 bg-gray-100 rounded">Content for Products Reports goes here.</div>
          ) : activeTab === 'itinerary-sales-report' ? (
            <ItineraryReport />
          ) : activeTab === 'my-product-sales-report' ? (
            <ProductReport />
          ) : activeTab === 'itinerary-sales-report' ? (
            <ItineraryReport />
          ) : activeTab === 'activity-reports' ? (
            <ActivityReport />
          ) : activeTab === 'manage-activities' ? (
            <AllActivitiesComponent />
          ) : activeTab === 'seller-product-sales-report' ? (
            <ProductReportSeller />
          ) : activeTab === 'user-stats' ? (
            <UserStats />
          ) : activeTab === 'single-activity-admin' ? (
            <SingleActivityAdmin />
          ) : activeTab === 'dashboard' ? (
            <Dashboard setActiveTab={setActiveTab} />
          ) : activeTab === 'notifications' ? (
            <NotificationsPage />
          ) : (
            <div className="p-4 bg-gray-100 rounded">
              Content for {activeTabDetails.title} goes here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}