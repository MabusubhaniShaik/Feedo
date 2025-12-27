// app/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const pathname = window.location.pathname;

    if (!token && !["/", "/signin"].includes(pathname)) {
      router.replace("/signin");
    } else if (token && pathname === "/signin") {
      router.replace("/dashboard");
    }
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
