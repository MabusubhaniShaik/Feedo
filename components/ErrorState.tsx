// app/statistics/components/ErrorState.tsx
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="container mx-auto p-4">
      <Card className="text-[10px] border-destructive">
        <CardContent className="p-4">
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-muted-foreground mb-2">{error}</p>

          {/* Show error details if available */}
          {details && details.length > 0 && (
            <div className="mb-3">
              <p className="text-destructive/80 font-medium mb-1">Details:</p>
              <ul className="text-muted-foreground text-[9px] space-y-1 pl-4">
                {details.map((detail, index) => (
                  <li key={index} className="list-disc">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onRetry}
            className="h-6 px-3 bg-primary text-primary-foreground rounded text-[10px] hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
