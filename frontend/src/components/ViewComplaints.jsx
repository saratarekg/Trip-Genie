import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";
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

export function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState(-1);

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
    <div className="bg-[#E6DCCF] min-h-screen">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-[#003f66] mb-6">Complaints Dashboard</h1>

          {error ? (
            <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">{error}</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No complaints found.</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tourist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
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
                                className="ml-1 hover:bg-gray-100"
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
                                    className="ml-1 hover:bg-gray-100"
                                  >
                                    <Filter className="h-3 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                              All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter("pending")}>
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter("resolved")}>
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
                  <tbody className="divide-y divide-gray-200">
                    {complaints.map((complaint, index) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D6F77]">
                          {complaint.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {complaint.tourist.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {complaint.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(complaint.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              complaint.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/complaint/${complaint._id}`}>
                            <Button 
                              className="!bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                              hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                              active:transform active:scale-95 transition-all duration-200"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
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
