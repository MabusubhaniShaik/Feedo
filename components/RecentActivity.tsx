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
      <Card className="text-[10px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-[10px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[12px]">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <p className="font-medium">{review.product_code}</p>
                <p className="text-muted-foreground">
                  {review.email} • {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{review.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
