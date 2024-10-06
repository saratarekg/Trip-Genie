import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/login.jsx";
import ItineraryDetail from "./components/ItineraryDetail.jsx";
import UpdateItinerary from "./components/UpdateItinerary.jsx";
import UpdateProduct from "./components/UpdateProduts.jsx";
import UpdatehistoricalPlace from "./components/UpdateHP.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import {TourGuideProfileComponent} from "./components/tourGuideProfile.jsx";

import ActivityList from "./components/ActivityListAdvertiser.jsx";
import ItineraryList from "./components/ItineraryListTourGuide.jsx";
import HistoricalPlaceList from "./components/HistoricalPlaceListGovernor.jsx";
import Tghome from "./components/TourGuideHome.jsx";
import Hero from "./components/Hero.jsx";

import CreateItineraryPage from "./pages/CreateItineraryPage.jsx";
import CreateProduct from "./components/CreateProduct.jsx";
import { NavbarComponent } from "./components/navbar.jsx";
import { FooterComponent } from "./components/footer.jsx";
import { AllHistoricalPlacesComponent } from "./components/viewAllHistoricalPlaces.jsx";
import { AllItinerariesComponent } from "./components/all-trip-plans.jsx";
import HistoricalPlaceDetail from "./components/HistoricalPlaceDetail.jsx";

import { AllProducts } from "./components/all-products.jsx";
import { SignupForm } from "./components/signup-form.jsx";
import { Dashboard } from "./pages/AdminDashProMax.jsx";
import CreateHpPage from "./pages/CreateHpPage.jsx";
import { AllActivitiesComponent } from "./pages/AllActivities.jsx";
import ActivityDetail from "./pages/SingleActivity.jsx";

import UpdateActivity from "./components/UpdateActivity.jsx";
import CreateActivity from "./pages/CreateActivity.jsx";
import SellerProfile from "./pages/SellerProfile.jsx";
import AdvertiserProfile from "./pages/AdvertiserProfile.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import CreateHtpage from "./pages/CreateHtpage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/sign-up";
  return (
    <div className="App">
      <ScrollToTop />
      {!isAuthPage && <NavbarComponent />}

      <div className="pages">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "tourist",
                  "seller",
                  "tour-guide",
                  "advertiser",
                  "tourism-governor",
                  "guest",
                ]}
              >
                <Home />
              </ProtectedRoute>
            }
          />
          {/* <Route path='/tour-guide-home' element={<Tghome />} /> */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/create-historicalPlace"
            element={
              <ProtectedRoute allowedRoles={["tourism-governor"]}>
                <CreateHpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-product"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <CreateProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-itinerary"
            element={
              <ProtectedRoute allowedRoles={["tour-guide"]}>
                <CreateItineraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-activity"
            element={
              <ProtectedRoute allowedRoles={["advertiser"]}>
                <CreateActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-profile"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advertiser-profile"
            element={
              <ProtectedRoute allowedRoles={["advertiser"]}>
                <AdvertiserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute
                allowedRoles={["advertiser", "tour-guide", "tourist", "guest"]}
              >
                <AllActivitiesComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historical-place/:id"
            element={
              <ProtectedRoute
                allowedRoles={["tourism-governor", "guest", "tourist"]}
              >
                <HistoricalPlaceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-historical-place/:id"
            element={
              <ProtectedRoute allowedRoles={["tourism-governor"]}>
                <UpdatehistoricalPlace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-itineraries"
            element={
              <ProtectedRoute allowedRoles={["tour-guide", "guest", "tourist"]}>
                <AllItinerariesComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-historical-places"
            element={
              <ProtectedRoute
                allowedRoles={["tourism-governor", "guest", "tourist"]}
              >
                <AllHistoricalPlacesComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/sign-up" element={<SignupForm />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itinerary/:id"
            element={
              <ProtectedRoute allowedRoles={["tour-guide", "guest", "tourist"]}>
                <ItineraryDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-products"
            element={
              <ProtectedRoute
                allowedRoles={["seller", "admin", "guest", "tourist"]}
              >
                <AllProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute
                allowedRoles={["seller", "admin", "guest", "tourist"]}
              >
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-product/:id"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <UpdateProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-itinerary/:id"
            element={
              <ProtectedRoute allowedRoles={["tour-guide"]}>
                <UpdateItinerary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-activity/:id"
            element={
              <ProtectedRoute allowedRoles={["advertiser"]}>
                <UpdateActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity/:id"
            element={
              <ProtectedRoute
                allowedRoles={["advertiser", "tour-guide", "tourist", "guest"]}
              >
                <ActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-historical-tag"
            element={
              <ProtectedRoute allowedRoles={["tourism-governor"]}>

                <CreateHtpage/>
              </ProtectedRoute>
            }
          />

          {/* <Route path = '/museums' element = {<HistoricalPlaceList/>}/> */}
        </Routes>
      </div>
      {!isAuthPage && <FooterComponent />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
