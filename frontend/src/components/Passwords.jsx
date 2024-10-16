import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Lock, Bell, Shield, Plane } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Cookies from "js-cookie";

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export default function PasswordChanger() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [changeStatus, setChangeStatus] = useState({ type: "", message: "" });

  const handleNewPasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    if (!validatePassword(newPass)) {
      setNewPasswordError(
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number."
      );
    } else if (confirmPassword !== newPass) {
      setNewPasswordError("");
      setConfirmPasswordError("New passwords do not match.");
    } else {
      setNewPasswordError("");
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    if (newPassword !== confirmPass) {
      setConfirmPasswordError("New passwords do not match.");
    } else if (!validatePassword(newPassword)) {
      setConfirmPasswordError(
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number."
      );
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangeStatus({ type: "", message: "" });
    const token = Cookies.get("jwt");
    const role = Cookies.get("role") || "guest";

    try {
      const response = await axios.post(
        `http://localhost:4000/${role}/password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setChangeStatus({
          type: "success",
          message:
            "Your password has been successfully updated. Please use your new password for future logins.",
        });
        // Reset form fields
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setChangeStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        errors: error.response?.data?.errors || [],
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Change my password</h2>
      {changeStatus.type && (
        <Alert
          className={`mb-4 ${
            changeStatus.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          <AlertTitle className="font-semibold">
            {changeStatus.type === "success" ? "Success" : "Failed"}
          </AlertTitle>
          <AlertDescription>{changeStatus.message}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="current-password"
            className="text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <Input
            id="current-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          {changeStatus.message === "Incorrect old password" && (
            <p className="text-red-500 text-sm mt-1">Incorrect old password</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
        </div>
        {newPasswordError && (
          <p className="text-red-500 text-sm">{newPasswordError}</p>
        )}
        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>
        {confirmPasswordError && (
          <p className="text-red-500 text-sm">{confirmPasswordError}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Change Password
        </Button>
      </form>
    </div>
  );
}
