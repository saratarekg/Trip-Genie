import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/login.jsx";
import SellerList from "./components/SellerList.jsx";
import ItineraryDetail from "./components/ItineraryDetail.jsx";
import UpdateItinerary from "./components/UpdateItinerary.jsx";
import UpdateProduct from "./components/UpdateProduts.jsx";
import UpdatehistoricalPlace from "./components/UpdateHP.jsx";
import ProductDetail from "./components/ProductDetail.jsx";

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
          <Route path="/" element={<Home />} />
          {/* <Route path='/tour-guide-home' element={<Tghome />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-historicalPlace" element={<CreateHpPage />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/create-itinerary" element={<CreateItineraryPage />} />
          <Route path="/create-activity" element={<CreateActivity />} />
          <Route path="/seller-profile" element={<SellerProfile />} />

          <Route path="/seller" element={<SellerList />} />
          <Route path="/activity" element={<AllActivitiesComponent />} />
          <Route
            path="/historical-place/:id"
            element={<HistoricalPlaceDetail />}
          />
          <Route
            path="/update-historical-place/:id"
            element={<UpdatehistoricalPlace />}
          />

          <Route
            path="/all-itineraries"
            element={<AllItinerariesComponent />}
          />
          <Route
            path="/all-historical-places"
            element={<AllHistoricalPlacesComponent />}
          />
          <Route path="/sign-up" element={<SignupForm />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/itinerary/:id" element={<ItineraryDetail />} />
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/update-product/:id" element={<UpdateProduct />} />
          <Route path="/update-itinerary/:id" element={<UpdateItinerary />} />
          <Route path="/update-activity/:id" element={<UpdateActivity />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />

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
