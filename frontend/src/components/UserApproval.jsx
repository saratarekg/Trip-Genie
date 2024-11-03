'use client'

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
      const response = await axios.get("http://localhost:4000/admin/unaccepted-advertiser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdvertisers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch advertisers", err);
      setError("Failed to fetch advertisers");
    }
  };

  const fetchSellers = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get("http://localhost:4000/admin/unaccepted-seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch sellers", err);
      setError("Failed to fetch sellers");
    }
  };

  const fetchTourGuides = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.get("http://localhost:4000/admin/unaccepted-tourguide", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleConfirm = (action, userId, role) => {
    setConfirmAction(() => async () => {
      if (action === 'approve') {
        await approveUser(userId, role);
      } else {
        await rejectUser(userId, role);
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
      role === "advertiser" ? fetchAdvertisers() : role === "seller" ? fetchSellers() : fetchTourGuides();
    } catch (err) {
      setError(`Failed to approve ${role}`);
      console.error(err);
    }
  };

  const rejectUser = async (userId, role) => {
    try {
      const token = Cookies.get("jwt");
      await axios.delete(`http://localhost:4000/admin/${role}s/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showDialog(`Successfully rejected the ${role}.`);
      // Re-fetch the user type list after rejection
      role === "advertiser" ? fetchAdvertisers() : role === "seller" ? fetchSellers() : fetchTourGuides();
    } catch (err) {
      setError(`Failed to reject ${role}`);
      console.error(err);
    }
  };

  const renderUserCards = (users, role) => (
    users.map((user) => (
      <Card key={user._id} className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            {user.name} <span className="text-muted-foreground">({role})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => handleConfirm('reject', user._id, role)} variant="destructive">
              Reject
            </Button>
            <Button onClick={() => handleConfirm('approve', user._id, role)} variant="default">
              Accept
            </Button>
            <div className="grid gap-4 mt-2">
              {user.documents && user.documents.length > 0 ? (
                user.documents.map((doc, index) => (
                  <Button
                    key={index}
                    onClick={() => fetchFile(doc)}
                    className="bg-gray-300 hover:bg-gray-500 text-black"
                  >
                    View Document {index + 1}
                  </Button>
                ))
              ) : (
                <p className="text-gray-500">No documents available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 mt-10">Approval Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {advertisers.length === 0 && sellers.length === 0 && tourGuides.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg font-semibold text-gray-700 bg-gray-300 p-4 rounded shadow-md">
            No users to Accept/Reject. Please check again later!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {renderUserCards(advertisers, "advertiser")}
          {renderUserCards(sellers, "seller")}
          {renderUserCards(tourGuides, "tourguide")}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Success!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-4">
            <Button onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confirm Action</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to proceed with this action?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-4">
            <Button onClick={() => {
              confirmAction();
              setConfirmDialogOpen(false);
            }} variant="default">
              Yes
            </Button>
            <Button onClick={() => setConfirmDialogOpen(false)} variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}