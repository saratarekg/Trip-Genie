"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import Cookies from "js-cookie";

export function DeleteAccount() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");

  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt");
      const url = "http://localhost:4000/admin/userbyrole";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { role },
      });

      if (response.data) {
        const allUsers = Array.isArray(response.data.allUsers)
          ? response.data.allUsers
          : response.data.users || [];

        allUsers.forEach((user) => {
          if (!user.role) {
            console.warn(`User with ID: ${user._id} has no role defined.`);
          }
        });

        setUsers(allUsers);
      }
    } catch (error) {
      console.error("Error getting users:", error);
      setFeedbackMessage("Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    if (filter) {
      fetchUsers(filter);
    }
  }, [filter]);

  const handleRoleChange = (role) => {
    setFilter(role);
    fetchUsers(role);
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("jwt");
      const userToDelete = users.find((user) => user._id === id);

      if (!userToDelete) {
        console.error("User not found");
        setFeedbackMessage("User not found.");
        return;
      }

      const userRole = userToDelete.role;

      if (!userRole) {
        console.error("Cannot delete user: role is undefined.");
        setFeedbackMessage("Cannot delete user: role is undefined.");
        return;
      }

      const url = `http://localhost:4000/admin/${userRole}s/${id}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if ([200, 204, 201].includes(response.status)) {
        await fetchUsers(filter);
        setDeleteSuccessMessage("Account deleted successfully.");

        setTimeout(() => {
          setDeleteSuccessMessage("");
        }, 2000);
      } else {
        setFeedbackMessage("Failed to delete account.");
        console.error("Failed to delete account, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      setFeedbackMessage("Error occurred while deleting account.");
    }
  };

  const filteredUsers = users.filter((user) => user.role === filter);

  return (
    <div className="bg-[#E6DCCF] min-h-screen">
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-[#003f66] mb-6">
              Manage User Accounts
            </h1>
            
            <div className="flex flex-col items-center mb-6">
              <Select
                onValueChange={handleRoleChange}
                className="w-full max-w-[280px]"
              >
                <SelectTrigger className="bg-white border-[#2D6F77] text-[#2D6F77] hover:bg-gray-50">
                  <SelectValue placeholder="Choose an account type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tourist">Tourist</SelectItem>
                  <SelectItem value="governor">Governor</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="tourGuide">Tour Guide</SelectItem>
                  <SelectItem value="advertiser">Advertiser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filter && (
              <div className="space-y-4">
                <div className="flex justify-between font-semibold text-[#003f66] py-2 border-b">
                  <span>Username</span>
                </div>
                
                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-[#2D6F77] transition-colors"
                      >
                        <span className="text-[#2D6F77] font-medium">{user.username}</span>
                        <Button
                          onClick={() => setConfirmDelete(user._id)}
                          className="bg-red-500 hover:bg-red-600 active:bg-red-700 
                          active:transform active:scale-95 text-white transition-all duration-200 px-6"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No users found for this account type.
                  </div>
                )}
              </div>
            )}

            {feedbackMessage && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-center">
                {feedbackMessage}
              </div>
            )}
            
            {deleteSuccessMessage && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center">
                {deleteSuccessMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#003f66]">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Are you sure you want to delete this account? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 mt-4">
            <Button 
              onClick={() => setConfirmDelete(null)}
              className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 
              active:transform active:scale-95 text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleDelete(confirmDelete);
                setConfirmDelete(null);
              }}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 
              active:transform active:scale-95 text-white transition-all duration-200"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
