// components/forms/UserForm.tsx
"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";

interface UserFormProps {
  mode: "view" | "create" | "edit";
  initialData?: any;
  loading?: boolean;
}

export interface UserFormRef {
  getFormData: () => any;
  validate: () => boolean;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ mode, initialData, loading = false }: any, ref) => {
    const [formData, setFormData] = useState({
      user_id: "",
      name: "",
      email: "",
      password: "",
      role_id: "user",
      role_name: "User",
      image_url: "",
      isEmailVerified: false,
      is_default_password: false,
      is_active: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Expose form data and validation methods to parent
    useImperativeHandle(ref, () => ({
      getFormData: () => {
        // Clean up data before submitting
        const submitData: any = { ...formData };

        // Don't send password if it's empty (in edit mode)
        if (mode === "edit" && !submitData.password) {
          delete submitData.password;
        }

        // Map role_id to role_name if needed
        if (submitData.role_id === "admin") {
          submitData.role_name = "Admin";
        } else if (submitData.role_id === "user") {
          submitData.role_name = "User";
        }

        return submitData;
      },
      validate: () => {
        const errors = [];
        if (!formData.user_id.trim()) errors.push("User ID is required");
        if (!formData.name.trim()) errors.push("Name is required");
        if (!formData.email.trim()) errors.push("Email is required");
        if (mode === "create" && !formData.password.trim())
          errors.push("Password is required");

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          errors.push("Invalid email format");
        }

        // Password strength validation for create mode
        if (mode === "create" && formData.password && passwordStrength < 3) {
          errors.push("Password is too weak");
        }

        return errors.length === 0;
      },
    }));

    useEffect(() => {
      if (initialData) {
        setFormData({
          user_id: initialData.user_id || "",
          name: initialData.name || "",
          email: initialData.email || "",
          password: "", // Don't pre-fill password for security
          role_id: initialData.role_id || "user",
          role_name: initialData.role_name || "User",
          image_url: initialData.image_url || "",
          isEmailVerified: initialData.isEmailVerified || false,
          is_default_password: initialData.is_default_password || false,
          is_active: initialData.is_active ?? true,
        });
      }
    }, [initialData]);

    useEffect(() => {
      if (formData.password) {
        const strength = calculatePasswordStrength(formData.password);
        setPasswordStrength(strength);
      } else {
        setPasswordStrength(0);
      }
    }, [formData.password]);

    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    };

    const isViewMode = mode === "view";
    const isDisabled = isViewMode || loading;

    const getPasswordStrengthColor = () => {
      if (passwordStrength === 0) return "bg-gray-200";
      if (passwordStrength === 1) return "bg-red-500";
      if (passwordStrength === 2) return "bg-yellow-500";
      if (passwordStrength === 3) return "bg-blue-500";
      return "bg-green-500";
    };

    return (
      <div className="space-y-6 text-[0.875rem]">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <h3 className="text-[0.875rem] font-medium">Basic Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="user_id"
                className="text-[0.75rem] flex items-center gap-1"
              >
                <User className="h-3 w-3" />
                User ID
              </Label>
              {isViewMode ? (
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  {formData.user_id || "-"}
                </div>
              ) : (
                <Input
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="text-[0.75rem] h-8"
                  placeholder="Enter user ID"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[0.75rem]">
                Full Name
              </Label>
              {isViewMode ? (
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  {formData.name || "-"}
                </div>
              ) : (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="text-[0.75rem] h-8"
                  placeholder="Enter full name"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[0.75rem] flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Email Address
            </Label>
            {isViewMode ? (
              <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                {formData.email || "-"}
              </div>
            ) : (
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isDisabled}
                className="text-[0.75rem] h-8"
                placeholder="Enter email address"
              />
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <h3 className="text-[0.875rem] font-medium">Security</h3>
          </div>

          {(mode === "create" || (mode === "edit" && !isViewMode)) && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[0.75rem]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className="text-[0.75rem] h-8 pr-10"
                  placeholder={
                    mode === "edit"
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[0.7rem]">
                    <span>Password Strength:</span>
                    <span
                      className={`
                      ${passwordStrength === 0 ? "text-gray-500" : ""}
                      ${passwordStrength === 1 ? "text-red-500" : ""}
                      ${passwordStrength === 2 ? "text-yellow-500" : ""}
                      ${passwordStrength === 3 ? "text-blue-500" : ""}
                      ${passwordStrength === 4 ? "text-green-500" : ""}
                    `}
                    >
                      {passwordStrength === 0 && "None"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Good"}
                      {passwordStrength === 4 && "Strong"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength * 25}%` }}
                    />
                  </div>
                  <p className="text-[0.7rem] text-gray-500">
                    Use at least 8 characters with uppercase, lowercase,
                    numbers, and symbols
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="role_id"
                className="text-[0.75rem] flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Role
              </Label>
              {isViewMode ? (
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  <Badge
                    variant={
                      formData.role_name === "Admin" ? "default" : "secondary"
                    }
                    className="text-[0.625rem]"
                  >
                    {formData.role_name}
                  </Badge>
                </div>
              ) : (
                <Select
                  value={formData.role_id}
                  onValueChange={(value) =>
                    handleSelectChange("role_id", value)
                  }
                  disabled={isDisabled}
                >
                  <SelectTrigger className="text-[0.75rem] h-8">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-[0.75rem]">
                      Admin
                    </SelectItem>
                    <SelectItem value="user" className="text-[0.75rem]">
                      User
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-[0.75rem]">
                Status
              </Label>
              {isViewMode ? (
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  <Badge
                    variant={formData.is_active ? "default" : "destructive"}
                    className="text-[0.625rem]"
                  >
                    {formData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_active", checked)
                    }
                    disabled={isDisabled}
                  />
                  <span className="text-[0.75rem]">
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <h3 className="text-[0.875rem] font-medium">Account Settings</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[0.75rem]">Email Verification</Label>
              {isViewMode ? (
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  <Badge
                    variant={formData.isEmailVerified ? "default" : "secondary"}
                    className="text-[0.625rem]"
                  >
                    {formData.isEmailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isEmailVerified}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isEmailVerified", checked)
                    }
                    disabled={isDisabled}
                  />
                  <span className="text-[0.75rem]">
                    {formData.isEmailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              )}
            </div>

            {isViewMode && (
              <div className="space-y-2">
                <Label className="text-[0.75rem]">Password Status</Label>
                <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                  <Badge
                    variant={
                      formData.is_default_password ? "secondary" : "default"
                    }
                    className="text-[0.625rem]"
                  >
                    {formData.is_default_password
                      ? "Default Password"
                      : "Custom Password"}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-[0.75rem]">
              Profile Image URL
            </Label>
            {isViewMode ? (
              <div className="text-[0.75rem] p-2 border rounded-md bg-gray-50 min-h-[2rem]">
                {formData.image_url || "No image URL provided"}
              </div>
            ) : (
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                disabled={isDisabled}
                className="text-[0.75rem] h-8"
                placeholder="Enter image URL (optional)"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

UserForm.displayName = "UserForm";
