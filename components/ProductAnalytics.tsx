// app/statistics/components/ProductAnalytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Star } from "lucide-react";

interface ProductAnalyticsProps {
  data: any;
  loading: boolean;
  selectedProductId: string | null;
}

export default function ProductAnalytics({
  data,
  loading,
  selectedProductId,
}: ProductAnalyticsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!data || !selectedProductId) {
    return (
      <div className="py-6 text-center">
        <Package className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Select a product to view analytics
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total Reviews", value: data.review_statistics.total_reviews },
    {
      label: "Average Rating",
      value: data.review_statistics.average_rating.toFixed(1),
    },
    {
      label: "Min Rating",
      value: data.review_statistics.min_rating.toFixed(1),
    },
    {
      label: "Max Rating",
      value: data.review_statistics.max_rating.toFixed(1),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/30 bg-[var(--accent)] p-4">
        <h3 className="text-xl font-semibold text-foreground">
          {data.product.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
          Code: {data.product.product_code}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
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

      {data.question_statistics.length > 0 && (
        <Card className="shadow-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold">
              Question Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.question_statistics.map((question: any, index: number) => (
                <div key={question.question_id} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">
                      {index + 1}. {question.question_text}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5 text-sm">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span className="font-semibold">
                        {question.average_rating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Responses: {question.total_responses}</span>
                    <span>Comments: {question.total_comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
