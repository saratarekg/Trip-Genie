import React from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ApprovalConfirmation({
  isOpen,
  onClose,
  itemType = "item", // Default value if not specified
  onConfirm,
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-16 p-2 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-semibold text-left">
                Approve Registered account ?
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-left">
                Are you sure you want to approve this registered account? Once approved, the action cannot be undone.
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
            <Button
              variant="primary"
              className="w-full sm:w-1/2 bg-[#388A94] hover:bg-[#2e6b77] text-white"
              onClick={handleConfirm}
            >
              Approve {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
