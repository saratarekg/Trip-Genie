import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, DollarSign, ShoppingCart, Users, BarChart, Activity, Gift, Map, Archive, Package, Compass, Landmark, Tag } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import Cookies from "js-cookie";
// import { UserGrowthChart } from "./UserStats";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

function UserGrowthChart() {
  const [yearlyData, setYearlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchYearlyData();
  }, []);

  const fetchYearlyData = async () => {
    try {
      const token = Cookies.get("jwt");
      const currentYear = new Date().getFullYear();
      const monthlyData = [];

      for (let month = 0; month < 12; month++) {
        const response = await axios.get(
          `http://localhost:4000/admin/users-report?month=${
            month + 1
          }&year=${currentYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        monthlyData.push({
          month: format(new Date(currentYear, month), "MMM"),
          users: response.data.total || 0,
        });
      }

      setYearlyData(monthlyData);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={yearlyData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B5D3D1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#B5D3D1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#B5D3D1"
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchNotifications();
    fetchAdminInfo();
  }, []);

  const fetchNotifications = async () => {
    try {
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
        console.error("Unexpected data format received from server.");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchAdminInfo = async () => {
    try {
      const token = Cookies.get('jwt'); 
      const response = await axios.get('http://localhost:4000/admin/admin-info', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdminInfo(response.data);
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const initials = name.split(' ').map(word => word[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  };

  const handleReportClick = (reportId) => {
    setActiveTab(reportId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <UserGrowthChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* You can map through recent sales data here */}
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Customer {i + 1}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            customer{i + 1}@example.com
                          </p>
                        </div>
                        <div className="ml-auto font-medium">+$129.00</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>View Content</CardTitle>
                <CardDescription>
                  Select a view to display.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <button onClick={() => handleReportClick('manage-activities')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Activity className="h-12 w-12 mb-2" />
                    <span>All Activities</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-itineraries')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Compass className="h-12 w-12 mb-2" />
                    <span>All Itineraries</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-products')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Package className="h-12 w-12 mb-2" />
                    <span>All Products</span>
                  </button>
                  <button onClick={() => handleReportClick('my-products')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Gift className="h-12 w-12 mb-2" />
                    <span>My Products</span>
                  </button>
                  <button onClick={() => handleReportClick('archived-products')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Archive className="h-12 w-12 mb-2" />
                    <span>Archived Products</span>
                  </button>
                  <button onClick={() => handleReportClick('historical-places')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Landmark className="h-12 w-12 mb-2" />
                    <span>Historical Places</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Content</CardTitle>
                <CardDescription>
                  Select a management option.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <button onClick={() => handleReportClick('review-registration')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Users className="h-12 w-12 mb-2" />
                    <span>Review Registration</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-accounts')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Users className="h-12 w-12 mb-2" />
                    <span>Manage Accounts</span>
                  </button>
                  <button onClick={() => handleReportClick('add-admin-governor')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Users className="h-12 w-12 mb-2" />
                    <span>Add Admin/Governor</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-categories')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Tag className="h-12 w-12 mb-2" />
                    <span>Manage Categories</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-tags')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Tag className="h-12 w-12 mb-2" />
                    <span>Manage Tags</span>
                  </button>
                  <button onClick={() => handleReportClick('create-promo-code')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Tag className="h-12 w-12 mb-2" />
                    <span>Create Promo Code</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-activities')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Activity className="h-12 w-12 mb-2" />
                    <span>Manage Activities</span>
                  </button>
                  <button onClick={() => handleReportClick('manage-itineraries')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Compass className="h-12 w-12 mb-2" />
                    <span>Manage Itineraries</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports Content</CardTitle>
                <CardDescription>
                  Select a report to view.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <button onClick={() => handleReportClick('itinerary-sales-report')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <BarChart className="h-12 w-12 mb-2" />
                    <span>Itineraries Report</span>
                  </button>
                  <button onClick={() => handleReportClick('activity-reports')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Activity className="h-12 w-12 mb-2" />
                    <span>Activities Report</span>
                  </button>
                  <button onClick={() => handleReportClick('my-product-sales-report')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Gift className="h-12 w-12 mb-2" />
                    <span>My Products Report</span>
                  </button>
                  <button onClick={() => handleReportClick('seller-product-sales-report')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <Users className="h-12 w-12 mb-2" />
                    <span>Seller's Products Report</span>
                  </button>
                  <button onClick={() => handleReportClick('user-stats')} className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <BarChart className="h-12 w-12 mb-2" />
                    <span>User Statistics</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-80 p-4 space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{getInitials(adminInfo?.username)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{adminInfo?.username || 'John Doe'}</h3>
              {adminInfo?.email && (
                <p className="text-sm text-gray-500">{adminInfo.email}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="h-[calc(100vh-16rem)]" id="notifications-card">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {notifications.length === 0 ? (
                <p className="text-[#1A3B47] bg-gray-100 p-4 rounded-lg shadow text-center">
                  No notifications at the moment.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification, index) => (
                    <li
                      key={index}
                      className="p-3 hover:bg-gray-50 transition-colors relative cursor-pointer"
                    >
                      {!notification.seen && (
                        <span className="absolute top-2 right-2 bg-[#F88C33] text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                      <p className="text-sm text-[#1A3B47] mb-1 pr-4">
                        <div dangerouslySetInnerHTML={{ __html: notification.body }}></div>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

