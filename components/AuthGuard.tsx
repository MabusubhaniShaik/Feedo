// components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: React.ReactNode;
  mode: "protected" | "auth";
}

const AuthGuard = ({ children, mode }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);

      try {
        const userInfo = sessionStorage.getItem("user_info");
        const token = sessionStorage.getItem("access_token");

        if (mode === "protected") {
          if (!userInfo || !token) {
            router.push("/signin");
            return;
          }

          // Parse user info
          const userData = JSON.parse(userInfo);
          const userRole = userData.role;

          // Check role-based access for admin routes
          const adminRoutes = ["/manage"];
          const isAdminRoute = adminRoutes.some((route) =>
            pathname.startsWith(route)
          );

          if (isAdminRoute && userRole !== "Admin") {
            router.push("/not-found");
            return;
          }

          setIsAuthorized(true);
        } else if (mode === "auth") {
          if (userInfo && token) {
            router.push("/dashboard");
            return;
          }
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mode === "protected") {
          router.push("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mode, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
