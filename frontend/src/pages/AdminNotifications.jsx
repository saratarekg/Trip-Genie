import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Bell, Loader2 } from "lucide-react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:4000/admin/notifications`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
      } else {
        setError("Unexpected data format received from server.");
        return;
      }

      // Mark notifications as seen after successfully fetching them
      await markNotificationsAsSeen();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (!error.response) {
        setError(
          "Cannot connect to server. Please check if the server is running."
        );
      } else if (error.response.status === 400) {
        setNotifications([]);
      } else {
        setError(
          `Server error: ${
            error.response?.data?.message || "Unknown error occurred"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsSeen = async () => {
    try {
      await axios.post(
        `http://localhost:4000/admin/mark-notifications-seen`,
        {},
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
      // Optionally, you can set an error state here if you want to show this error to the user
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E6DCCF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#388A94]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E6DCCF]">
        <p className="text-[#1A3B47] bg-[#B5D3D1] p-4 rounded-lg shadow">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-4xl mb-8 font-bold flex items-center text-[#1A3B47]">
          <Bell className="mr-2 w-8 h-8" />
          Notifications
        </h1>
        {notifications.length === 0 ? (
          <p className="text-[#1A3B47] bg-gray-100 p-4 rounded-lg shadow text-center">
            No notifications at the moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-[#1A3B47]">
                  <th className="px-4 py-2 text-left text-2xl border-b border-gray-200">
                    Notification
                  </th>
                  <th className="px-4 py-2 text-left text-2xl border-b border-gray-200">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, index) => (
                  <tr
                    key={index}
                    className={`
                                            ${
                                              index % 2 === 0
                                                ? "bg-gray-200"
                                                : "bg-gray-300"
                                            }
                                            hover:bg-gray-400 transition duration-300 ease-in-out
                                        `}
                  >
                    <td className="px-4 py-3 text-[#1A3B47] relative text-lg border-b border-gray-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: notification.body }}
                      ></div>
                    </td>
                    <td className="px-4 py-3 text-[#1A3B47] text-lg border-b border-gray-200">
                      {formatDate(notification.date)}
                      {!notification.seen && (
                        <span className="ml-2 bg-[#F88C33] text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
