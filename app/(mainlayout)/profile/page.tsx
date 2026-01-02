// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Key, MailCheck } from "lucide-react";

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
    {}
  );

  // Set mode based on URL parameter
  useEffect(() => {
    if (isEdit) {
      setMode("edit");
    }
  }, [isEdit]);

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

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
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
      <div className="container mx-auto p-4">
        <div className="text-center text-[10px]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="text-[10px]">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-3">
      {/* Top Header with Title and Update Button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <h1 className="text-[14px] font-bold">
            {mode === "edit" ? "Edit User Profile" : "User Profile"}
          </h1>
        </div>

        {mode === "view" ? (
          <Button
            onClick={handleEditClick}
            size="sm"
            className="h-6 px-3 text-[10px] rounded-[3px]"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={saving}
              className="h-6 px-3 text-[10px] rounded-[3px]"
            >
              {saving ? "Updating..." : "Update Profile"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="h-6 px-3 text-[10px] rounded-[3px]"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* User Basic Information Card */}
      <Card className="text-[10px] p-0 gap-0">
        <CardHeader className="p-2 gap-0">
          <CardTitle className="text-[12px] font-bold">
            Basic Information
          </CardTitle>
        </CardHeader>
        {/* <Separator /> */}
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">User ID</Label>
              <div className="p-1 border border-gray-300 rounded bg-gray-50 text-[10px] min-h-[24px] flex items-center">
                {userData?.user_id}
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Name</Label>
              {mode === "view" ? (
                <div className="p-1 border border-gray-300 rounded bg-gray-50 text-[10px] min-h-[24px] flex items-center">
                  {userData?.name}
                </div>
              ) : (
                <Input
                  value={userData?.name || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="h-6 text-[10px] rounded"
                />
              )}
            </div>
            <div>
              <Label className="text-[10px]">Email</Label>
              {mode === "view" ? (
                <div className="p-1 border border-gray-300 rounded bg-gray-50 text-[10px] min-h-[24px] flex items-center">
                  {userData?.email}
                </div>
              ) : (
                <Input
                  value={userData?.email || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="h-6 text-[10px] rounded"
                />
              )}
            </div>
            <div>
              <Label className="text-[10px]">Role</Label>
              <div className="p-1 border border-gray-300 rounded bg-gray-50 text-[10px] min-h-[24px] flex items-center">
                {userData?.role_name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      {mode === "edit" && (
        <Card className="text-[10px] p-0 gap-0">
          <CardHeader className="p-2 gap-0">
            <CardTitle className="text-[12px] font-bold">
              Change Password
            </CardTitle>
          </CardHeader>
          {/* <Separator /> */}
          <CardContent className="p-3 space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Current Password</Label>
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
                className="h-6 text-[10px] rounded"
              />
              {passwordErrors.currentPassword && (
                <p className="text-[8px] text-red-500">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">New Password</Label>
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
                  className="h-6 text-[10px] rounded"
                />
                {passwordErrors.newPassword && (
                  <p className="text-[8px] text-red-500">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Confirm Password</Label>
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
                  className="h-6 text-[10px] rounded"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[8px] text-red-500">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification & Status Card */}
      <Card className="text-[10px] p-0 gap-0">
        <CardHeader className="p-2 gap-0">
          <CardTitle className="text-[12px] font-bold">
            Verification & Status
          </CardTitle>
        </CardHeader>
        {/* <Separator /> */}
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isEmailVerified"
              checked={userData?.isEmailVerified || false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, isEmailVerified: checked })
              }
              disabled={mode === "view"}
              className="h-3 w-3 rounded"
            />
            <Label
              htmlFor="isEmailVerified"
              className="text-[10px] font-normal"
            >
              Email Verified
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_default_password"
              checked={userData?.is_default_password || false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, is_default_password: checked })
              }
              disabled={mode === "view"}
              className="h-3 w-3 rounded"
            />
            <Label
              htmlFor="is_default_password"
              className="text-[10px] font-normal"
            >
              Using Default Password
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={userData?.is_active !== false}
              onCheckedChange={(checked) =>
                setUserData({ ...userData, is_active: checked })
              }
              disabled={mode === "view"}
              className="h-3 w-3 rounded"
            />
            <Label htmlFor="is_active" className="text-[10px] font-normal">
              Account Active
            </Label>
          </div>

          {/* Account Created Info */}
          <div className="pt-2 border-t">
            <div className="text-[9px] text-muted-foreground grid grid-cols-2 gap-1">
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
