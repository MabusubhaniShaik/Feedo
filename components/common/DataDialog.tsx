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
    text-sm
    w-full
    max-w-none
    min-w-[72rem]
    border-border
    shadow-luxury
  "
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            {getModeTitle()}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {mode === "view"
              ? "View details"
              : mode === "create"
                ? "Add new record"
                : "Edit existing record"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{children}</div>

        {(mode === "create" || mode === "edit") && onSubmit && (
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 border-gold/40 px-4 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-9 px-5"
            >
              {loading ? "Processing..." : getSubmitButtonLabel()}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
