"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { CheckCircle, XCircle, User } from "lucide-react";

export default function UserApproval() {
  const [advertisers, setAdvertisers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    fetchAdvertisers();
    fetchSellers();
    fetchTourGuides();
  }, []);

  const fetchFile = async (filename) => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        `http://localhost:4000/admin/files/${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blobUrl = URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Failed to fetch the file", err);
    }
  };

  const fetchAdvertisers = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/admin/unaccepted-advertiser",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAdvertisers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch advertisers", err);
      setError("Failed to fetch advertisers");
    }
  };

  const fetchSellers = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/admin/unaccepted-seller",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSellers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch sellers", err);
      setError("Failed to fetch sellers");
    }
  };

  const fetchTourGuides = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get(
        "http://localhost:4000/admin/unaccepted-tourguide",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTourGuides(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch tour guides", err);
      setError("Failed to fetch tour guides");
    }
  };

  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleConfirm = (action, user, role) => {
    setConfirmAction(() => async () => {
      if (action === "approve") {
        await approveUser(user._id, role);
      } else {
        await rejectUser(user, role);
      }
    });
    setConfirmDialogOpen(true);
  };

  const approveUser = async (userId, role) => {
    try {
      const token = Cookies.get("jwt");
      await axios.put(
        `http://localhost:4000/admin/approve-${role}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMessage(`Successfully approved the ${role}.`);
      setToastType("success");
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
      // Re-fetch the user type list after approval
      role === "advertiser"
        ? fetchAdvertisers()
        : role === "seller"
        ? fetchSellers()
        : fetchTourGuides();
    } catch (err) {
      setToastMessage(`Failed to approve ${role}`);
      setToastType("error");
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
      console.error(err);
    }
  };

  const rejectUser = async (user, role) => {
    try {
      const token = Cookies.get("jwt");
      await axios.delete(
        `http://localhost:4000/admin/reject/${role}s/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToastMessage(`Successfully rejected the ${role}.`);
      setToastType("success");
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
      // Re-fetch the user type list after rejection
      if (role === "advertiser") {
        fetchAdvertisers();
      } else if (role === "seller") {
        fetchSellers();
      } else {
        fetchTourGuides();
      }
    } catch (err) {
      setToastMessage(`Failed to reject ${role}`);
      setToastType("error");
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000); // Close toast after 3 seconds
      console.error(err);
    }
  };

  const renderUserCards = (users, role, startIndex = 0) =>
    users.map((user, index) => (
      <Card
        key={user._id}
        className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <CardHeader className="border-b bg-gray-50 py-2 px-3">
          <CardTitle className="text-base font-semibold text-[#003f66] text-center">
            User {startIndex + index + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#5D9297] flex items-center justify-center flex-shrink-0 ">
              <User size={32} className="text-white " />
            </div>
            <div className="w-px h-16 bg-gray-200"></div>
            <div>
              <h3 className="font-bold text-[#003f66] text-lg mb-1">
                {user.name}
              </h3>
              <span className="text-[#5D9297] text-xs font-medium">{role}</span>
            </div>
          </div>

          {user.files && (
            <div className="flex flex-col items-center space-y-2 w-full">
              {user.files.IDFilename && (
                <Button
                  onClick={() => fetchFile(user.files.IDFilename)}
                  className="w-full bg-white text-[#2D6F77] border border-[#2D6F77] hover:bg-[#2D6F77] hover:text-teal hover:font-bold active:bg-[#1A3B47] active:transform active:scale-95 transition-all duration-200 py-1 rounded-md text-sm"
                  variant="outline"
                >
                  View ID Document
                </Button>
              )}
              {user.files.taxationRegistryCardFilename && (
                <Button
                  onClick={() =>
                    fetchFile(user.files.taxationRegistryCardFilename)
                  }
                  className="w-full bg-white text-[#2D6F77] border border-[#2D6F77] hover:bg-[#2D6F77] hover:text-teal hover:font-bold active:bg-[#1A3B47] active:transform active:scale-95 transition-all duration-200 py-1 rounded-md text-sm"
                  variant="outline"
                >
                  View Taxation Registry Card
                </Button>
              )}
              {user.files.certificatesFilenames &&
                user.files.certificatesFilenames.length > 0 &&
                user.files.certificatesFilenames.map(
                  (certificate, certIndex) => (
                    <Button
                      key={certIndex}
                      onClick={() => fetchFile(certificate)}
                      className="w-full bg-white text-[#2D6F77] border border-[#2D6F77] hover:bg-[#2D6F77] hover:text-teal hover:font-bold active:bg-[#1A3B47] active:transform active:scale-95 transition-all duration-200 py-1 rounded-md text-sm"
                      variant="outline"
                    >
                      View Certificate {certIndex + 1}
                    </Button>
                  )
                )}
            </div>
          )}
          <div className="flex space-x-2">
            <Button
              onClick={() => handleConfirm("reject", user, role)}
              className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 active:transform active:scale-95 text-white transition-all duration-200 py-1 rounded-md text-sm"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleConfirm("approve", user, role)}
              className="flex-1 text-sm bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] active:transform active:scale-95 text-white transition-all duration-200 py-1 rounded-md"
            >
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    ));

  return (
    <div className="flex flex-col">
      <ToastProvider>
        <div className="flex-grow container mx-auto px-4 sm:py-8 flex items-center justify-center">
          <div className="w-full">
            <div className="p-4 sm:p-6">
              {/* <h1 className="text-xl sm:text-2xl font-bold text-[#003f66] mb-4 sm:mb-6">
                User Approval Dashboard
              </h1> */}

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
                  {error}
                </div>
              )}

              {advertisers.length === 0 &&
              sellers.length === 0 &&
              tourGuides.length === 0 ? (
                <div className="flex items-center justify-center h-24 sm:h-32">
                  <p className="text-base sm:text-lg text-[#003f66] text-center px-4">
                    No users to Accept/Reject. Please check again later!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
                  {renderUserCards(advertisers, "advertiser", 0)}
                  {renderUserCards(sellers, "seller", advertisers.length)}
                  {renderUserCards(
                    tourGuides,
                    "tourGuide",
                    advertisers.length + sellers.length
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[#003f66]">
                Success
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {dialogMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                onClick={() => setDialogOpen(false)}
                className="bg-[#5D9297] hover:bg-[#388A94] text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[#003f66]">
                Confirm Action
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Are you sure you want to proceed with this action?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 space-x-2">
              <Button
                onClick={() => {
                  confirmAction();
                  setConfirmDialogOpen(false);
                }}
                className="bg-[#5D9297] hover:bg-[#388A94] text-white"
              >
                Yes
              </Button>
              <Button
                onClick={() => setConfirmDialogOpen(false)}
                variant="outline"
                className="border-[#808080] text-[#003f66] hover:bg-gray-100"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToastViewport />
        {isToastOpen && (
          <Toast
            onOpenChange={setIsToastOpen}
            open={isToastOpen}
            duration={2000}
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
    </div>
  );
}
