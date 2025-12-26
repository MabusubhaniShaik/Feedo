// components/common/DataDialog.tsx
"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DataDialogProps<T> {
  open: boolean;
  onClose: () => void;
  mode: "view" | "create" | "edit";
  title: string;
  data?: T;
  children?: React.ReactNode;
  onSubmit?: (formData?: any) => void;
  submitLabel?: string;
  loading?: boolean;
  getFormData?: () => any; // Add this prop
}

export function DataDialog<T>({
  open,
  onClose,
  mode,
  title,
  data,
  children,
  onSubmit,
  submitLabel,
  loading = false,
  getFormData,
}: DataDialogProps<T>) {
  const getModeTitle = () => {
    switch (mode) {
      case "view":
        return `View ${title}`;
      case "create":
        return `Create New ${title}`;
      case "edit":
        return `Edit ${title}`;
      default:
        return title;
    }
  };

  const getSubmitButtonLabel = () => {
    if (submitLabel) return submitLabel;
    switch (mode) {
      case "create":
        return "Create";
      case "edit":
        return "Update";
      default:
        return "Save";
    }
  };

  const handleSubmit = () => {
    // Get form data if getFormData function is provided
    const formData = getFormData?.();
    onSubmit?.(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
    max-h-[90vh]
    overflow-y-auto
    text-[0.875rem]
    w-full
    max-w-none
    min-w-[72rem]
  "
      >
        <DialogHeader>
          <DialogTitle className="text-[1rem]">{getModeTitle()}</DialogTitle>
          <DialogDescription className="text-[0.75rem]">
            {mode === "view"
              ? "View details"
              : mode === "create"
              ? "Add new record"
              : "Edit existing record"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{children}</div>

        {(mode === "create" || mode === "edit") && onSubmit && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-[0.75rem] h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="text-[0.75rem] h-8"
            >
              {loading ? "Processing..." : getSubmitButtonLabel()}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
