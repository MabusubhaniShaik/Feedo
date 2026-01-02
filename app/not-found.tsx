// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This page is restricted to Admin users only.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/signin?action=logout">Switch Account</Link>
          </Button>
        </div>

        <div className="pt-6 border-t">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact your system
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
