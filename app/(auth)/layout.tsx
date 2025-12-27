// app/(auth)/layout.tsx
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex bg-black text-white flex-col justify-center px-12">
        <h1 className="text-4xl font-bold mb-4">Feedo</h1>
        <p className="text-lg text-gray-300 max-w-md">
          Collect feedback effortlessly, analyze insights instantly, and improve
          your product experience with confidence.
        </p>
      </div>

      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
