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
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!data || !selectedProductId) {
    return (
      <div className="text-center py-6">
        <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-[10px]">
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
    <div className="space-y-3">
      <div className="bg-muted p-3 rounded">
        <h3 className="text-[12px] font-bold">{data.product.name}</h3>
        <p className="text-muted-foreground text-[10px]">
          Code: {data.product.product_code}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-[10px]">
            <CardContent className="p-3">
              <p className="font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-[12px] font-bold mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.question_statistics.length > 0 && (
        <Card className="text-[10px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px]">Question Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.question_statistics.map((question: any, index: number) => (
                <div key={question.question_id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {index + 1}. {question.question_text}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{question.average_rating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
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
