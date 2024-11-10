import React, { useState } from "react"
import { format } from "date-fns"

export function ActivityTimeline({ activities = [] }) {
  const [selectedActivity, setSelectedActivity] = useState(null)

  // Sort activities by date and group them by day number
  const groupedActivities = activities.reduce((acc, activity) => {
    const activityDate = new Date(activity.timing)
    const firstDate = new Date(Math.min(...activities.map(a => new Date(a.timing).getTime())))
    
    // Calculate days difference
    const dayNumber = Math.floor((activityDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    if (!acc[dayNumber]) {
      acc[dayNumber] = []
    }
    acc[dayNumber].push(activity)
    return acc
  }, {})

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Daily Schedule</h2>
      <div className="overflow-y-auto h-[600px] pr-4">
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([day, dayActivities]) => (
            <div key={day} className="grid grid-cols-[auto,1fr] gap-4">
              {dayActivities[0].pictures[0] && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={dayActivities[0].pictures[0].url}
                    alt={dayActivities[0].name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-lg font-semibold">Day {day}:</h3>
                  <p className="text-lg text-gray-600">
                    {format(new Date(dayActivities[0].timing), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayActivities.map((activity, index) => (
                    <div key={index} className="grid grid-cols-[1fr,auto] gap-4 items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          {format(new Date(activity.timing), 'HH:mm')} -{' '}
                          {format(
                            new Date(new Date(activity.timing).getTime() + activity.duration * 60000),
                            'HH:mm'
                          )}
                        </p>
                        <p>{activity.name}</p>
                      </div>
                      <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">{selectedActivity.name}</h3>
            <div className="grid gap-4">
              {selectedActivity.pictures[0] && (
                <div className="relative w-full h-48">
                  <img
                    src={selectedActivity.pictures[0].url}
                    alt={selectedActivity.name}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedActivity.timing), 'MMMM d, yyyy HH:mm')} -{' '}
                  {format(
                    new Date(new Date(selectedActivity.timing).getTime() + selectedActivity.duration * 60000),
                    'HH:mm'
                  )}
                </p>
                <p>{selectedActivity.description}</p>
                <p className="text-sm">
                  <span className="font-semibold">Location:</span> {selectedActivity.location.address}
                </p>
                {selectedActivity.category.length > 0 && (
                  <p className="text-sm">
                    <span className="font-semibold">Categories:</span>{' '}
                    {selectedActivity.category.join(', ')}
                  </p>
                )}
                {selectedActivity.tags.length > 0 && (
                  <p className="text-sm">
                    <span className="font-semibold">Tags:</span> {selectedActivity.tags.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setSelectedActivity(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}