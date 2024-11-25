import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format, subMonths } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserStats() {
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    currentMonth: null,
    lastMonth: null,
  });
  const [yearlyData, setYearlyData] = useState([]);
  const [filteredStats, setFilteredStats] = useState(null);
  const [filters, setFilters] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all-time stats
  useEffect(() => {
    fetchAllTimeStats();
  }, []);

  // Fetch monthly stats and yearly data
  useEffect(() => {
    fetchMonthlyStats();
    fetchYearlyData();
  }, []);

  // Fetch filtered stats when filters change
  useEffect(() => {
    fetchFilteredStats();
  }, [filters]);

  const fetchAllTimeStats = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/admin/users-report",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const token = Cookies.get("jwt");
      const currentDate = new Date();
      const lastMonth = subMonths(currentDate, 1);

      // Get current month stats
      const currentMonthResponse = await axios.get(
        `http://localhost:4000/admin/users-report?month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get last month stats
      const lastMonthResponse = await axios.get(
        `http://localhost:4000/admin/users-report?month=${
          lastMonth.getMonth() + 1
        }&year=${lastMonth.getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMonthlyStats({
        currentMonth: currentMonthResponse.data,
        lastMonth: lastMonthResponse.data,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchYearlyData = async () => {
    try {
      const token = Cookies.get("jwt");
      const currentYear = new Date().getFullYear();
      const monthlyData = [];

      // Fetch data for each month of the current year
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

  const fetchFilteredStats = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/admin/users-report?month=${filters.month}&year=${filters.year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilteredStats(response.data);
    } catch (err) {
      console.error("Error fetching filtered stats:", err);
    }
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous.total === 0) return current?.total > 0 ? 100 : 0;
    return ((current?.total - previous.total) / previous.total) * 100;
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const monthlyChange = calculateChange(
    monthlyStats.currentMonth,
    monthlyStats.lastMonth
  );

  // Use filteredStats for the bottom table, but keep using stats for the top cards
  const tableData = [
    { type: "Tourists", count: filteredStats?.tourist || 0 },
    { type: "Tour Guides", count: filteredStats?.tourGuide || 0 },
    { type: "Sellers", count: filteredStats?.seller || 0 },
    { type: "Advertisers", count: filteredStats?.advertiser || 0 },
    { type: "Governors", count: filteredStats?.governor || 0 },
    { type: "Admins", count: filteredStats?.admin || 0 },
  ];

  return (
    <div className="p-6 bg-[#E6DCCF]/10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-12 mb-4">
          {/* Total Users Card */}
          <Card className="md:col-span-3">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#1A3B47]">
                  Total Users
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="text-center">
                <span className="text-3xl font-bold text-[#1A3B47]">
                  {stats?.total || 0}
                </span>
                <p className="text-sm text-[#5D9297] mt-1">Total Users</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <span className="text-lg font-semibold text-[#1A3B47]">
                    {stats?.tourist || 0}
                  </span>
                  <p className="text-xs text-[#5D9297]">Tourists</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold text-[#1A3B47]">
                    {stats?.tourGuide || 0}
                  </span>
                  <p className="text-xs text-[#5D9297]">Tour Guides</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold text-[#1A3B47]">
                    {stats?.seller || 0}
                  </span>
                  <p className="text-xs text-[#5D9297]">Sellers</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold text-[#1A3B47]">
                    {stats?.advertiser || 0}
                  </span>
                  <p className="text-xs text-[#5D9297]">Advertisers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Stats Cards */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1A3B47]">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#5D9297]">
                    {monthlyStats.currentMonth?.total || 0}
                  </span>
                  <span
                    className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                      monthlyChange >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {monthlyChange >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(monthlyChange).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1A3B47]">
                  Last Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-[#5D9297]">
                  {monthlyStats.lastMonth?.total || 0}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card className="md:col-span-6">
            <CardHeader className="p-3">
              <CardTitle className="text-lg font-bold text-[#1A3B47]">
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={yearlyData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#B5D3D1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#B5D3D1"
                          stopOpacity={0}
                        />
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
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Table */}
        <Card>
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-[#1A3B47]">
                Monthly New Users
              </CardTitle>
              <div className="flex gap-4">
                <Select
                  value={filters.year}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, year: value }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem
                        key={i}
                        value={(new Date().getFullYear() - i).toString()}
                      >
                        {new Date().getFullYear() - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.month}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, month: value }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {format(new Date(2024, i), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((item) => (
                    <tr key={item.type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {filteredStats?.total
                          ? ((item.count / filteredStats.total) * 100).toFixed(
                              1
                            )
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
