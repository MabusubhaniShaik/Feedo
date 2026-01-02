"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type AuthGuardProps = {
  children: React.ReactNode;
  mode: "auth" | "protected";
};

export default function AuthGuard({ children, mode }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    // Protected pages (dashboard, etc.)
    if (mode === "protected") {
      if (!token) {
        router.replace("/signin");
      }
    }

    // Auth pages (signin, signup)
    if (mode === "auth") {
      if (token) {
        router.replace("/dashboard");
      }
    }
  }, [mode, pathname, router]);

  return <>{children}</>;
}
