import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Cookies from 'js-cookie';
import { MapPin, Calendar, Clock, User, Mail, Phone, Flag, Briefcase, AlertCircle } from 'lucide-react'

export const ViewComplaintDetails = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const token = Cookies.get('jwt');
        let role = Cookies.get('role') || 'guest';

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

    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">
      <AlertCircle className="w-8 h-8 mr-2" />
      Error: {error}
    </div>;
  }

  if (!complaint) {
    return <div className="flex items-center justify-center h-screen text-gray-500">
      <AlertCircle className="w-8 h-8 mr-2" />
      Complaint not found
    </div>;
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 mt-12 bg-gray-50">
      <Card className="p-8 shadow-lg rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{complaint.title}</h1>
            <Badge 
              className={`text-sm py-1 px-3 rounded-full font-semibold mb-6 ${getStatusColor(complaint.status)}`}
            >
              {complaint.status}
            </Badge>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">{complaint.body}</p>
            
            <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <span>{new Date(complaint.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <span>{new Date(complaint.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Card className="p-6 bg-white shadow-md rounded-lg mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tourist Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{complaint.tourist.username}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{complaint.tourist.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{complaint.tourist.mobile}</span>
                </div>
                <div className="flex items-center">
                  <Flag className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{complaint.tourist.nationality.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{new Date(complaint.tourist.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-gray-700">{complaint.tourist.jobOrStudent}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ViewComplaintDetails;