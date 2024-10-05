"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [feedbackMessage, setFeedbackMessage] = useState(""); // State for user feedback
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(""); // State for delete success feedback

  // Fetch users from the backend
  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt"); // Get the JWT token
      const url =
        role === "all"
          ? "http://localhost:4000/admin/users" // Fetch all users
          : "http://localhost:4000/admin/userbyrole"; // Fetch users by role

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: role !== "all" ? { role } : {}, // Only send role if not 'all'
      });

      if (response.data) {
        setUsers(
          Array.isArray(response.data.allUsers)
            ? response.data.allUsers
            : response.data.users || []
        );
      }
    } catch (error) {
      console.error("Error getting users:", error);
      setFeedbackMessage("Failed to load users. Please try again."); // User feedback
    }
  };

  // Fetch all users initially
  useEffect(() => {
    fetchUsers(filter);
  }, [filter]);

  // Handle role selection change
  const handleRoleChange = (role) => {
    setFilter(role);
    fetchUsers(role);
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("jwt");
      const userToDelete = users.find((user) => user._id === id); // Find the user by ID

      if (!userToDelete) {
        console.error("User not found");
        setFeedbackMessage("User not found."); // User feedback
        return;
      }

      const userRole = userToDelete.role; // Get the role of the user
      if (!userRole) {
        console.error("User role is undefined");
        setFeedbackMessage("User role is undefined."); // User feedback
        return;
      }

      const url = `http://localhost:4000/admin/${userRole}s/${id}`; // Create the correct URL based on role

      console.log("Deleting user with ID:", id); // Log the ID being deleted
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response:", response); // Log the response

      // Check for successful deletion status codes
      if (
        response.status === 200 ||
        response.status === 204 ||
        response.status === 201
      ) {
        await fetchUsers(filter); // Re-fetch users after deletion
        setDeleteSuccessMessage("Account deleted successfully."); // Set success message
        console.log("Account deleted successfully");

        // Clear the success message after 2 seconds
        setTimeout(() => {
          setDeleteSuccessMessage(""); // Clear feedback message after 2 seconds
        }, 2000);
      } else {
        setFeedbackMessage("Failed to delete account."); // User feedback
        console.error("Failed to delete account, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      setFeedbackMessage("Error occurred while deleting account."); // User feedback
    }
  };

  // Filter users based on the selected filter option
  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role === filter
  );

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
              onValueChange={handleRoleChange}
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
                    <h3 className="font-bold mb-2 text-blue-900">
                      Username: {user.username}
                    </h3>
                    <Button
                      onClick={() => setConfirmDelete(user._id)} // Set the user ID to confirm deletion
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

          {/* Display success message for deletion here */}
          {deleteSuccessMessage && (
            <div className="mt-4 text-center text-green-500">
              {deleteSuccessMessage}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {confirmDelete && ( // Render confirmation dialog when a user is selected for deletion
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
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
                onClick={async () => {
                  console.log("Attempting to delete:", confirmDelete); // Log the confirmDelete value
                  await handleDelete(confirmDelete);
                  setConfirmDelete(null); // Close dialog after deletion attempt
                }}
                className="bg-red-500 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {feedbackMessage && ( // Display feedback message
        <div className="mt-4 text-center text-red-500">{feedbackMessage}</div>
      )}
    </div>
  );
}
