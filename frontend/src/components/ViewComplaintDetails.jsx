import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Flag,
  Briefcase,
  AlertCircle,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

export const ViewComplaintDetails = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const { id } = useParams();

  const fetchComplaintDetails = async () => {
    try {
      const token = Cookies.get("jwt");
      let role = Cookies.get("role") || "guest";

      const api = `http://localhost:4000/${role}/complaint/${id}`;
      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComplaint(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);
  const handleReply = async () => {
    try {
      const token = Cookies.get("jwt");
      if (!replyContent.trim()) {
        console.error("Reply content is empty.");
        return;
      }
      const response = await axios.post(
        `http://localhost:4000/admin/complaint/${id}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Reply added successfully:", response.data);
      setReplyContent("");
      await fetchComplaintDetails();
    } catch (error) {
      console.error(
        "Failed to add reply",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = Cookies.get("jwt");
      await axios.put(
        `http://localhost:4000/admin/complaint/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchComplaintDetails(); // Refresh complaint details
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        Error: {error}
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        Complaint not found
      </div>
    );
  }

  return (
    <div className="bg-[#E6DCCF] min-h-screen">
      <div className="bg-[#E6DCCF] container mx-auto py-8 px-4 mt-[65px]">
        <Card className="max-w-[1200px] mx-auto p-8 shadow-xl rounded-lg ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
                    {complaint.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(complaint.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="static"
                  className={`${getStatusBadgeVariant(complaint.status)} 
                  text-sm py-1.5 px-4 rounded-full font-semibold whitespace-nowrap`}
                >
                  {complaint.status}
                </Badge>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {complaint.body}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Replies
                </h3>
                {complaint.replies.length ? (
                  complaint.replies.map((reply, index) => (
                    <div
                      key={index}
                      className="p-6 bg-white rounded-lg shadow-sm border border-[#B5D3D1] 
                      hover:shadow-md transition-shadow duration-200"
                    >
                      <p className="text-[#1A3B47] mb-2">{reply.content}</p>
                      <span className="text-sm text-[#5D9297] flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic p-6">No replies yet</p>
                )}
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Add your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[120px] focus:ring-2 focus:ring-[#5D9297]"
                />
                <Button
                  onClick={handleReply}
                  className="bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 
                  text-white transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Reply to Complaint
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleStatusChange("pending")}
                  className="bg-[#F88C33] hover:bg-orange-500 active:bg-orange-600 active:transform active:scale-95 
                  text-white transition-all duration-200 flex-1"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark as Pending
                </Button>
                <Button
                  onClick={() => handleStatusChange("resolved")}
                  className="bg-green-500 hover:bg-green-600 active:bg-green-700 active:transform active:scale-95 
                  text-white transition-all duration-200 flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              </div>
            </div>

            <div>
              <Card className="p-6 bg-white shadow-md rounded-lg border border-[#B5D3D1]">
                <h2 className="text-2xl font-semibold mb-6 text-[#1A3B47] border-b border-[#B5D3D1] pb-4">
                  Tourist Profile
                </h2>
                <div className="space-y-5">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {complaint.tourist.username}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {complaint.tourist.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {complaint.tourist.mobile}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Flag className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {complaint.tourist.nationality.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {new Date(complaint.tourist.dateOfBirth).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {complaint.tourist.jobOrStudent}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
