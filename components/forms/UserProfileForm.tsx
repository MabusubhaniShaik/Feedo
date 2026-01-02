// components/form/UserProfileForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfileFormProps {
  mode: "view" | "edit" | "create";
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const UserProfileForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: UserProfileFormProps) => {
  const [formData, setFormData] = useState(() => {
    if (mode === "create") {
      return {
        user_id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role_id: "",
        role_name: "",
        isEmailVerified: false,
        is_default_password: true,
        is_active: true,
      };
    }
    return initialData || {};
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (mode === "edit" && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (value: string) => {
    const roleName =
      value === "1" ? "Admin" : value === "2" ? "User" : "Public";
    setFormData((prev: any) => ({
      ...prev,
      role_id: value,
      role_name: roleName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission (remove confirmPassword)
      const submitData = { ...formData };
      delete submitData.confirmPassword;

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  return (
    <Card className="text-[10px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[12px] font-bold">
          {isViewMode
            ? "View Profile"
            : isEditMode
            ? "Edit Profile"
            : "Create User"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* User ID */}
          <div className="space-y-1">
            <Label htmlFor="user_id" className="text-[10px]">
              User ID
            </Label>
            {isViewMode ? (
              <div className="p-1.5 border border-gray-300 rounded-[3px] bg-gray-50 text-[10px] min-h-[28px] flex items-center">
                {formData.user_id}
              </div>
            ) : (
              <Input
                id="user_id"
                name="user_id"
                value={formData.user_id || ""}
                onChange={handleChange}
                required
                disabled={isEditMode}
                className="h-7 text-[10px] rounded-[3px]"
              />
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-[10px]">
              Name
            </Label>
            {isViewMode ? (
              <div className="p-1.5 border border-gray-300 rounded-[3px] bg-gray-50 text-[10px] min-h-[28px] flex items-center">
                {formData.name}
              </div>
            ) : (
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="h-7 text-[10px] rounded-[3px]"
              />
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[10px]">
              Email
            </Label>
            {isViewMode ? (
              <div className="p-1.5 border border-gray-300 rounded-[3px] bg-gray-50 text-[10px] min-h-[28px] flex items-center">
                {formData.email}
              </div>
            ) : (
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
                className="h-7 text-[10px] rounded-[3px]"
              />
            )}
          </div>

          {/* Password (for create mode and edit mode) */}
          {(isCreateMode || isEditMode) && (
            <>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-[10px]">
                  {isCreateMode ? "Password" : "New Password (optional)"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  required={isCreateMode}
                  className="h-7 text-[10px] rounded-[3px]"
                  placeholder={
                    isCreateMode ? "" : "Leave blank to keep current"
                  }
                />
                {errors.password && (
                  <p className="text-[8px] text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password (only for create mode) */}
              {isCreateMode && (
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[10px]">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword || ""}
                    onChange={handleChange}
                    required={isCreateMode}
                    className="h-7 text-[10px] rounded-[3px]"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[8px] text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Role */}
          <div className="space-y-1">
            <Label htmlFor="role_id" className="text-[10px]">
              Role
            </Label>
            {isViewMode ? (
              <div className="p-1.5 border border-gray-300 rounded-[3px] bg-gray-50 text-[10px] min-h-[28px] flex items-center">
                {formData.role_name}
              </div>
            ) : (
              <Select
                value={formData.role_id || ""}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger className="h-7 text-[10px] rounded-[3px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="text-[10px]">
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">User</SelectItem>
                  <SelectItem value="3">Public</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-2">
            {/* Email Verified */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEmailVerified"
                checked={formData.isEmailVerified || false}
                onCheckedChange={(checked) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    isEmailVerified: checked,
                  }))
                }
                disabled={isViewMode}
                className="h-3 w-3 rounded-[2px]"
              />
              <Label
                htmlFor="isEmailVerified"
                className="text-[10px] font-normal"
              >
                Email Verified
              </Label>
            </div>

            {/* Default Password */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default_password"
                checked={formData.is_default_password || false}
                onCheckedChange={(checked) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    is_default_password: checked,
                  }))
                }
                disabled={isViewMode}
                className="h-3 w-3 rounded-[2px]"
              />
              <Label
                htmlFor="is_default_password"
                className="text-[10px] font-normal"
              >
                Default Password
              </Label>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    is_active: checked,
                  }))
                }
                disabled={isViewMode}
                className="h-3 w-3 rounded-[2px]"
              />
              <Label htmlFor="is_active" className="text-[10px] font-normal">
                Active
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {isViewMode ? (
              <>
                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="h-6 px-2 text-[10px] rounded-[3px]"
                  >
                    Back
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-6 px-2 text-[10px] rounded-[3px]"
                >
                  {loading
                    ? "Saving..."
                    : isCreateMode
                    ? "Create User"
                    : "Save Changes"}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="h-6 px-2 text-[10px] rounded-[3px]"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
