// app/statistics/components/LoadingState.tsx
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="text-[10px]">
            <CardContent className="p-3">
              <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="h-64 w-full bg-muted rounded animate-pulse" />
    </div>
  );
}
