"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { toast } from "sonner";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface DecodedToken {
  user: {
    _id: string;
    user_id: string;
    name: string;
    email: string;
    role_name: string;
    role_id: string;
    isEmailVerified: boolean;
    is_default_password: boolean;
    is_active: boolean;
    created_date: string;
  };
  user_id: string;
  email: string;
  role: string;
  role_id: string;
  iat: number;
  exp: number;
}

const SignInPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
  });

  const decodeToken = (token: string): DecodedToken | null => {
    try {
      // JWT token has 3 parts: header.payload.signature
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const storeAuthData = (tokenResponse: TokenResponse) => {
    const decoded = decodeToken(tokenResponse.access_token);

    if (!decoded) {
      throw new Error("Failed to decode token");
    }

    // Store tokens in sessionStorage
    sessionStorage.setItem("access_token", tokenResponse.access_token);
    sessionStorage.setItem("refresh_token", tokenResponse.refresh_token);
    sessionStorage.setItem("token_type", tokenResponse.token_type);
    sessionStorage.setItem("expires_in", tokenResponse.expires_in.toString());

    // Store decoded user info
    const userInfo = {
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
      token_expiry: decoded.exp,
      token_issued: decoded.iat,
    };

    sessionStorage.setItem("user_info", JSON.stringify(userInfo));

    return userInfo;
  };

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response: TokenResponse = await apiService.post<TokenResponse>(
        "/auth/token",
        formData
      );

      // Store auth data in sessionStorage
      const userInfo = storeAuthData(response);

      toast.success(`Welcome back, ${userInfo.name}!`);

      // Redirect to manage page as specified
      router.push("/manage");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
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

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/password-reset")}
              disabled={isLoading}
              className="text-sm text-black hover:underline disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-black/90 disabled:bg-gray-700"
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

        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute left-1/2 top-1/2 px-3 text-sm text-gray-500 bg-white -translate-x-1/2 -translate-y-1/2">
            Or continue with
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          <GoogleIcon className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="text-center text-sm text-gray-600 pt-2">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            disabled={isLoading}
            className="font-medium text-black hover:underline disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path
        fill="#4285F4"
        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
      />
      <path
        fill="#34A853"
        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
      />
      <path
        fill="#FBBC05"
        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
      />
      <path
        fill="#EA4335"
        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
      />
    </g>
  </svg>
);

export default SignInPage;
