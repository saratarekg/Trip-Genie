import React, { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, MapPin } from "lucide-react"

export function ActivityTimeline({ activities = [] }) {
  const [selectedActivity, setSelectedActivity] = useState(null)

  const groupedAndSortedActivities = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      const day = activity.day
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(activity)
      return acc
    }, {})

    Object.keys(grouped).forEach(day => {
      grouped[Number(day)].sort((a, b) => new Date(a.timing).getTime() - new Date(b.timing).getTime())
    })

    return grouped
  }, [activities])

  const sortedDays = Object.keys(groupedAndSortedActivities).sort((a, b) => Number(a) - Number(b))

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Invalid Date'
  }

  const calculateEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000); // duration is in minutes
    return formatTime(end);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-[#5D9297]" />

        {/* Days and activities */}
        <div className="space-y-24">
          {sortedDays.map((day) => (
            <div key={day} className="relative">
              {/* Day header with image */}
              <div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-end">
                  {groupedAndSortedActivities[Number(day)][0]?.pictures?.[0] && (
                    // <TooltipProvider>
                    //   <Tooltip>
                    //     <TooltipTrigger asChild>
                          <div className="w-36 h-36 rounded-full overflow-hidden mr-8 cursor-pointer">
                            <img
                              src={groupedAndSortedActivities[Number(day)][0].pictures[0].url}
                              alt={`Day ${day}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                      //    </TooltipTrigger>
                      //   <TooltipContent className="p-1 bg-white rounded-lg">
                      //     <img
                      //       src={groupedAndSortedActivities[Number(day)][0].pictures[0].url}
                      //       alt={`Day ${day} - Enlarged`}
                      //       className="w-96 h-96 object-cover rounded-lg"
                      //     />
                      //   </TooltipContent>
                      // </Tooltip>
 //                   </TooltipProvider> 
                  )}
                </div>
                <div className="w-1/2 pl-8">
                  {/* Day marker */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#F88C33]" />
                  <h3 className="text-2xl text-[#1A3B47]">Day {day}</h3>
                  <ul className="">
                    {groupedAndSortedActivities[Number(day)].map((activity, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li 
                              className="flex items-center justify-between cursor-pointer hover:bg-[#B5D3D1] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <span className="text-sm text-[#5D9297] w-32">
                                {formatTime(activity.timing)} - {calculateEndTime(activity.timing, activity.duration)}
                              </span>
                              <span className="text-sm text-[#1A3B47] font-medium flex-grow ml-4">{activity.name}</span>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1A3B47] text-white p-3 rounded-lg max-w-xs">
                          <div className="flex items-start mb-2">
                              <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-base font-semibold">{activity.location.address}</p>
                              </div>
                            </div>
                            <p className="text-sm mb-2">{activity.description}</p>
                           
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity details modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        {selectedActivity && (
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-[#1A3B47]">
                {selectedActivity.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {selectedActivity.pictures && selectedActivity.pictures[0] && (
                <div className="relative h-96 w-full">
                  <img
                    src={selectedActivity.pictures[0].url}
                    alt={selectedActivity.name}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-3">
                <p className="text-[#5D9297]">{selectedActivity.description}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#388A94]" />
                  <span className="text-sm text-[#388A94]">
                    Time: {formatTime(selectedActivity.timing)} - {calculateEndTime(selectedActivity.timing, selectedActivity.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#388A94]" />
                  <span className="text-sm text-[#388A94]">
                    Location: {selectedActivity.location.address}
                  </span>
                </div>
                {selectedActivity.tags && selectedActivity.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedActivity.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs bg-[#B5D3D1] text-[#1A3B47]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
