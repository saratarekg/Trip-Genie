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
import { Search, Trash2, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

export function DeleteAccount() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

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

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("jwt");
      const userToDelete = users.find((user) => user._id === id);
      if (!userToDelete) {
        setFeedbackMessage("User not found.");
        return;
      }
      const userRole = userToDelete.role;
      if (!userRole) {
        setFeedbackMessage("Cannot delete user: role is undefined.");
        return;
      }
      const url = `http://localhost:4000/admin/${userRole}s/${id}`;
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if ([200, 204, 201].includes(response.status)) {
        await fetchUsers(activeRole);
        setFeedbackMessage("Account deleted successfully.");
        setTimeout(() => setFeedbackMessage(""), 2000);
      } else {
        setFeedbackMessage("Failed to delete account.");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      setFeedbackMessage("Error occurred while deleting account.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
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
                <div className="text-center text-[#1A3B47]/60 py-12 bg-white rounded-lg shadow">
                  No users found
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
                              onClick={() => setConfirmDelete(user._id)}
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

        <Dialog
          open={!!confirmDelete}
          onOpenChange={() => setConfirmDelete(null)}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#1A3B47]">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-[#5D9297]">
                Are you sure you want to delete this account? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="border-[#B5D3D1] text-[#1A3B47] hover:bg-[#B5D3D1]/10"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="bg-[#388A94] hover:bg-[#2e6b77]"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
