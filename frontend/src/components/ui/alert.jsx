import React from "react";
import { XCircle } from "lucide-react";

export const Alert = ({ message, onClose }) => {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert"
    >
      <strong className="font-bold mr-1">Error!</strong>
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        aria-label="Close alert"
      >
        <XCircle className="h-6 w-6 text-red-500" />
      </button>
    </div>
  );
};
