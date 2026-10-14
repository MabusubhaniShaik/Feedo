// app/statistics/components/ReviewAnalytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RatingDistribution from "@/components/RatingDistribution";

interface ReviewAnalyticsProps {
  data: any;
}

export default function ReviewAnalytics({ data }: ReviewAnalyticsProps) {
  if (!data) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
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

  const maxDaily = Math.max(
    ...(data.daily_trend as Array<{ review_count: number }>).map(
      (d) => d.review_count
    ),
    1
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="shadow-luxury">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-luxury">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Daily Trend (Last 30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.daily_trend.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">
              No trend data
            </p>
          ) : (
            <div className="space-y-2">
              {data.daily_trend.map((day: any) => (
                <div
                  key={day.date}
                  className="flex items-center gap-3 rounded-md px-1 py-1.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="w-28 shrink-0 text-sm font-medium">
                    {day.date}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gold/70"
                      style={{
                        width: `${(day.review_count / maxDaily) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {day.review_count} reviews
                  </span>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold text-gold">
                    {day.average_rating.toFixed(1)} ★
                  </span>
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
