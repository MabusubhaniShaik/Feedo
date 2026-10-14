// app/statistics/components/ErrorState.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  details?: string[]; // Add this optional prop
}

export default function ErrorState({
  error,
  onRetry,
  details,
}: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-7xl">
      <Card className="border-destructive/50 shadow-luxury">
        <CardContent className="p-6">
          <p className="mb-2 text-sm font-semibold text-destructive">Error</p>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>

          {/* Show error details if available */}
          {details && details.length > 0 && (
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-destructive/80">
                Details:
              </p>
              <ul className="space-y-1 pl-4 text-xs text-muted-foreground">
                {details.map((detail, index) => (
                  <li key={index} className="list-disc">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onRetry} size="sm" className="font-medium">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
