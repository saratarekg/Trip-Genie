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
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import { AdminGovernorPopup } from "@/components/admin-governor-popup";
import { DeleteAccount } from "@/components/DeleteAccPopout";
import { CategoryCRUD } from "@/components/category-crud";
import { TagCRUD } from "@/components/tags-crud";
import { Dialog } from "@/components/ui/dialog";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";

Chart.register(ArcElement, Tooltip, Legend);

// Reusable DashboardCard component
const DashboardCard = ({ title, value, subtitle, icon }) => (
  <Card className="bg-white border-[#808080] border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-[#003f66]">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-[#003f66]">{value}</div>
      <p className="text-xs text-[#808080]">{subtitle}</p>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isAdminGovernorPopupOpen, setIsAdminGovernorPopupOpen] =
    useState(false);
  const [isCategoryCRUDOpen, setIsCategoryCRUDOpen] = useState(false);
  const [isTagCRUDOpen, setIsTagCRUDOpen] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      setFooterHeight(footer.offsetHeight);
    }

    const handleResize = () => {
      if (footer) {
        setFooterHeight(footer.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardData = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      subtitle: "+20.1% from last month",
      icon: <BarChart className="h-4 w-4 text-[#808080]" />,
    },
    {
      title: "Subscriptions",
      value: "+2350",
      subtitle: "+180.1% from last month",
      icon: <Users className="h-4 w-4 text-[#808080]" />,
    },
    {
      title: "Sales",
      value: "+12,234",
      subtitle: "+19% from last month",
      icon: <Gift className="h-4 w-4 text-[#808080]" />,
    },
    {
      title: "Active Now",
      value: "+573",
      subtitle: "+201 since last hour",
      icon: <Activity className="h-4 w-4 text-[#808080]" />,
    },
  ];

  // Data for the pie charts with updated color palette
  const pieData1 = {
    labels: ["Revenue", "Expenses", "Profit"],
    datasets: [
      {
        label: "Financial Overview",
        data: [30000, 10000, 5000],
        backgroundColor: ["#808080", "#FF8C00", "#003366"],
        hoverBackgroundColor: ["#A9A9A9", "#FFA500", "#004080"],
      },
    ],
  };

  const pieData2 = {
    labels: ["Subscriptions", "Sales", "New Users"],
    datasets: [
      {
        label: "User Metrics",
        data: [2350, 1234, 573],
        backgroundColor: ["#808080", "#FF8C00", "#003366"],
        hoverBackgroundColor: ["#A9A9A9", "#FFA500", "#004080"],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <br />
        <br />
        <br />
        <p className="text-3xl font-bold mb-6 text-[#003f66]">
          Welcome to your Dashboard Genie!
        </p>
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
            <TabsTrigger
              value="accounts"
              className="bg-white text-[#003f66] shadow-sm data-[state=active]:bg-[#ED8936] data-[state=active]:text-white"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="bg-white text-[#003f66] shadow-sm data-[state=active]:bg-[#ED8936] data-[state=active]:text-white"
            >
              <Layers className="w-4 h-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="giftshop"
              className="bg-white text-[#003f66] shadow-sm data-[state=active]:bg-[#ED8936] data-[state=active]:text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Gift Shop
            </TabsTrigger>
          </TabsList>
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Review Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
                    View
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Manage Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-[#ED8936] hover:bg-[#003f66]"
                    onClick={() => setIsDeleteAccountOpen(true)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Add Admin/Governor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-[#ED8936] hover:bg-[#003f66]"
                    onClick={() => setIsAdminGovernorPopupOpen(true)}
                  >
                    Add
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="activities" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Manage Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-[#ED8936] hover:bg-[#003f66]"
                    onClick={() => setIsCategoryCRUDOpen(true)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Manage Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-[#ED8936] hover:bg-[#003f66]"
                    onClick={() => setIsTagCRUDOpen(true)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Manage Itineraries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/all-itineraries">
                    <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="giftshop" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Manage Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/all-products">
                    <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#808080] border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#003f66]">
                    Create Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
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

      {isDeleteAccountOpen && (
        <DeleteAccount onClose={() => setIsDeleteAccountOpen(false)} />
      )}
      <Dialog
        open={isAdminGovernorPopupOpen}
        onOpenChange={setIsAdminGovernorPopupOpen}
      >
        <AdminGovernorPopup
          isOpen={isAdminGovernorPopupOpen}
          onClose={() => setIsAdminGovernorPopupOpen(false)}
        />
      </Dialog>
      <Dialog open={isCategoryCRUDOpen} onOpenChange={setIsCategoryCRUDOpen}>
        <CategoryCRUD
          isOpen={isCategoryCRUDOpen}
          onClose={() => setIsCategoryCRUDOpen(false)}
        />
      </Dialog>
      <Dialog open={isTagCRUDOpen} onOpenChange={setIsTagCRUDOpen}>
        <TagCRUD
          isOpen={isTagCRUDOpen}
          onClose={() => setIsTagCRUDOpen(false)}
        />
      </Dialog>
    </div>
  );
}
