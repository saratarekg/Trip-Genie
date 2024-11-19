"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Users,
  Gift,
  Activity,
  UserCircle,
  Layers,
  ShoppingBag,
  ClipboardCheck,
  UserCog,
  UserPlus,
  MessageSquare,
  FolderPlus,
  Tags,
  Map,
  Package,
  Ticket,
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

// Register all the chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// Reusable DashboardCard component
const DashboardCard = ({ title, value, subtitle, icon }) => (
  <Card className="bg-white border-[#B5D3D1] border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-[#1A3B47]">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-[#1A3B47]">{value}</div>
      <p className="text-xs text-[#388A94]">{subtitle}</p>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("accounts");

  useEffect(() => {
    return () => {
      // Cleanup function
      const charts = ChartJS.instances;
      Object.keys(charts).forEach(key => {
        charts[key].destroy();
      });
    };
  }, []);

  const dashboardData = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      subtitle: "+20.1% from last month",
      icon: <BarChart className="h-4 w-4 text-[#F88C33]" />,
    },
    {
      title: "Subscriptions",
      value: "+2350",
      subtitle: "+180.1% from last month",
      icon: <Users className="h-4 w-4 text-[#F88C33]" />,
    },
    {
      title: "Sales",
      value: "+12,234",
      subtitle: "+19% from last month",
      icon: <Gift className="h-4 w-4 text-[#F88C33]" />,
    },
    {
      title: "Active Now",
      value: "+573",
      subtitle: "+201 since last hour",
      icon: <Activity className="h-4 w-4 text-[#F88C33]" />,
    },
  ];

  // Data for the pie charts with updated color palette
  const pieData1 = {
    labels: ["Revenue", "Expenses", "Profit"],
    datasets: [
      {
        label: "Financial Overview",
        data: [30000, 10000, 5000],
        backgroundColor: ["#388A94", "#F88C33", "#1A3B47"],
        hoverBackgroundColor: ["#B5D3D1", "#E6DCCF", "#2D6F77"],
      },
    ],
  };

  const pieData2 = {
    labels: ["Subscriptions", "Sales", "New Users"],
    datasets: [
      {
        label: "User Metrics",
        data: [2350, 1234, 573],
        backgroundColor: ["#388A94", "#F88C33", "#1A3B47"],
        hoverBackgroundColor: ["#B5D3D1", "#E6DCCF", "#2D6F77"],
      },
    ],
  };

  return (
    <div className="bg-[#E6DCCF] min-h-screen">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="flex-shrink-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="flex-shrink-1 flex-col -h-screen">
        <main className="flex-shrink-1 p-6 overflow-y-auto pt-8 pb-12">
          <p
            className="text-3xl font-bold mb-6 text-[#003f66]"
            style={{
              animation:
                "slideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              opacity: 0,
            }}
          >
            Welcome to your Dashboard Genie!
          </p>
          <style>
            {`
            @keyframes slideRight {
              0% {
                opacity: 0;
                transform: translateX(-100px);
              }
              100% {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}
          </style>
          <Tabs
            defaultValue="accounts"
            className="space-y-12"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
              <TabsTrigger
                value="accounts"
                className="bg-white text-[#1A3B47] shadow-md 
               hover:text-[#1A3B47]
              data-[state=active]:bg-[#5D9297] data-[state=active]:text-[#1A3B47] 
              data-[state=active]:hover:bg-gray-300
              data-[state=active]:hover:scale-100
              transition-all duration-200 
              hover:scale-105 active:scale-95
              border border-[#B5D3D1]
              px-4 py-2 rounded-lg
              font-medium
              flex items-center justify-center
              cursor-pointer"
                onClick={() => setActiveTab("accounts")}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Accounts
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="bg-white text-[#1A3B47] shadow-md 
              hover:bg-[#B5D3D1] hover:text-[#1A3B47]
              data-[state=active]:bg-[#5D9297] data-[state=active]:text-[#1A3B47] 
              data-[state=active]:hover:bg-[#5D9297] 
              data-[state=active]:hover:scale-100
              transition-all duration-200 
              hover:scale-105 active:scale-95
              border border-[#B5D3D1]
              px-4 py-2 rounded-lg
              font-medium
              flex items-center justify-center
              cursor-pointer"
                onClick={() => setActiveTab("activities")}
              >
                <Layers className="w-4 h-4 mr-2" />
                Activities
              </TabsTrigger>
              <TabsTrigger
                value="giftshop"
                className="bg-white text-[#1A3B47] shadow-md 
              hover:bg-[#B5D3D1] hover:text-[#1A3B47]
              data-[state=active]:bg-[#5D9297] data-[state=active]:text-[#1A3B47] 
              data-[state=active]:hover:bg-[#5D9297] 
              data-[state=active]:hover:scale-100
              transition-all duration-200 
              hover:scale-105 active:scale-95
              border border-[#B5D3D1]
              px-4 py-2 rounded-lg
              font-medium
              flex items-center justify-center
              cursor-pointer"
                onClick={() => setActiveTab("giftshop")}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Gift Shop
              </TabsTrigger>
            </TabsList>
            <TabsContent value="accounts" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <ClipboardCheck className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Review Registrations
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/user-approval")}
                      className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200"
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <UserCog className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Manage Accounts
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/manage-accounts")}
                      className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200"
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Add Admin/Governor
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/add-admin-governor")}
                      className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200"
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Complaints
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to="/complaints">
                      <Button className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200">
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="activities" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <FolderPlus className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Manage Categories
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/manage-categories')}
                      className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 
                      text-white transition-all duration-200"
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <Tags className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Manage Tags
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/manage-tags')}
                      className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200"
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <Map className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Manage Itineraries
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to="/all-itineraries">
                      <Button className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200">
                        Manage
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#003f66]">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2 text-[#F88C33]" />
              Manage Activities
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/activity">
            <Button className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200">
              Manage
            </Button>
          </Link>
        </CardContent>
      </Card>
              </div>
            </TabsContent>
            <TabsContent value="giftshop" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Manage Products
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to="/all-products">
                      <Button className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200">
                        Manage
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#808080] border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#003f66]">
                      <div className="flex items-center">
                        <Ticket className="w-4 h-4 mr-2 text-[#F88C33]" />
                        Create Promo Code
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200">
                      Create
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          <hr className="my-6" />
          <div className="flex flex-col md:flex-row justify-evenly flex-wrap">
            <Card
              className="bg-white border-[#808080] border mx-2 my-2"
              style={{ width: "90%", maxWidth: "400px", height: "250px" }}
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#003f66]">
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={pieData1} options={{ maintainAspectRatio: false }} />
              </CardContent>
            </Card>

            <Card
              className="bg-white border-[#808080] border mx-2 my-2"
              style={{ width: "90%", maxWidth: "400px", height: "250px" }}
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#003f66]">
                  User Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={pieData2} options={{ maintainAspectRatio: false }} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
