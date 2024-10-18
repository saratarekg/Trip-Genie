import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Calendar, ChevronRight, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { Ticket, Type, FileText,DollarSign, CreditCard,Wallet } from "lucide-react"; // Import icons from react-lucide
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const fetchData = async (userRole, dataType) => {
  try {
    const response = await axios.get(`http://localhost:4000/${userRole}/${dataType}`, {
      headers: { Authorization: `Bearer ${Cookies.get('jwt')}` }
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return []
    }
    console.error(`Error fetching ${dataType}:`, error)
    throw error
  }
}

export default function Component() {
  const [userRole, setUserRole] = useState(Cookies.get("role") || "guest")
  const [activities, setActivities] = useState([])
  const [itineraries, setItineraries] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const navigate = useNavigate()

  const handleActivityClick = (id) => {
    navigate(`/activity/${id}`)
  }

  const handleItineraryClick = (id) => {
    navigate(`/itinerary/${id}`)
  }

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  const handleDeleteBooking = (booking) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const showNotification = (message) => {
    setNotificationMessage(message)
    setIsNotificationDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBooking) return

    const bookingType = selectedBooking.activity ? 'activity' : 'itinerary'
    const bookingDate = new Date(selectedBooking[bookingType].timing)
    const now = new Date()
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)


    if (hoursDifference < 48) {
      showNotification("Bookings can only be cancelled 48 hours or more before the event starts.")
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      await axios.delete(`http://localhost:4000/${userRole}/${bookingType}Booking/${selectedBooking._id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('jwt')}` }
      })
      
      if (bookingType === 'activity') {
        setActivities(activities.filter(a => a.id !== selectedBooking.id))
      } else {
        setItineraries(itineraries.filter(i => i.id !== selectedBooking.id))
      }

      showNotification("Your booking has been successfully cancelled.")
    } catch (error) {
      console.error('Error deleting booking:', error)
      showNotification("An error occurred while cancelling your booking. Please try again.")
    }

    setIsDeleteDialogOpen(false)
  }

  useEffect(() => {
    const role = Cookies.get("role") || "guest"
    setUserRole(role)

    const fetchAllData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [activitiesData, itinerariesData] = await Promise.all([
          fetchData(role, 'touristActivityBookings'),
          fetchData(role, 'touristItineraryBookings')
        ])
        setActivities(activitiesData)
        setItineraries(itinerariesData)
      } catch (err) {
        setError('An error occurred while fetching data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  const noBookingsMessage = (
    <div className="text-center py-8">
      <p className="text-xl font-semibold text-gray-600">No bookings for you yet</p>
      <p className="text-gray-500 mt-2">Start exploring and book your first activity!</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Activities and Itineraries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Updated grid layout */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Itineraries</CardTitle>
              <CardDescription>Your travel plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]"> {/* Updated ScrollArea height */}
                {itineraries.length > 0 ? (
                  itineraries.map((booking) => (
                    <div key={booking._id} className="mb-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          className="w-full justify-start mr-2"
                          onClick={() => handleItineraryClick(booking.itinerary._id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {booking.itinerary.title}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Separator className="my-2" />
                    </div>
                  ))
                ) : (
                  noBookingsMessage
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booked Activities</CardTitle>
              <CardDescription>Click on an activity to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]"> {/* Updated ScrollArea height */}
                {activities.length > 0 ? (
                  activities.map((booking) => (
                    <div key={booking._id} className="mb-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          className="w-full justify-start mr-2"
                          onClick={() => handleActivityClick(booking.activity._id)}
                        >
                          <div className="flex justify-between w-full">
                            <span>{booking.activity.name}</span>
                         </div>
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Separator className="my-2" />
                    </div>
                  ))
                ) : (
                  noBookingsMessage
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
  <DialogContent className="sm:max-w-[500px] p-6">
    {/* Check if selectedBooking is null */}
    {!selectedBooking ? (
      <div className="text-center py-4">
        <p className="text-lg text-red-600 font-semibold">Error: No booking details available.</p>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    ) : (
      <>
        {/* Popup heading: Activity or Itinerary title */}
        <DialogHeader className="mb-2"> {/* Reduced bottom margin */}
          <DialogTitle className="text-3xl font-bold text-gray-900">
            {selectedBooking.activity ? selectedBooking.activity.name : selectedBooking.itinerary.title}
          </DialogTitle>
          {/* Booking Type in larger font */}
          <p className="text-lg text-gray-600"> {/* Increased font size */}
            {selectedBooking.activity ? 'Activity' : 'Itinerary'}
          </p>
        </DialogHeader>

        {/* Body content */}
        <div className="grid gap-4 py-4 text-left"> {/* Adjusted gap for tighter spacing */}
          {/* Section heading */}
          <h3 className="text-xl font-semibold text-gray-800">Booking Details</h3>

          {/* Date Row */}
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" /> {/* Icon */}
            <span className="font-medium text-lg text-gray-700">Date:</span>
            <span className="text-gray-800 text-base">
              {new Date(selectedBooking.activity ? selectedBooking.activity.timing : selectedBooking.itinerary.startDate).toLocaleDateString()}
            </span>
          </div>

          {/* Tickets Row (for Activity) */}
          {selectedBooking.activity && (
            <div className="flex items-center gap-4">
              <Ticket className="w-5 h-5 text-gray-600" /> {/* Icon */}
              <span className="font-medium text-lg text-gray-700">Tickets:</span>
              <span className="text-gray-800 text-base">{selectedBooking.numberOfTickets}</span>
            </div>
          )}

          {/* Payment Amount Row */}
          <div className="flex items-center gap-4">
            <DollarSign className="w-5 h-5 text-gray-600" /> {/* Icon */}
            <span className="font-medium text-lg text-gray-700">Payment Amount:</span>
            <span className="text-gray-800 text-base">{`$${selectedBooking.paymentAmount.toFixed(2)}`}</span>
          </div>

          {/* Payment Type Row with dynamic icon */}
          <div className="flex items-center gap-4">
            {/* Show Wallet icon if payment is "Wallet", otherwise CreditCard */}
            {selectedBooking.paymentType === 'Wallet' ? (
              <Wallet className="w-5 h-5 text-gray-600" />
            ) : (
              <CreditCard className="w-5 h-5 text-gray-600" />
            )}
            <span className="font-medium text-lg text-gray-700">Payment Type:</span>
            <span className="text-gray-800 text-base">{selectedBooking.paymentType}</span>
          </div>

          {/* End Date Row (for Itinerary) */}
          {selectedBooking.itinerary && (
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-600" /> {/* Icon */}
              <span className="font-medium text-lg text-gray-700">End Date:</span>
              <span className="text-gray-800 text-base">{new Date(selectedBooking.itinerary.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </>
    )}
  </DialogContent>
</Dialog>







      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>
          <p>{notificationMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsNotificationDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}