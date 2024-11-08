import React, { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function MyComplaintsComponent() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = Cookies.get("jwt")
        const response = await axios.get("http://localhost:4000/tourist/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setComplaints(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching complaints:", error)
        setError("Failed to fetch complaints. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
<div className="w-full max-w-4xl mx-auto">
  {complaints.length === 0 ? (
    <p className="text-center text-gray-600">No complaints found.</p>
  ) : (
    <Accordion type="single" collapsible className="space-y-4">
      {complaints.map((complaint) => (
        <AccordionItem key={complaint._id} value={complaint._id}>
          <AccordionTrigger className="flex justify-between items-center py-3 px-6 bg-white border-b border-gray-300 hover:bg-teal-50 transition duration-200 ease-in-out">
            <div className="font-semibold text-teal-800 truncate">{complaint.title}</div>
            <div className="text-sm">
              <Badge
                variant="outline"
                className={`px-3 py-1 rounded-md text-xs ${getStatusColor(complaint.status)}`}
              >
                {complaint.status}
              </Badge>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-6 bg-white rounded-b-md border border-gray-200">
            <div className="space-y-4">
              <p className="text-gray-700">{complaint.body}</p>

              {/* Replies Section */}
              <div className="mt-4">
                <h4 className="font-semibold text-teal-800 mb-3">Replies</h4>
                <div className="space-y-2">
                  {complaint.replies && complaint.replies.length > 0 ? (
                    complaint.replies.map((reply, index) => (
                      <div key={index} className="bg-teal-50 p-4 rounded-md shadow-sm">
                        <p className="text-sm text-gray-700">{reply.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          By Admin on {new Date(reply.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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

  );}