// app/signin/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Loader2,
  Info,
  Copy,
  Key,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/helpers/api.service";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface DecodedAccessToken {
  user: {
    _id: string;
    user_id: string;
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    isEmailVerified: boolean;
    is_default_password: boolean;
    is_active: boolean;
    created_by: string;
    updated_by: string;
    created_date: string;
    updated_date: string;
  };
  user_id: string;
  email: string;
  role: string;
  role_id: string;
  iat: number;
  exp: number;
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

const DEMO_CREDENTIALS = {
  userId: "USE25-002",
  password: "Password@123",
  role: "User (Product Owner)",
};

const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
  });

  const isDemoAccount = searchParams.get("isDemoAccount") === "true";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDemoLogin = () => {
    setFormData({
      user_id: DEMO_CREDENTIALS.userId,
      password: DEMO_CREDENTIALS.password,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy"));
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
      const decoded: DecodedAccessToken = jwtDecode(token);

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
      const response = await api.post<TokenResponse>(
        "/auth/token",
        formData,
        {},
        { requiresAuth: false }
      );

      if (response) {
        const tokenData = response as unknown as TokenResponse;
        const userInfo = decodeToken(tokenData.access_token);

        if (userInfo) {
          const issuedAt = Math.floor(Date.now() / 1000);
          const expiresAt = issuedAt + tokenData.expires_in;

          sessionStorage.setItem("access_token", tokenData.access_token);
          sessionStorage.setItem("refresh_token", tokenData.refresh_token);
          sessionStorage.setItem("token_type", tokenData.token_type);
          sessionStorage.setItem("expires_in", tokenData.expires_in.toString());
          sessionStorage.setItem("issued_at", issuedAt.toString());
          sessionStorage.setItem("expires_at", expiresAt.toString());

          sessionStorage.setItem("user_id", userInfo.user_id);
          sessionStorage.setItem("user_name", userInfo.name);
          sessionStorage.setItem("user_email", userInfo.email);
          sessionStorage.setItem("user_role", userInfo.role);
          sessionStorage.setItem("user_role_id", userInfo.role_id);
          sessionStorage.setItem(
            "user_is_default_password",
            userInfo.is_default_password.toString()
          );
          sessionStorage.setItem("user_info", JSON.stringify(userInfo));

          toast.success(`Welcome back, ${userInfo.name}!`);
          router.push("/dashboard");
        } else {
          throw new Error("Failed to decode user information");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-luxury">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-semibold text-foreground">
            Sign In
          </CardTitle>
          <div className="mx-auto h-px w-16 gold-rule" />
          <p className="text-sm text-muted-foreground">
            Use your credentials to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {isDemoAccount && (
            <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-[var(--accent)] p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gold">
                  Demo Credentials
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        aria-label="Demo credentials details"
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="w-80 border-border bg-popover p-4 text-popover-foreground shadow-luxury"
                      side="top"
                      align="start"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-gold" />
                          <span className="text-xs font-medium">
                            Demo Credentials
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 border-t border-border pt-2">
                            <UserIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                Role
                              </Label>
                              <div className="text-xs font-medium">
                                {DEMO_CREDENTIALS.role}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                User ID
                              </Label>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 rounded bg-black/40 px-2 py-1 text-xs text-gold-soft">
                                  {DEMO_CREDENTIALS.userId}
                                </code>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      DEMO_CREDENTIALS.userId,
                                      "User ID"
                                    )
                                  }
                                  className="h-6 w-6"
                                  aria-label="Copy user ID"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                Password
                              </Label>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 rounded bg-black/40 px-2 py-1 text-xs text-gold-soft">
                                  ••••••••••
                                </code>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    copyToClipboard(
                                      DEMO_CREDENTIALS.password,
                                      "Password"
                                    )
                                  }
                                  className="h-6 w-6"
                                  aria-label="Copy password"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                Click copy icon to copy password
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDemoLogin}
                className="h-7 border-gold/40 text-xs text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
              >
                Auto-fill
              </Button>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id" className="text-xs text-muted-foreground">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user_id"
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
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium tracking-wide shadow-luxury"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-xs">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => router.push("/signup")}
              className="h-auto p-0 font-medium text-gold hover:text-gold-soft"
            >
              Sign up
            </Button>
          </div>

          {formData.user_id && (
            <div className="text-center text-xs text-muted-foreground">
              Signing in as:{" "}
              <span className="font-medium text-foreground">
                {formData.user_id}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
