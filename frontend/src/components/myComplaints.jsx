import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import FileComplaintForm from "@/components/FileComplaintForm";

export function MyComplaintsComponent() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReplies, setSelectedReplies] = useState([]);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get(
          "http://localhost:4000/tourist/complaints",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComplaints(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to fetch complaints. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-blue-100 text-[#5D9297] hover:text-[#5D9297] hover:bg-blue-100";
      case "pending":
        return "bg-orange-100 text-[#F88C33] hover:bg-orange-100 hover:text-[#F88C33]";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const openReplies = (replies) => {
    setSelectedReplies(replies);
    setIsRepliesOpen(true);
  };

  const closeReplies = () => setIsRepliesOpen(false);

  if (isLoading) {
    return <div className="text-center">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title and Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#1A3B47]">My Complaints</h2>
        <Button
          onClick={openForm}
          className="bg-[#388A94] hover:bg-[#2e6b77] text-white px-4 py-2 rounded-md"
        >
          File a Complaint
        </Button>
      </div>

      {/* Modal for FileComplaintForm */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            
          <FileComplaintForm closeForm={closeForm} />
          </div>
        </div>
      )}

      {/* Modal for Showing Replies */}
      {isRepliesOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#5D9297]">
                Complaint Replies
              </h3>
              <Button
                onClick={closeReplies}
                className="bg-gray-300 hover:bg-gray-400 text-white px-2 py-1 rounded-md"
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              {selectedReplies && selectedReplies.length > 0 ? (
                selectedReplies.map((reply, index) => (
                  <div
                    key={index}
                    className="outline outline-[#B5D3D1] p-3 rounded-md shadow-sm"
                  >
                    <p className="text-sm text-gray-700">{reply.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By Admin on{" "}
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No replies yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <p className="text-center text-gray-600">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white border rounded-md shadow-sm p-4 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-teal-800">{complaint.title}</h3>
                <Badge
  className={`px-3 py-1 rounded-md text-xs ${getStatusColor(
    complaint.status
  )} border-0`}
>
  {complaint.status.toUpperCase()}
</Badge>

              </div>
              <p className="text-gray-700 truncate">{complaint.body}</p>
              <div className="text-sm text-gray-500">
  {complaint.replies?.length === 1 ? '1 reply' : `${complaint.replies?.length || 0} replies`}
</div>

              <Button
                onClick={() => openReplies(complaint.replies)}
                className="bg-[#5D9297] text-white px-3 py-1 rounded-md"
              >
                Show Replies
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
