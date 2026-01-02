// app/manage/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiService } from "@/helpers/api.service";
import { DataTable } from "@/components/common/DataTable";
import { DataDialog } from "@/components/common/DataDialog";
import { UserForm, UserFormRef } from "@/components/forms/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, UserPlus, Edit, Trash2, Eye } from "lucide-react";

interface User {
  _id: string;
  user_id: string;
  name: string;
  email: string;
  role_name: string;
  role_id: string;
  image_url?: string;
  isEmailVerified: boolean;
  is_default_password: boolean;
  is_active: boolean;
  created_date: string;
  password?: string;
}

const ManagePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "create" | "edit">(
    "view"
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const userFormRef = useRef<UserFormRef>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response: any = await apiService.get("/user");
      const data = response.data || response;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiService.delete(`/user/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    try {
      const formData = userFormRef.current?.getFormData();

      if (!formData) {
        throw new Error("No form data available");
      }

      if (dialogMode === "create") {
        await apiService.post("/user", {
          ...formData,
          created_by: "SYSTEM",
          updated_by: "SYSTEM",
        });
      } else if (dialogMode === "edit" && selectedUser) {
        await apiService.put(`/user/${selectedUser._id}`, {
          ...formData,
          updated_by: "SYSTEM",
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user");
    } finally {
      setFormLoading(false);
    }
  };

  const getFormData = () => {
    return userFormRef.current?.getFormData();
  };

  const columns = [
    {
      key: "user_id" as keyof User,
      header: "User ID",
      className: "text-[0.75rem]",
    },
    {
      key: "name" as keyof User,
      header: "Name",
      className: "text-[0.75rem]",
    },
    {
      key: "email" as keyof User,
      header: "Email",
      className: "text-[0.75rem]",
    },
    {
      key: "role_name" as keyof User,
      header: "Role",
      className: "text-[0.75rem]",
      cell: (user: User) => (
        <Badge
          variant={user.role_name === "Admin" ? "default" : "secondary"}
          className="text-[0.625rem]"
        >
          {user.role_name}
        </Badge>
      ),
    },
    {
      key: "is_active" as keyof User,
      header: "Status",
      className: "text-[0.75rem]",
      cell: (user: User) => (
        <Badge
          variant={user.is_active ? "default" : "destructive"}
          className="text-[0.625rem]"
        >
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_date" as keyof User,
      header: "Created Date",
      className: "text-[0.75rem]",
      cell: (user: User) => (
        <span className="text-[0.75rem]">
          {new Date(user.created_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "_id" as keyof User,
      header: "Actions",
      className: "text-[0.75rem] text-right",
      cell: (user: User) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-[0.75rem] h-6 px-2 rounded-[3px]"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user._id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-0">
      <Card className="text-[0.875rem]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[1rem]">User Management</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                size="sm"
                className="text-[0.75rem] h-6 px-2 rounded-[3px]"
              >
                <UserPlus className="h-2 w-2 mr-1" />
                Add User
              </Button>
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
                className="text-[0.75rem] h-6 px-2 rounded-[3px]"
              >
                <RefreshCw className="h-2 w-2 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            emptyMessage="No users found"
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      <DataDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        title="User"
        data={selectedUser || undefined}
        onSubmit={handleFormSubmit}
        submitLabel={dialogMode === "create" ? "Create" : "Update"}
        loading={formLoading}
        getFormData={getFormData}
      >
        <UserForm
          ref={userFormRef}
          mode={dialogMode}
          initialData={selectedUser || undefined}
          loading={formLoading}
        />
      </DataDialog>
    </div>
  );
};

export default ManagePage;
