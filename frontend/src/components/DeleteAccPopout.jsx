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
  const [users, setUsers] = useState([]); // Ensure it's initialized as an empty array
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch users from the backend
  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt"); // Replace with your actual token
      const url =
        role === "all"
          ? "http://localhost:4000/admin/users" // Fetch all users
          : "http://localhost:4000/admin/userbyrole"; // Fetch users by role

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: role !== "all" ? role : undefined, // Include role as query parameter if it's not "all"
        },
      });

      // Check if the response data structure is as expected
      if (response.data && response.data.allUsers) {
        setUsers(response.data.allUsers); // Update the user list
      } else {
        console.error("Unexpected response structure:", response.data);
        setUsers([]); // Reset to an empty array if the structure is not as expected
      }
    } catch (error) {
      console.error("Error getting users:", error);
      setUsers([]); // Reset to an empty array on error
    }
  };

  // Fetch all users initially
  useEffect(() => {
    fetchUsers("all");
  }, []);

  // Handle role selection change
  const handleRoleChange = (role) => {
    setFilter(role); // Update filter state
    fetchUsers(role); // Fetch users by the selected role
  };

  // Filter users based on the selected filter option
  const filteredUsers = users.filter((user) => filter === "all" || user.type === filter);
  const displayedUsers = showAll ? filteredUsers : filteredUsers.slice(0, 3);

  // Handle user deletion
  const handleDelete = (id) => {
    try {
      setUsers(users.filter((user) => user.id !== id));
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
              onValueChange={handleRoleChange} // Update the onValueChange to handle role changes
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

            <Button
              onClick={() => setShowAll(!showAll)}
              className="bg-orange-500 hover:bg-orange-600 text-white mt-4"
            >
              {showAll ? "Show Less" : "View All"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto">
            {displayedUsers.map((user) => (
              <Card key={user.id} className="flex flex-col justify-between">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-2 text-blue-900">Username: {user.username}</h3>
                  <Button
                    onClick={() => setConfirmDelete(user.id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
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
