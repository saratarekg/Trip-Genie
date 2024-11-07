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

export default function UserApproval() {
  const [advertisers, setAdvertisers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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
      showDialog(`Successfully approved the ${role}.`);
      // Re-fetch the user type list after approval
      role === "advertiser"
        ? fetchAdvertisers()
        : role === "seller"
        ? fetchSellers()
        : fetchTourGuides();
    } catch (err) {
      setError(`Failed to approve ${role}`);
      console.error(err);
    }
  };

  const rejectUser = async (user, role) => {
    try {
      const token = Cookies.get("jwt");
      await axios.delete(`http://localhost:4000/admin/${role}s/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showDialog(`Successfully rejected the ${role}.`);
      // Re-fetch the user type list after rejection
      if (role === "advertiser") {
        fetchAdvertisers();
      } else if (role === "seller") {
        fetchSellers();
      } else {
        fetchTourGuides();
      }
    } catch (err) {
      setError(`Failed to reject ${role}`);
      console.error(err);
    }
  };

  const renderUserCards = (users, role) =>
    users.map((user) => (
      <Card key={user._id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b bg-gray-50 py-2 sm:py-3 px-3 sm:px-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-[#003f66]">
            {user.name}
            <span className="text-[#5D9297] text-xs sm:text-sm ml-2">({role})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex space-x-2">
            <Button
              onClick={() => handleConfirm("reject", user, role)}
              className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 
              active:transform active:scale-95 text-white transition-all duration-200"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleConfirm("approve", user, role)}
              className="flex-1 text-sm sm:text-base bg-[#5D9297] hover:bg-[#388A94] active:bg-[#2D6F77] 
              active:transform active:scale-95 text-white transition-all duration-200"
            >
              Accept
            </Button>
          </div>

          {user.files && (
            <div className="flex flex-col items-center space-y-2 w-full">
              {user.files.IDFilename && (
                <Button
                  onClick={() => fetchFile(user.files.IDFilename)}
                  className="w-full !bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                  hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                  active:transform active:scale-95 transition-all duration-200"
                  variant="outline"
                >
                  View ID Document
                </Button>
              )}
              {user.files.taxationRegistryCardFilename && (
                <Button
                  onClick={() => fetchFile(user.files.taxationRegistryCardFilename)}
                  className="w-full !bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                  hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                  active:transform active:scale-95 transition-all duration-200"
                  variant="outline"
                >
                  View Taxation Registry Card
                </Button>
              )}
              {user.files.certificatesFilenames &&
                user.files.certificatesFilenames.length > 0 &&
                user.files.certificatesFilenames.map((certificate, index) => (
                  <Button
                    key={index}
                    onClick={() => fetchFile(certificate)}
                    className="w-full !bg-white !text-[#2D6F77] border !border-[#2D6F77] 
                    hover:!bg-[#2D6F77] hover:!text-white active:!bg-[#1A3B47] 
                    active:transform active:scale-95 transition-all duration-200"
                    variant="outline"
                  >
                    View Certificate {index + 1}
                  </Button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    ));

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="w-full bg-[#1A3B47] py-6 sm:py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#003f66] mb-4 sm:mb-6">
              User Approval Dashboard
            </h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
                {error}
              </div>
            )}

            {advertisers.length === 0 && sellers.length === 0 && tourGuides.length === 0 ? (
              <div className="flex items-center justify-center h-24 sm:h-32">
                <p className="text-base sm:text-lg text-[#003f66] text-center px-4">
                  No users to Accept/Reject. Please check again later!
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2 auto-rows-auto">
                {renderUserCards(advertisers, "advertiser")}
                {renderUserCards(sellers, "seller")}
                {renderUserCards(tourGuides, "tourGuide")}
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
    </div>
  );
}
