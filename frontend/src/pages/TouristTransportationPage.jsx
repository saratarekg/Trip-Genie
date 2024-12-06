import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransportationHistory from "./TransportationHistory";
import UpcomingTransportation from "./TransportationUpcomming";

export default function TouristTransportationPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Transportation Bookings</h1>
      <p className="text-sm text-gray-500 mb-2">My Bookings / Transportation</p>
      <div className="bg-white shadow-md rounded-lg p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 bg-white">
          <TabsTrigger
              value={0}
              className={`relative flex items-center justify-center px-3 py-1 font-medium rounded-none border-b ${
                selectedTab === 0
                  ? 'border-[#1A3B47] text-[#1A3B47] border-b-2 shadow-none'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              Upcoming Trips
            </TabsTrigger>
            <TabsTrigger
              value={1}
              className={`relative flex items-center justify-center px-3 py-1 font-medium rounded-none border-b ${
                selectedTab === 1
                  ? 'border-[#1A3B47] text-[#1A3B47] border-b-2 shadow-none'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              Past Trips
            </TabsTrigger>
            
          </TabsList>
          <TabsContent value={1}>
            <TransportationHistory />
          </TabsContent>
          <TabsContent value={0}>
            <UpcomingTransportation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}