// app/statistics/components/RatingDistribution.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RatingDistributionProps {
  data: Array<{ rating_range: string; count: number; percentage: number }>;
}

export default function RatingDistribution({ data }: RatingDistributionProps) {
  console.log(":::::: data", data);

  // Define star ratings in reverse order (5 to 1) with colors
  const starRatings = [
    { stars: 5, label: "5", color: "bg-green-500" },
    { stars: 4, label: "4", color: "bg-lime-500" },
    { stars: 3, label: "3", color: "bg-yellow-500" },
    { stars: 2, label: "2", color: "bg-orange-500" },
    { stars: 1, label: "1", color: "bg-red-500" },
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
      <Card className="text-[10px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px]">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No rating data
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...transformedData.map((d) => d.count), 1);

  return (
    <Card className="text-[10px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[12px]">Rating Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transformedData.map((item) => (
            <div key={item.stars} className="flex items-center gap-2">
              {/* Star label */}
              <div className="w-6 text-right font-medium">{item.label} ★</div>

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
              <div className="w-16 text-right">
                <span className="font-medium">{item.count}</span>
                <span className="text-muted-foreground ml-1">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="font-medium">Total Ratings</span>
          <span className="font-medium">
            {transformedData.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
