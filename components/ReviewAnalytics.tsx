// app/statistics/components/ReviewAnalytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RatingDistribution from "@/components/RatingDistribution";

interface ReviewAnalyticsProps {
  data: any;
}

export default function ReviewAnalytics({ data }: ReviewAnalyticsProps) {
  if (!data) {
    return (
      <p className="text-muted-foreground text-center py-6 text-[10px]">
        Loading analytics...
      </p>
    );
  }

  const overviewStats = [
    { label: "Total Reviews", value: data.overview.total_reviews },
    { label: "Average Rating", value: data.overview.average_rating.toFixed(1) },
    {
      label: "Questions Answered",
      value: data.overview.total_questions_answered,
    },
    { label: "Total Comments", value: data.overview.total_comments },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="text-[10px]">
            <CardContent className="p-3">
              <p className="font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-[12px] font-bold mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="text-[10px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px]">
            Daily Trend (Last 30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.daily_trend.length === 0 ? (
            <p className="text-muted-foreground text-center py-2">
              No trend data
            </p>
          ) : (
            <div className="space-y-2">
              {data.daily_trend.map((day: any) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{day.date}</span>
                  <div className="flex items-center gap-3">
                    <span>{day.review_count} reviews</span>
                    <span>{day.average_rating.toFixed(1)} ★</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RatingDistribution data={data.rating_distribution} />
    </div>
  );
}
