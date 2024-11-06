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
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003f66] mb-8">
          Manage User Accounts
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center mb-6">
            <Select
              onValueChange={handleRoleChange}
              className="w-full max-w-[280px] mb-4"
            >
              <SelectTrigger className="text-lg bg-[#f7f7f7] rounded-lg border-[#808080]">
                <SelectValue
                  placeholder="Choose an account type"
                  className="text-lg"
                />
              </SelectTrigger>
              <SelectContent className="bg-[#f7f7f7]">
                <SelectItem className="text-lg text-[#003f66]" value="admin">Admin</SelectItem>
                <SelectItem className="text-lg text-[#003f66]" value="tourist">Tourist</SelectItem>
                <SelectItem className="text-lg text-[#003f66]" value="governor">Governor</SelectItem>
                <SelectItem className="text-lg text-[#003f66]" value="seller">Seller</SelectItem>
                <SelectItem className="text-lg text-[#003f66]" value="tourGuide">Tour Guide</SelectItem>
                <SelectItem className="text-lg text-[#003f66]" value="advertiser">Advertiser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filter && (
            <div className="mb-4">
              <div className="flex justify-between font-bold text-[#003f66] py-2 text-lg border-b">
                <span>Username</span>
              </div>
              <div className="mt-4">
                {filteredUsers.length > 0 ? (
                  <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <li
                        key={user._id}
                        className="flex justify-between items-center py-3 px-4 bg-[#f7f7f7] rounded-lg border border-[#808080]"
                      >
                        <span className="text-lg">{user.username}</span>
                        <Button
                          onClick={() => setConfirmDelete(user._id)}
                          className="bg-[#ED8936] hover:bg-[#D6782D] text-white"
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">No users found.</p>
                )}
              </div>
            </div>
          )}

          {feedbackMessage && (
            <div className="mt-4 text-center text-red-500">
              {feedbackMessage}
            </div>
          )}
          {deleteSuccessMessage && (
            <div className="mt-4 text-center text-green-500">
              {deleteSuccessMessage}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="sm:max-w-[400px] bg-white rounded-lg shadow-lg border border-gray-300">
            <DialogHeader>
              <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-lg">
              Are you sure you want to delete this account?
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setConfirmDelete(null)} className="mr-2 bg-gray-500 text-white">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
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
