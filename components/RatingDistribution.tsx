// app/statistics/components/RatingDistribution.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RatingDistributionProps {
  data: Array<{ rating_range: string; count: number; percentage: number }>;
}

export default function RatingDistribution({ data }: RatingDistributionProps) {
  // Define star ratings in reverse order (5 to 1) — champagne intensity ramp
  const starRatings = [
    { stars: 5, label: "5", color: "bg-gold" },
    { stars: 4, label: "4", color: "bg-gold/75" },
    { stars: 3, label: "3", color: "bg-gold/55" },
    { stars: 2, label: "2", color: "bg-gold/38" },
    { stars: 1, label: "1", color: "bg-gold/22" },
  ];

  // Transform API data to match individual star ratings
  const getStarData = (stars: number) => {
    // Find which range this star belongs to (e.g., "4-5" for 4 stars)
    for (const item of data) {
      const [minStr, maxStr] = item.rating_range.split("-");
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);

      // Check if this star falls within the range
      if (stars >= min && stars < max) {
        // For ranges like "4-5", assign to 4 stars
        // For ranges like "1-2", assign to 1 star
        const targetStar = Math.floor(min);
        if (targetStar === stars) {
          return {
            count: item.count,
            percentage: item.percentage,
          };
        }
      }
    }
    return { count: 0, percentage: 0 };
  };

  const transformedData = starRatings.map((star) => ({
    ...star,
    ...getStarData(star.stars),
  }));

  if (data.length === 0) {
    return (
      <Card className="shadow-luxury">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No rating data
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...transformedData.map((d) => d.count), 1);

  return (
    <Card className="shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base font-semibold">
          Rating Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transformedData.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              {/* Star label */}
              <div className="w-7 text-right text-sm font-medium">
                {item.label}
                <span className="ml-0.5 text-gold">★</span>
              </div>

              {/* Color bar */}
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Count and percentage */}
              <div className="w-20 text-right text-sm">
                <span className="font-medium">{item.count}</span>
                <span className="ml-1 text-muted-foreground">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="font-medium text-muted-foreground">
            Total Ratings
          </span>
          <span className="font-semibold text-gold">
            {transformedData.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
