import React from "react";
import { Trash2 } from 'lucide-react';
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmation({ 
  isOpen, 
  onClose, 
  itemType = "item", // Default value if not specified
  redirectPath,
  onConfirm 
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        {/* <div className="border-t-4 border-red-500"></div>  */}
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-16 p-2 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-semibold text-left">
                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-left">
                Are you sure you want to delete your {itemType}? If you delete your {itemType},
               you can not undo this action.
              </DialogDescription>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="w-full sm:w-1/2 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </Button>
            {redirectPath ? (
              <Link to={redirectPath} className="w-full sm:w-1/2">
                <Button
                  variant="destructive"
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={handleConfirm}
                >
                  Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </Button>
              </Link>
            ) : (
              <Button
                variant="destructive"
                className="w-full sm:w-1/2 bg-red-500 hover:bg-red-600"
                onClick={handleConfirm}
              >
                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}