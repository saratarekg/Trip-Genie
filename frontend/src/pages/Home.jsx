'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TravelHero from '../components/TravelHero'
import { HistoricalPlaces } from '../components/HistoricalPlacesSlider'
import { Activities } from '../components/ActivitiesSlider'
import { ItineraryCards } from '../components/ItineraryCards'
import { ProductViewer } from '../components/ProductView'
import { AboutUs } from '../components/AboutUs'
import { BookingForm } from '../pages/FlightsandHotels'
import Cookies from 'js-cookie'
import { TestimonialBannerJsx } from '../components/testimonial-banner'

export default function Home() {
  const [activeTab, setActiveTab] = useState('activities')
  const [role, setRole] = useState('guest')

  useEffect(() => {
    setRole(Cookies.get('role') || 'guest')
  }, [])

  const tabs = {
    activities: <Activities />,
    itineraries: <ItineraryCards />,
    products: <ProductViewer />
  }

  const renderContent = () => {
    switch (role) {
      case 'tourism-governor':
        return <HistoricalPlaces />
      case 'advertiser':
        return <Activities />
      case 'seller':
        return <ProductViewer />
      case 'tour-guide':
        return (
          <>
            <div className="text-center max-w-2xl mx-auto mb-4 mt-12">
              <h1 className="text-4xl font-bold text-[#1A3B47] mb-4">
                Explore Your Next Adventure
              </h1>
              <p className="text-[#1A3B47] mb-4">
                Discover a variety of thrilling activities and thoughtfully designed itineraries that will enhance your journey. Whether you're looking for cultural experiences or exciting excursions, we have everything you need to make your travels unforgettable. Start planning your next adventure today!
              </p>
            </div>
            <div className="mb-2 max-w-2xl mx-auto">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full p-1 w-full max-w-2xl border-2 border-[#1A3B47]">
                  {['activities', 'itineraries'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full ${
                        activeTab === tab
                          ? 'bg-[#388A94] text-white'
                          : 'text-[#1A3B47] hover:text-[#5D9297]'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'activities' ? <Activities /> : <ItineraryCards />}
              </motion.div>
            </AnimatePresence>
          </>
        )
      case 'admin':
        return (
          <>
            <AboutUs />
            <TestimonialBannerJsx />
            <HistoricalPlaces />
            <div className="text-center max-w-2xl mx-auto mb-4 mt-24">
              <h1 className="text-4xl font-bold text-[#1A3B47] mb-4">
                Explore Your Next Adventure
              </h1>
              <p className="text-[#1A3B47] mb-4">
                Discover a variety of thrilling activities, thoughtfully designed itineraries, and unique travel products that will enhance your journey. Whether you're looking for cultural experiences or exciting excursions, we have everything you need to make your travels unforgettable. Start planning your next adventure today!
              </p>
            </div>
            <div className="mb-2 max-w-2xl mx-auto">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full p-1 w-full max-w-2xl border-2 border-[#1A3B47]">
                  {Object.keys(tabs).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full ${
                        activeTab === tab
                          ? 'bg-[#388A94] text-white'
                          : 'text-[#1A3B47] hover:text-[#5D9297]'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {tabs[activeTab]}
              </motion.div>
            </AnimatePresence>
          </>
        )

      default: // tourist, guest
        return (
          <>
            <AboutUs />
            <BookingForm />
            <HistoricalPlaces />
            <div className="text-center max-w-2xl mx-auto mb-4 mt-24">
              <h1 className="text-4xl font-bold text-[#1A3B47] mb-4">
                Explore Your Next Adventure
              </h1>
              <p className="text-[#1A3B47] mb-4">
                Discover a variety of thrilling activities, thoughtfully designed itineraries, and unique travel products that will enhance your journey. Whether you're looking for cultural experiences or exciting excursions, we have everything you need to make your travels unforgettable. Start planning your next adventure today!
              </p>
            </div>
            <div className="mb-2 max-w-2xl mx-auto">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full p-1 w-full max-w-2xl border-2 border-[#1A3B47]">
                  {Object.keys(tabs).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full ${
                        activeTab === tab
                          ? 'bg-[#388A94] text-white'
                          : 'text-[#1A3B47] hover:text-[#5D9297]'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {tabs[activeTab]}
              </motion.div>
            </AnimatePresence>
            <div className="mt-20">
            <TestimonialBannerJsx />
 
            </div>
           
          </>
          
        )
        
    }
  }

  return (
    <div className="min-h-screen bg-[#E6DCCF]">
      <TravelHero
       userRole={role} />
      
      <div className="mx-auto px-4 py-16">
        {renderContent()}
      </div>
    </div>
  )
}