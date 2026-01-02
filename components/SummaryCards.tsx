// app/statistics/components/SummaryCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Package, MessageSquare, Star, CheckCircle } from "lucide-react";

interface SummaryCardsProps {
  data: {
    summary: {
      total_products: number;
      total_reviews: number;
      average_rating: number;
      products_with_reviews: number;
    };
  } | null;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  if (!data) return null;

  const cards = [
    {
      title: "Total Products",
      value: data.summary.total_products,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Total Reviews",
      value: data.summary.total_reviews,
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "Average Rating",
      value: data.summary.average_rating.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Products with Reviews",
      value: data.summary.products_with_reviews,
      icon: CheckCircle,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {cards.map((card) => (
        <Card key={card.title} className="text-[10px]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-muted-foreground">
                  {card.title}
                </p>
                <h3 className="text-[12px] font-bold mt-1">{card.value}</h3>
              </div>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
