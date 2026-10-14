// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-[var(--accent)]">
            <ShieldAlert className="h-9 w-9 text-gold" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
            403 · Restricted
          </p>
          <h1 className="gold-text mb-2 mt-3 text-4xl font-semibold tracking-tight">
            Access Denied
          </h1>
          <div className="gold-rule mb-4 h-px w-32" />
          <p className="text-sm text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
          <Button
            variant="outline"
            asChild
            className="w-full border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
          >
            <Link href="/signin?action=logout">Switch Account</Link>
          </Button>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your system
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
