import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format, subDays, subMonths, subYears, addDays, addMonths, addYears, startOfYear } from 'date-fns';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" 

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ActivityReport = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [graphPeriod, setGraphPeriod] = useState('week');
  const [filters, setFilters] = useState({
    activity: '',
    month: '',
    year: ''
  });
  const [graphData, setGraphData] = useState([]);
  const [activityNames, setActivityNames] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppRevenue, setTotalAppRevenue] = useState(0);
  const [selectedPeriodRevenue, setSelectedPeriodRevenue] = useState(0);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState(null);

  const getUserRole = () => {
    let role = Cookies.get("role");
    if (!role) role = "guest";
    return role;
  };

  const fetchSalesReport = async (overrideFilters = filters) => {
    try {
      const token = Cookies.get('jwt');
      const role = getUserRole();
      const { day, month, year } = overrideFilters;
      const url = new URL(`http://localhost:4000/${role}/activities-report`);
      if (day) url.searchParams.append('day', day);
      if (month) url.searchParams.append('month', month);
      if (year) url.searchParams.append('year', year);

      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSalesReport(response.data);
      if (response.data && response.data.activitiesSales) {
        updateGraphData(response.data.activitiesSales, graphPeriod);
        
        const uniqueActivityNames = [...new Set(response.data.activitiesSales
          .filter(item => item.activity && item.activity.name)
          .map(item => item.activity.name))];
        setActivityNames(uniqueActivityNames);

        setTotalRevenue(response.data.totalActivitiesRevenue || 0);
        setTotalAppRevenue(response.data.totalActivitiesAppRevenue || 0);
        setSelectedPeriodRevenue(calculatePeriodRevenue(response.data.activitiesSales, 'all'));

        // Apply activity filter in frontend
        const filteredData = filters.activity
          ? response.data.activitiesSales.filter(item => item.activity && item.activity.name === filters.activity)
          : response.data.activitiesSales;
        setFilteredSales(filteredData.filter(item => item.totalRevenue > 0));
      } else {
        setError('Invalid data structure received from the server: activitiesSales missing');
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setError('Failed to fetch sales report. Please try again later.');
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [filters.day, filters.month, filters.year, filters.activity, graphPeriod]);

  useEffect(() => {
    if (salesReport) {
      setSelectedPeriodRevenue(calculatePeriodRevenue(salesReport.activitiesSales, selectedPeriod));
    }
  }, [selectedPeriod, salesReport]);

  useEffect(() => {
    if (salesReport) {
      updateGraphData(salesReport.activitiesSales, graphPeriod);
    }
  }, [graphPeriod, salesReport]);

  const updateGraphData = (salesData, period) => {
    if (!Array.isArray(salesData)) {
      console.error('Invalid sales data:', salesData);
      return;
    }
    const now = new Date();
    let startDate, dateFormat, groupingFunction, data;

    switch (period) {
      case 'week':
        startDate = subDays(now, 6);
        dateFormat = 'EEE';
        groupingFunction = (date) => format(date, 'yyyy-MM-dd');
        data = Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(startDate, i), dateFormat),
          sales: 0,
          revenue: 0
        }));
        break;
      case 'year':
        startDate = startOfYear(now);
        dateFormat = 'MMM';
        groupingFunction = (date) => format(date, 'yyyy-MM');
        data = Array.from({ length: 12 }, (_, i) => ({
          date: format(addMonths(startDate, i), dateFormat),
          sales: 0,
          revenue: 0
        }));
        break;
      case 'all':
        startDate = subYears(now, 7);
        dateFormat = 'yyyy';
        groupingFunction = (date) => format(date, 'yyyy');
        data = Array.from({ length: 8 }, (_, i) => ({
          date: format(addYears(startDate, i), dateFormat),
          sales: 0,
          revenue: 0
        }));
        break;
    }

    salesData.forEach(item => {
      const date = new Date(item.activity.createdAt);
      if (date >= startDate && date <= now) {
        const key = groupingFunction(date);
        const index = data.findIndex(d => d.date === format(date, dateFormat));
        if (index !== -1) {
          data[index].sales += 1;
          data[index].revenue += item.appRevenue;
        }
      }
    });

    setGraphData(data);
  };

  const calculatePeriodRevenue = (salesData, period) => {
    if (!Array.isArray(salesData)) return 0;
    const now = new Date();
    return salesData.reduce((sum, item) => {
      const saleDate = new Date(item.activity.createdAt);
      // console.log(saleDate.toDateString());
      switch (period) {
        case 'today':
          return sum + (saleDate.toDateString() === now.toDateString() ? item.appRevenue : 0);
        case 'week':
          const weekAgo = subDays(now, 7);
          return sum + (saleDate >= weekAgo && saleDate <= now ? item.appRevenue : 0);
        case 'month':
          return sum + (saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear() ? item.appRevenue : 0);
        case 'year':
          return sum + (saleDate.getFullYear() === now.getFullYear() ? item.appRevenue : 0);
        case 'all':
        default:
          return sum + item.appRevenue;
      }
    }, 0);
  };

  const resetFilters = () => {
    setFilters({ activity: '', month: '', year: '' });
    fetchSalesReport({ activity: '', month: '', year: '' });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'year') {
      newFilters.month = '';
      newFilters.day = '';
    } else if (key === 'month') {
      newFilters.day = '';
    }
    setFilters(newFilters);
    const searchParams = new URLSearchParams();
    ['day', 'month', 'year'].forEach(key => {
      if (newFilters[key]) searchParams.append(key, newFilters[key]);
    });
    navigate(`/activity-report?${searchParams.toString()}`);
  };

  const applyActivityFilter = (activityName) => {
    const filteredData = activityName
      ? salesReport.activitiesSales.filter(item => item.activity && item.activity.name === activityName)
      : salesReport.activitiesSales;
    setFilteredSales(filteredData.filter(item => item.totalRevenue > 0));
  };

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!salesReport) return <div className="p-6 text-center">Loading...</div>;

  const fillPercentage = totalAppRevenue ? (selectedPeriodRevenue / totalAppRevenue) * 100 : 0;

  const thisMonthSales = calculatePeriodRevenue(salesReport?.activitiesSales || [], 'month');
  const lastMonthSales = (() => {
    const lastMonth = subMonths(new Date(), 1);
    return salesReport?.activitiesSales?.reduce((sum, item) => {
      const saleDate = new Date(item.createdAt);
      return sum + (saleDate.getMonth() === lastMonth.getMonth() && 
                   saleDate.getFullYear() === lastMonth.getFullYear() ? item.appRevenue : 0);
    }, 0) || 0;
  })();

  const thisMonthChange = lastMonthSales === 0 ? 100 : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-12 mb-4">
          {/* Total Revenue */}
          <Card className="md:col-span-3 flex flex-col justify-center items-center">
            <CardHeader className="p-3 w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#1A3B47]">Total Revenue</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-[100px] h-7 text-[#388A94] focus:ring-0 focus:ring-offset-0">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="mr-1">{selectedPeriod}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[100px]">
                    <DropdownMenuItem onSelect={() => setSelectedPeriod("today")}>Today</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSelectedPeriod("week")}>This Week</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSelectedPeriod("month")}>This Month</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSelectedPeriod("year")}>This Year</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSelectedPeriod("all")}>All Time</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-3 flex flex-col justify-center items-center w-full">
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E6DCCF" strokeWidth="10" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1A3B47"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{
                      strokeDashoffset: 283 - (283 * fillPercentage) / 100,
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#1A3B47]">${selectedPeriodRevenue?.toFixed(2)}</span>
                  <span className="text-sm text-[#5D9297]">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</span>
                </div>
              </div>
              <div className="text-center mt-4">
                {/* <p className="text-base font-semibold text-[#1A3B47]">
                  {totalRevenue !== null && `Total: $${totalRevenue?.toFixed(2)}`}
                </p> */}
                <p className="text-base text-[#5D9297]">
                  {(fillPercentage).toFixed(1)}% of total
                </p>
                <p className="text-base font-semibold text-[#1A3B47]">
                  {totalAppRevenue !== null && `Commision Revenue: $${totalAppRevenue?.toFixed(2)}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3 flex flex-col gap-4">
            {/* Monthly Sales - This Month */}
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle className="text-lg font-bold text-[#1A3B47]">This Month</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex flex-col items-start -mt-4">
                  <p className="text-sm text-gray-500">Sales</p>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-[#5D9297]">${thisMonthSales.toFixed(2)}</span>
                      <motion.span
                        className={`ml-12 flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                          thisMonthChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {thisMonthChange >= 0 ? (
                          <TrendingUp className="mr-1" />
                        ) : (
                          <TrendingDown className="mr-1" />
                        )}
                        {thisMonthChange.toFixed(1)}%
                      
</motion.span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Sales - Last Month */}
            <Card>
              <CardHeader className="">
                <CardTitle className="text-lg font-bold text-[#1A3B47]">Last Month</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex flex-col items-start -mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Sales</p>
                    <span className="text-lg font-bold text-[#5D9297]">${lastMonthSales.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Analytics Card */}
          <Card className="md:col-span-6">
            <CardHeader className="p-3 mb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-[#1A3B47]">Sales Analytics</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-[100px] h-7 text-[#388A94] focus:ring-0 focus:ring-offset-0">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="mr-1">{graphPeriod}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[100px]">
                    <DropdownMenuItem onSelect={() => setGraphPeriod("week")}>This Week</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setGraphPeriod("year")}>This Year</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setGraphPeriod("all")}>All Time</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={graphData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B5D3D1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#B5D3D1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#B5D3D1"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                        stroke: "#B5D3D1",
                        fill: "white",
                      }}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#B5D3D1",
                        fill: "white",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-[#1A3B47]">Sales Report</CardTitle>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="flex flex-wrap gap-4 mb-4">
              <Select 
                value={filters.activity}
                onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value }))}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityNames.map((name, index) => (
                    <SelectItem key={index} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={filters.year}
                onValueChange={(value) => setFilters(prev => ({ ...prev, year: value, month: ''}))}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={filters.month}
                onValueChange={(value) => setFilters(prev => ({ ...prev, month: value}))}
                disabled={!filters.year}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {format(new Date(2024, i), 'MMMM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Total Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Revenue</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  {!isFiltering && (
                    <motion.tbody 
                      key="table-body"
                      className="bg-white divide-y divide-gray-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {filteredSales.map((item, index) => (
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {Math.round(item.totalRevenue / item.activity.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.activity.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${parseFloat(item.totalRevenue).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${parseFloat(item.appRevenue).toFixed(2)}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  )}
                </AnimatePresence>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityReport;

