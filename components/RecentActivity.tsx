// app/statistics/components/RecentActivity.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RecentActivityProps {
  reviews: Array<{
    product_code: string;
    rating: number;
    email: string;
    date: string;
  }>;
}

export default function RecentActivity({ reviews }: RecentActivityProps) {
  if (reviews.length === 0) {
    return (
      <Card className="shadow-luxury">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base font-semibold">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border bg-black/20 p-3 transition-colors hover:border-gold/35"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {review.product_code}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {review.email} • {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-sm font-semibold">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
