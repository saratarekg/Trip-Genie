import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast, ToastClose, ToastDescription, ToastTitle, ToastProvider, ToastViewport } from "@/components/ui/toast";
import Cookies from "js-cookie";
import { CheckCircle, XCircle } from "lucide-react";  // Ensure these icons are available

const getPasswordStrength = (password) => {
  const strength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const fulfilled = Object.values(strength).filter(Boolean).length;
  return { ...strength, fulfilled };
};

export default function PasswordChanger({ onSuccess }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [toastMessage, setToastMessage] = useState('');

  const strength = getPasswordStrength(newPassword);

  const showToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setIsToastOpen(true);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setConfirmPasswordError(false); // Reset error on input change
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(false); // Reset error on input change
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(true);
      return;
    }

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
        onSuccess('Your password has been successfully updated. Please use your new password for future logins.'); // Call the onSuccess prop with a message
        // Reset form fields
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      showToast(
        'error',
        error.response?.data?.message || 'An error occurred. Please try again.'
      );
    }
  };

  const getProgressBarColor = () => {
    if (strength.fulfilled === 2) return "bg-[#F88C33]";
    if (strength.fulfilled === 3) return "bg-[#5D9297]";
    return "bg-red-500";
  };

  const getStrengthLabel = () => {
    if (strength.fulfilled === 2) return "Could Be Stronger";
    if (strength.fulfilled === 3) return "Strong Password";
    return "Too Weak";
  };

  return (
    <ToastProvider>
      <div>
        <h1 className="text-3xl font-bold mb-2">Change Password</h1>
        <div className="container mx-auto px-4">
          <form onSubmit={handlePasswordChange} className="space-y-4 w-full max-w-lg mx-auto">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
              />

              {/* Password Strength Bar and Label */}
              <div className="flex items-center mt-2 space-x-2 w-full">
  {/* Progress Bar */}
  <div className="relative flex-grow h-2 bg-gray-200 rounded-full">
    <div
      className={`absolute h-2 rounded-full transition-all duration-300 ${newPassword.length === 0 ? 'bg-gray-300' : getProgressBarColor()}`}
      style={{
        width: `${newPassword.length === 0 ? 0 : Math.max((strength.fulfilled / 3), 1 / 3) * 100}%`
      }}
    ></div>
  </div>

  {/* Strength Label */}
  {newPassword.length > 0 && (
    <p className="text-sm font-medium text-gray-700 ml-2">
      {getStrengthLabel()}
    </p>
  )}
</div>

            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
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
              <p className="text-red-500 text-sm">
                The confirmation password does not match the new password.
              </p>
            )}

            <ul className="text-sm mt-4 space-y-1">
              <li
                className={`flex items-center ${strength.length ? "text-[#388A94]" : "text-gray-500"}`}
              >
                <span
                  className={`mr-2 w-4 h-4 flex items-center justify-center rounded-full border ${
                    strength.length ? "bg-[#388A94] text-white" : "border-gray-500"
                  }`}
                >
                  ✓
                </span>
                At least 8 characters
              </li>
              <li
                className={`flex items-center ${strength.uppercase ? "text-[#388A94]" : "text-gray-500"}`}
              >
                <span
                  className={`mr-2 w-4 h-4 flex items-center justify-center rounded-full border ${
                    strength.uppercase ? "bg-[#388A94] text-white" : "border-gray-500"
                  }`}
                >
                  ✓
                </span>
                At least one uppercase letter
              </li>
              <li
                className={`flex items-center ${strength.number ? "text-[#388A94]" : "text-gray-500"}`}
              >
                <span
                  className={`mr-2 w-4 h-4 flex items-center justify-center rounded-full border ${
                    strength.number ? "bg-[#388A94] text-white" : "border-gray-500"
                  }`}
                >
                  ✓
                </span>
                At least one number
              </li>
            </ul>

            <Button
              type="submit"
              className="w-full bg-[#1A3B47] text-white"
              disabled={strength.fulfilled < 3}
            >
              Change Password
            </Button>
          </form>
        </div>
        <ToastViewport className="fixed top-0 right-0 p-4" />
        {isToastOpen && (
          <Toast
            onOpenChange={setIsToastOpen}
            open={isToastOpen}
            duration={5000}
            className={toastType === 'success' ? 'bg-green-100' : 'bg-red-100'}
          >
            <div className="flex items-center">
              {toastType === 'success' ? (
                <CheckCircle className="text-green-500 mr-2" />
              ) : (
                <XCircle className="text-red-500 mr-2" />
              )}
              <div>
                <ToastTitle>{toastType === 'success' ? 'Success' : 'Error'}</ToastTitle>
                <ToastDescription>
                  {toastMessage}
                </ToastDescription>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )}
      </div>
    </ToastProvider>
  );
}
