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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { Trash2, User, Search } from "lucide-react";

export function DeleteAccount() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");

  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt");
      const url = "http://localhost:4000/admin/userbyrole";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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

  const filteredUsers = users.filter(
    (user) =>
      user.role === filter &&
      (searchQuery === "" ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#E6DCCF] min-h-[calc(100vh-11rem)] pb-8">
      <div className="w-full bg-[#5D9297] py-6 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="container mx-auto px-4 pt-12 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-[#1A3B47] mb-4">
            Manage User Accounts
          </h1>

          <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4">
            <Select
              onValueChange={handleRoleChange}
              className="w-full md:w-[280px] mb-2 md:mb-0"
            >
              <SelectTrigger className="bg-white border-[#5D9297] text-[#5D9297] hover:bg-gray-50">
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D9297]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2" />
            </div>
          </div>

          {filter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-200 hover:border-[#5D9297] transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-[#5D9297]" />
                      <span className="text-[#5D9297] font-medium">
                        {user.username}
                      </span>
                    </div>
                    <Button
                      onClick={() => setConfirmDelete(user._id)}
                      className="p-2 bg-red-100 hover:bg-red-200 transition duration-300 ease-in-out"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-gray-500">
                  No users found for this account type or search query.
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

      <Dialog open={confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDelete(confirmDelete);
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
