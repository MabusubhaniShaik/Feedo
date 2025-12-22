// app/layout.tsx
import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { connectDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "Feedo App",
  description: "Feedback collection platform",
};

const RootLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await connectDB();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
