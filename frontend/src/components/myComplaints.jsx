import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function MyComplaintsComponent() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      {complaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {complaints.map((complaint) => (
            <AccordionItem key={complaint._id} value={complaint._id}>
              <AccordionTrigger className="grid grid-cols-[1fr_auto] items-center w-full py-4 gap-4">
                <div className="text-left font-medium truncate">
                  {complaint.title}
                </div>
                <div
                  className="w-24 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="custom"
                    className={`${getStatusColor(
                      complaint.status
                    )} hover:${getStatusColor(complaint.status)}`}
                  >
                    {complaint.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{complaint.body}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Replies:</h4>
                    <div className="space-y-2">
                      {complaint.replies && complaint.replies.length > 0 ? (
                        complaint.replies.map((reply, index) => (
                          <Card key={index} className="bg-gray-50">
                            <CardContent className="p-4">
                              <p className="text-sm">{reply.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                By Admin on{" "}
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No replies yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
