// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const ProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  // Set mode based on URL parameter
  useEffect(() => {
    if (isEdit) {
      setMode("edit");
    }
  }, [isEdit]);

  const getCurrentUserInfo = () => {
    if (typeof window === "undefined") return null;
    try {
      const userInfoStr = sessionStorage.getItem("user_info");
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (e) {
      console.error("Error reading user info from session storage:", e);
      return null;
    }
  };

  const currentUserInfo = getCurrentUserInfo();
  const isDemoUser = userData?.user_id === "USE25-002";

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userInfoStr = sessionStorage.getItem("user_info");

      if (!userInfoStr) {
        throw new Error("User not logged in");
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.id || userInfo._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiService.get<any>("/user", { id: userId });
      const data = response.data ? response.data[0] || response.data : response;
      setUserData(data);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    // Only validate if password fields are filled
    if (
      passwordData.newPassword ||
      passwordData.confirmPassword ||
      passwordData.currentPassword
    ) {
      if (!passwordData.currentPassword) {
        errors.currentPassword = "Current password is required";
      }

      if (!passwordData.newPassword) {
        errors.newPassword = "New password is required";
      } else if (passwordData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;

    try {
      setSaving(true);

      // Prepare payload
      const payload: any = {
        name: userData?.name,
        email: userData?.email,
        updated_by: "USER_SELF",
      };

      // Add password data if provided
      if (passwordData.newPassword && passwordData.currentPassword) {
        payload.currentPassword = passwordData.currentPassword;
        payload.newPassword = passwordData.newPassword;
      }

      // Add checkbox data
      payload.isEmailVerified = userData?.isEmailVerified || false;
      payload.is_default_password = userData?.is_default_password || false;
      payload.is_active = userData?.is_active !== false;

      // Send update request
      await apiService.put(`/user/${userData._id}`, payload);

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Switch back to view mode
      setMode("view");
      router.push("/profile");

      // Refresh user data
      fetchUserData();

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    router.push("/profile?edit=true");
  };

  const handleCancel = () => {
    setMode("view");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    router.push("/profile");
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert variant="destructive" className="border-destructive/50 shadow-luxury">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {mode === "edit" ? "Edit Profile" : "User Profile"}
          </h1>
          <div className="gold-rule mt-3 h-px w-24" />
          <p className="mt-3 text-sm text-muted-foreground">
            Your personal information and account status.
            {userData?.user_id === "USE25-002" && (
              <span className="ml-2 rounded-md border border-gold/40 bg-[var(--accent)] px-2 py-0.5 text-[11px] uppercase tracking-[0.15em] text-gold">
                Demo Account
              </span>
            )}
          </p>
        </div>

        {mode === "view" ? (
          <Button
            onClick={handleEditClick}
            size="sm"
            className="h-9 gap-1.5 px-4"
            disabled={isDemoUser}
            title={isDemoUser ? "Demo account cannot be edited" : ""}
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={saving || isDemoUser}
              className="h-9 gap-1.5 px-4"
              title={isDemoUser ? "Demo account cannot be edited" : ""}
            >
              {saving ? "Updating..." : "Update Profile"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="h-9 border-gold/40 px-4 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* User Basic Information Card */}
      <Card className="shadow-luxury">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                User ID
              </Label>
              <div className="mt-1.5 flex min-h-9 items-center rounded-lg border border-border bg-black/20 px-3 text-sm">
                {userData?.user_id}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Name
              </Label>
              {mode === "view" ? (
                <div className="mt-1.5 flex min-h-9 items-center rounded-lg border border-border bg-black/20 px-3 text-sm">
                  {userData?.name}
                </div>
              ) : (
                <Input
                  value={userData?.name || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="mt-1.5 h-9"
                />
              )}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Email
              </Label>
              {mode === "view" ? (
                <div className="mt-1.5 flex min-h-9 items-center rounded-lg border border-border bg-black/20 px-3 text-sm">
                  {userData?.email}
                </div>
              ) : (
                <Input
                  value={userData?.email || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="mt-1.5 h-9"
                />
              )}
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Role
              </Label>
              <div className="mt-1.5 flex min-h-9 items-center rounded-lg border border-border bg-black/20 px-3 text-sm">
                {userData?.role_name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      {mode === "edit" && (
        <Card className="shadow-luxury">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="font-display text-base font-semibold">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Current Password
              </Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  });
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors({
                      ...passwordErrors,
                      currentPassword: "",
                    });
                  }
                }}
                placeholder="Enter current password"
                className="h-9"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  New Password
                </Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    });
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({ ...passwordErrors, newPassword: "" });
                    }
                  }}
                  placeholder="Enter new password"
                  className="h-9"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    });
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({
                        ...passwordErrors,
                        confirmPassword: "",
                      });
                    }
                  }}
                  placeholder="Confirm new password"
                  className="h-9"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification & Status Card */}
      <Card className="shadow-luxury">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Verification &amp; Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isEmailVerified"
              checked={userData?.isEmailVerified || false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, isEmailVerified: checked })
              }
              disabled={mode === "view"}
              className="h-4 w-4 rounded"
            />
            <Label
              htmlFor="isEmailVerified"
              className="text-sm font-normal"
            >
              Email Verified
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="is_default_password"
              checked={userData?.is_default_password || false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, is_default_password: checked })
              }
              disabled={mode === "view"}
              className="h-4 w-4 rounded"
            />
            <Label
              htmlFor="is_default_password"
              className="text-sm font-normal"
            >
              Using Default Password
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="is_active"
              checked={userData?.is_active !== false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, is_active: checked })
              }
              disabled={mode === "view"}
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="is_active" className="text-sm font-normal">
              Account Active
            </Label>
          </div>

          {/* Account Created Info */}
          <div className="mt-2 border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div>
                <span>Created:</span>
                <span className="ml-1">
                  {new Date(userData?.created_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>Last Updated:</span>
                <span className="ml-1">
                  {new Date(userData?.updated_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
