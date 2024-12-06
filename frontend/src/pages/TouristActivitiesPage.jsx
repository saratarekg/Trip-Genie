import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TouristAttendedActivities from "./TouristAttended";
import BookedActivities from "./TouristActivities";
import SavedActivities from "@/components/Savedactivites";

export default function TouristActivitiesPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">My Activities</h1>
      <p className="text-sm text-gray-500 mb-2">Activities</p>
      <div className="bg-white shadow-md rounded-lg p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 bg-white">
            <TabsTrigger
              value={0}
              className={`relative flex items-center justify-center px-3 py-1 font-medium rounded-none border-b ${
                selectedTab === 0
                  ? 'border-[#1A3B47] text-[#1A3B47] border-b-2 shadow-none'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              Attended
            </TabsTrigger>
            <TabsTrigger
              value={1}
              className={`relative flex items-center justify-center px-3 py-1 font-medium rounded-none border-b ${
                selectedTab === 1
                  ? 'border-[#1A3B47] text-[#1A3B47] border-b-2 shadow-none'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value={2}
              className={`relative flex items-center justify-center px-3 py-1 font-medium rounded-none border-b ${
                selectedTab === 2
                  ? 'border-[#1A3B47] text-[#1A3B47] border-b-2 shadow-none'
                  : 'border-gray-300 text-gray-500 bg-white'
              }`}
            >
              Saved
            </TabsTrigger>
          </TabsList>
          <TabsContent value={0}>
            <TouristAttendedActivities />
          </TabsContent>
          <TabsContent value={1}>
            <BookedActivities />
          </TabsContent>
          <TabsContent value={2}>
            <SavedActivities />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}