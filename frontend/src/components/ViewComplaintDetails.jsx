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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 mt-12 bg-gray-50">
      <Card className="p-8 shadow-lg rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {complaint.title}
            </h1>
            <Badge
              className={`text-sm py-1 px-3 rounded-full font-semibold mb-6 ${getStatusColor(
                complaint.status
              )}`}
            >
              {complaint.status}
            </Badge>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {complaint.body}
            </p>

            <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <span>
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <span>
                  {new Date(complaint.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Replies Section */}
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Replies
              </h3>
              {complaint.replies.length ? (
                complaint.replies.map((reply, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-700">{reply.content}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No replies yet</p>
              )}
            </div>

            {/* Add Reply Section */}
            <div className="mb-6">
              <Textarea
                placeholder="Add your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleReply} className="bg-blue-500 text-white">
                Reply to Complaint
              </Button>
            </div>

            {/* Status Change Buttons */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => handleStatusChange("pending")}
                className="bg-yellow-500 text-white"
              >
                Mark as Pending
              </Button>
              <Button
                onClick={() => handleStatusChange("resolved")}
                className="bg-green-500 text-white"
              >
                Mark as Resolved
              </Button>
            </div>
          </div>

          <div>
            <Card className="p-6 bg-white shadow-md rounded-lg mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Tourist Profile
              </h2>
              <div className="space-y-4">
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
  );
};
