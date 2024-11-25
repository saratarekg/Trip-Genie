import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Dashboard() {
  //const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="flex h-screen bg-gray-100">
          <div className="flex-1 space-y-4">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      {/* You can add a chart or graph here */}
                      <div className="h-[200px] bg-muted rounded-md flex items-center justify-center">
                        Chart Placeholder
                      </div>
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
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Content</CardTitle>
                    <CardDescription>
                      Add your analytics content here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add your analytics content here */}
                    <p>Analytics data and visualizations go here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports Content</CardTitle>
                    <CardDescription>
                      Add your reports content here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add your reports content here */}
                    <p>Various reports and data summaries go here.</p>
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
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">John Doe</h3>
          <p className="text-sm text-gray-500">Admin</p>
        </div>
      </CardContent>
    </Card>
    <Card className="h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          {notifications.map((notification) => (
            <div key={notification.id} className="mb-4 p-3 bg-gray-100 rounded-md">
              <p>{notification.message}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
          </div>
        </div>
  )
}

