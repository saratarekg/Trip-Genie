import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';

export const ViewComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const token = Cookies.get('jwt');
                let role = Cookies.get('role') || 'guest';
                const api = `http://localhost:4000/${role}/complaints`;
                const response = await axios.get(api, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setComplaints(response.data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching complaints:', err);
            }
        };

        fetchComplaints();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-8 my-12">
            <h1 className="text-3xl font-bold mb-6"> Complaints</h1>
            {complaints.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-sky-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Complaint No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tourist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {complaints.map((complaint, index) => (
                                <tr key={complaint._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.tourist.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/complaint/${complaint._id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewComplaints;