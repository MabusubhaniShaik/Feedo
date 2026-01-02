// app/signin/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/helpers/api.service";
import { toast } from "sonner";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  role_id: string;
  isEmailVerified: boolean;
  is_default_password: boolean;
  is_active: boolean;
  created_date: string;
}

const SignInPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.user_id.trim()) {
      toast.error("User ID is required");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const decodeToken = (token: string): UserInfo | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return {
        id: decoded.user._id,
        user_id: decoded.user.user_id,
        name: decoded.user.name,
        email: decoded.user.email,
        role: decoded.user.role_name,
        role_id: decoded.user.role_id,
        isEmailVerified: decoded.user.isEmailVerified,
        is_default_password: decoded.user.is_default_password,
        is_active: decoded.user.is_active,
        created_date: decoded.user.created_date,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Note: No auth headers for /auth/token endpoint
      const response = await api.post<TokenResponse>("/auth/token", formData, {}, {
        requiresAuth: false // Important: Don't send auth headers for login
      });

      if (response.status === "SUCCESS" && response.data[0]) {
        const tokenData = response.data[0];
        
        // Decode token to get user info
        const userInfo = decodeToken(tokenData.access_token);
        
        if (userInfo) {
          // Store in session storage
          sessionStorage.setItem("access_token", tokenData.access_token);
          sessionStorage.setItem("refresh_token", tokenData.refresh_token);
          sessionStorage.setItem("token_type", tokenData.token_type);
          sessionStorage.setItem("expires_in", tokenData.expires_in.toString());
          sessionStorage.setItem("user_info", JSON.stringify(userInfo));
          
          toast.success(`Welcome back, ${userInfo.name}!`);
          router.push("/dashboard");
        } else {
          throw new Error("Failed to decode user information");
        }
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = `Signing in as: ${formData.user_id || "..."}`;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold text-black">
          Sign in
        </CardTitle>
        <p className="text-sm text-gray-500">
          Use your credentials to continue
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="text-center text-sm text-gray-600 mb-4">
          {displayData}
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">User ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
              <Input
                name="user_id"
                placeholder="Enter your user id"
                value={formData.user_id}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 h-4 w-4 text-gray-400 hover:text-black -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-black/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-medium text-black hover:underline"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInPage;