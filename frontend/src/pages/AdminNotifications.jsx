import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Bell, Loader2 } from 'lucide-react'

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get(
                `http://localhost:4000/admin/notifications`,
                {
                    headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
                }
            )

            if (Array.isArray(response.data)) {
                setNotifications(response.data)
            } else if (response.data && Array.isArray(response.data.notifications)) {
                setNotifications(response.data.notifications)
            } else {
                setError('Unexpected data format received from server.')
                return
            }

            // Mark notifications as seen after successfully fetching them
            await markNotificationsAsSeen()
        } catch (error) {
            console.error('Error fetching notifications:', error)
            if (!error.response) {
                setError('Cannot connect to server. Please check if the server is running.')
            } else if (error.response.status === 400) {
                setNotifications([])
            } else {
                setError(`Server error: ${error.response?.data?.message || 'Unknown error occurred'}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const markNotificationsAsSeen = async () => {
        try {
            await axios.post(
                `http://localhost:4000/admin/mark-notifications-seen`,
                {},
                {
                    headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
                }
            )
        } catch (error) {
            console.error('Error marking notifications as seen:', error)
            // Optionally, you can set an error state here if you want to show this error to the user
        }
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#E6DCCF]">
                <Loader2 className="h-8 w-8 animate-spin text-[#388A94]" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#E6DCCF]">
                <p className="text-[#1A3B47] bg-[#B5D3D1] p-4 rounded-lg shadow">{error}</p>
            </div>
        )
    }

    return (
        <div className="bg-[#E6DCCF] min-h-screen">
            <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-2xl mb-8 font-bold flex items-center text-[#1A3B47]">
                    <Bell className="mr-2" />
                    Notifications
                </h1>
                {notifications.length === 0 ? (
                    <p className="text-[#1A3B47] bg-[#B5D3D1] p-4 rounded-lg shadow text-center">No notifications at the moment.</p>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map((notification, index) => (
                            <li key={index} className="bg-[#5D9297] shadow rounded-lg p-3 transition duration-300 ease-in-out hover:shadow-lg hover:bg-[#388A94] relative">
                                {!notification.seen && (
                                    <span className="absolute top-2 right-2 bg-[#F88C33] text-white text-xs px-2 py-1 rounded-full">
                                        New
                                    </span>
                                )}
                                <p className="text-[#E6DCCF] mb-1">{notification.body}</p>
                                <p className="text-xs text-[#B5D3D1]">{formatDate(notification.date)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}