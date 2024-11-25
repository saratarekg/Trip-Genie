import { useState, useEffect } from "react";
import { Bell, Loader2, X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationsDropdownAdmin() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkUnseenNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    } else if (!isOpen && notifications.some((n) => !n.seen)) {
      markNotificationsAsSeen();
    }
  }, [isOpen]);

  const checkUnseenNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/admin/unseen-notifications`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );
      setHasUnseenNotifications(response.data.hasUnseen);
    } catch (error) {
      console.error("Error checking unseen notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/admin/notifications`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
        }
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data.slice(0, 5));
      } else if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          seen: true,
        }))
      );
      setHasUnseenNotifications(false);
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200 mr-2 relative">
          <Bell className="h-7 w-7" />
          {hasUnseenNotifications && (
            <span className="absolute top-1 right-2 block h-3 w-3 rounded-full bg-red-500" />
          )}
          <span className="sr-only">Notifications</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white" align="end">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-[#1A3B47]">
            Notifications
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#388A94]" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-[#1A3B47] p-4 text-center">
              No notifications at the moment.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors relative"
                >
                  {!notification.seen && (
                    <span className="absolute top-2 right-2 bg-[#F88C33] text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  <p className="text-[#1A3B47] mb-1 pr-16">
                    <div
                      dangerouslySetInnerHTML={{ __html: notification.body }}
                    ></div>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(notification.date)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-3 border-t border-gray-200">
          <Button
            className="w-full bg-[#388A94] hover:bg-[#5D9297] text-white"
            onClick={() => (window.location.href = "/admin-notifications")}
          >
            View All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
