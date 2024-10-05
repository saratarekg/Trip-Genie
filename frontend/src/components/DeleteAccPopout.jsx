"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";

export function DeleteAccount() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // Default to 'all'
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch users from the backend
  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt"); // Get the JWT token
      const url = role === "all"
        ? "http://localhost:4000/admin/users" // Fetch all users
        : "http://localhost:4000/admin/userbyrole"; // Fetch users by role
  
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: role !== "all" ? { role } : {}, // Only send role if not 'all'
      });
  
      // Log the response data
      console.log("API Response:", response.data);
  
      // Check for the structure of response and set users accordingly
      if (response.data) {
        if (Array.isArray(response.data.allUsers)) {
          setUsers(response.data.allUsers); // For all users
        } else if (Array.isArray(response.data.users)) {
          setUsers(response.data.users); // For users by role
        } else {
          console.error("Unexpected response structure:", response.data);
          setUsers([]); // Clear users if the response is unexpected
        }
      } else {
        console.error("Unexpected response:", response.data);
        setUsers([]); // Clear users if the response is unexpected
      }
    } catch (error) {
      console.error("Error getting users:", error);
      setUsers([]); // Clear users on error
    }
  };
  

  // Fetch all users initially
  useEffect(() => {
    fetchUsers(filter); // Fetch users based on initial filter state
  }, [filter]); // Add 'filter' as a dependency

  // Handle role selection change
  const handleRoleChange = (role) => {
    setFilter(role); // Update filter state
    fetchUsers(role); // Fetch users based on the selected role
  };

  // Filter users based on the selected filter option
  const filteredUsers = users.filter((user) => filter === "all" || user.role === filter);

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      // Delete the user from your backend
      await axios.delete(`http://localhost:4000/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      });

      // Remove the user from the state
      setUsers(users.filter((user) => user._id !== id)); // Filter out the deleted user
      console.log("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-60 h-[230px] bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none relative"
          >
            <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
              Manage
              <br />
              Accounts
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900 text-xl font-bold">
              Manage User Accounts
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center mb-4">
            <Select
              onValueChange={handleRoleChange} // Update filter on change
              className="w-full max-w-[180px] mb-4"
            >
              <SelectTrigger>
                <SelectValue placeholder="User type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="tourist">Tourist</SelectItem>
                <SelectItem value="governor">Governor</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="tourGuide">Tour Guide</SelectItem>
                <SelectItem value="advertiser">Advertiser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user._id} className="flex flex-col justify-between">
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-2 text-blue-900">Username: {user.username}</h3>
                    <Button
                      onClick={() => setConfirmDelete(user._id)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {confirmDelete && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="hidden">Confirm Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this account?</p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setConfirmDelete(null)} className="mr-2">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="bg-red-500 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
