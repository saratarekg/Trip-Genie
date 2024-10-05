"use client";

import React, { useState } from "react";
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

import { AdminGovernorPopup } from "@/components/admin-governor-popup";
import { DeleteAccount } from "@/components/DeleteAccPopout";
import { CategoryCRUD } from "@/components/category-crud";

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
  const [isAdminGovernorPopupOpen, setIsAdminGovernorPopupOpen] = useState(false);
  const [isCategoryCRUDOpen, setIsCategoryCRUDOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-[#003f66] text-white">
        <h1 className="text-2xl font-bold">Dashboard Genie</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-[#ED8936]"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-[#ED8936]"
          >
            <Gift className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-6 text-[#003f66]">
          Welcome to your Dashboard Genie!
        </h2>
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
            <div className="grid gap-4 md:grid-cols-2">
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
                    Manage Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
                    Manage
                  </Button>
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
                  <Button className="w-full bg-[#ED8936] hover:bg-[#003f66]">
                    Manage
                  </Button>
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
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.map((data, index) => (
            <DashboardCard
              key={index}
              title={data.title}
              value={data.value}
              subtitle={data.subtitle}
              icon={data.icon}
            />
          ))}
        </div>
      </main>
      <DeleteAccount 
        isOpen={isDeleteAccountOpen} 
        onClose={() => setIsDeleteAccountOpen(false)}
      />
      <AdminGovernorPopup 
        isOpen={isAdminGovernorPopupOpen} 
        onClose={() => setIsAdminGovernorPopupOpen(false)}
      />
      <CategoryCRUD
        isOpen={isCategoryCRUDOpen}
        onClose={() => setIsCategoryCRUDOpen(false)}
      />
    </div>
  );
}