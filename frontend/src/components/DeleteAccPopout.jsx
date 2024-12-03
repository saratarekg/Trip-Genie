"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";
import { Search, Trash2, Mail, User, UserX } from "lucide-react";
import { motion } from "framer-motion";
import DeleteConfirmation from "@/components/ui/deletionConfirmation";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { CheckCircle, XCircle } from "lucide-react";

export function DeleteAccount() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const roles = [
    { id: "all", label: "All Users" },
    { id: "admin", label: "Admins" },
    { id: "tourist", label: "Tourists" },
    { id: "governor", label: "Governors" },
    { id: "seller", label: "Sellers" },
    { id: "tourGuide", label: "Tour Guides" },
    { id: "advertiser", label: "Advertisers" },
  ];

  const fetchUsers = async (role) => {
    try {
      const token = Cookies.get("jwt");
      const url = "http://localhost:4000/admin/userbyrole";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: role === "all" ? undefined : role },
      });
      if (response.data) {
        const allUsers = Array.isArray(response.data.allUsers)
          ? response.data.allUsers
          : response.data.users || [];
        setUsers(allUsers);
      }
    } catch (error) {
      console.error("Error getting users:", error);
      setFeedbackMessage("Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers(activeRole);
  }, [activeRole]);

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("jwt");
      const userToDelete = users.find((user) => user._id === id);
      if (!userToDelete) {
        showToast("User not found.", "error");
        return;
      }
      const userRole = userToDelete.role;
      if (!userRole) {
        showToast("Cannot delete user: role is undefined.", "error");
        return;
      }
      const url = `http://localhost:4000/admin/${userRole}s/${id}`;
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if ([200, 204, 201].includes(response.status)) {
        await fetchUsers(activeRole);
        showToast("Account deleted successfully.", "success");
      } else {
        showToast("Failed to delete account.", "error");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      showToast("Error occurred while deleting account.", "error");
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await handleDelete(userToDelete._id);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ToastProvider>
      <div className="">
        <div className="space-y-6">
          <Tabs
            defaultValue={activeRole}
            onValueChange={setActiveRole}
            className="w-full"
          >
            <div className="border-b border-[#B5D3D1]/20">
              <TabsList className="h-10 bg-transparent w-full justify-start">
                {roles.map((role) => (
                  <TabsTrigger
                    key={role.id}
                    value={role.id}
                    className="relative h-10 rounded-none border-none bg-transparent px-4 font-medium text-[#1A3B47]/60 hover:text-[#1A3B47] data-[state=active]:text-[#1A3B47] data-[state=active]:shadow-none data-[state=active]:bg-transparent before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#388A94] before:opacity-0 hover:before:opacity-100 data-[state=active]:before:opacity-100 before:transition-opacity"
                  >
                    {role.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <div className="relative w-full mb-6">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5D9297]" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-[#B5D3D1] focus:ring-[#388A94] w-full"
                    style={{ textIndent: "0.5rem" }}
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-[#1A3B47]/60 py-8 bg-white rounded-lg shadow h-52">
                    <UserX className="h-12 w-12 text-[#5D9297]" />
                    <p className="text-xl font-semibold">No users found. Please try a different search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <Avatar className="h-12 w-12 bg-[#B5D3D1]">
                                {user.profilePicture || user.logo ? (
                                  <img
                                    src={
                                      user.profilePicture?.url || user.logo?.url
                                    }
                                    alt={user.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="text-[#1A3B47] font-semibold">
                                    {user.username?.charAt(0).toUpperCase() ||
                                      "U"}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(user)}
                                className="text-[#388A94] hover:text-[#2e6b77] hover:bg-[#B5D3D1]/10 rounded-full"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            <h3 className="font-bold text-lg text-[#1A3B47] mb-2">
                              {user.username}
                            </h3>
                            <div className="space-y-2 text-sm text-[#5D9297]">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>{user.email || "N/A"}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                <Badge
                                  variant="secondary"
                                  className="bg-[#388A94]/10 text-[#388A94]"
                                >
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-md ${
                feedbackMessage.includes("successfully")
                  ? "bg-[#B5D3D1]/20 text-[#1A3B47]"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {feedbackMessage}
            </motion.div>
          )}

          <DeleteConfirmation
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            itemType="account"
            onConfirm={handleConfirmDelete}
          />
        </div>
      </div>

      <ToastViewport />
      {isToastOpen && (
        <Toast
          onOpenChange={setIsToastOpen}
          open={isToastOpen}
          duration={3000}
          className={toastType === "success" ? "bg-green-100" : "bg-red-100"}
        >
          <div className="flex items-center">
            {toastType === "success" ? (
              <CheckCircle className="text-green-500 mr-2" />
            ) : (
              <XCircle className="text-red-500 mr-2" />
            )}
            <div>
              <ToastTitle>
                {toastType === "success" ? "Success" : "Error"}
              </ToastTitle>
              <ToastDescription>{toastMessage}</ToastDescription>
            </div>
          </div>
          <ToastClose />
        </Toast>
      )}
    </ToastProvider>
  );
}
