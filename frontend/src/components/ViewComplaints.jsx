import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, CheckCircle, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

export function ViewComplaints({ onSelectComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState(-1);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = Cookies.get("jwt");
        let role = Cookies.get("role") || "guest";
        const api = `http://localhost:4000/${role}/complaints`;
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: status === "all" ? "" : status,
            asc: sortOrder,
          },
        });

        setComplaints(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching complaints:", err);
      }
    };

    fetchComplaints();
  }, [status, sortOrder]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 1 ? -1 : 1));
  };

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus);
  };

  return (
    <div className="min-h-screen p-6">
      {/* <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div> */}

      <div className="container mx-auto px-4">
        <div className="">
          {/* <h1 className="text-2xl font-bold text-[#003f66] mb-6">
            Complaints Dashboard
          </h1> */}

          {error ? (
            <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">
              {error}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No complaints found.
            </div>
          ) : (
            <div >
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tourist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSortOrder}
                                className="ml-1 hover:bg-[#4A7A7E] text-white"
                              >
                                <ArrowUpDown className="h-3 w-4" />
                              </Button>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                        <DropdownMenu>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 text-[#4A7A7E] hover:text-[#2D6F77] focus:ring-0 focus:ring-offset-0"
                                  >
                                    <Filter className="h-3 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem
                              onClick={() => handleStatusFilter("all")}
                            >
                              All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusFilter("pending")}
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusFilter("resolved")}
                            >
                              Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
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
                        {complaints.map((complaint, index) => (
                          <motion.tr
                            key={complaint._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {complaint.number}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {complaint.tourist.username}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {complaint.title}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(complaint.createdAt)}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center leading-5 font-semibold">
                                {complaint.status === "resolved" ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-[#5D9297] mr-1" />
                                    <span className="text-[#5D9297]">Resolved</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 text-[#D4C4B2] mr-1" />
                                    <span className="text-[#D4C4B2]">Pending</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <span
                                onClick={() => onSelectComplaint(complaint._id)}
                                className="text-[#B5D3D1] cursor-pointer hover:text-[#1A3B47] hover:underline"
                              >
                                View
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    )}
                  </AnimatePresence>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewComplaints;
