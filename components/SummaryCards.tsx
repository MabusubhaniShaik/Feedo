// app/statistics/components/SummaryCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Package, MessageSquare, Star, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

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
    },
    {
      title: "Total Reviews",
      value: data.summary.total_reviews,
      icon: MessageSquare,
    },
    {
      title: "Average Rating",
      value: data.summary.average_rating.toFixed(1),
      icon: Star,
    },
    {
      title: "Products with Reviews",
      value: data.summary.products_with_reviews,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.08,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Card className="group border-border bg-card shadow-luxury transition-colors duration-300 hover:border-gold/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold leading-none text-foreground">
                    {card.value}
                  </h3>
                </div>
                <div className="shrink-0 rounded-lg border border-gold/25 bg-[var(--accent)] p-2.5 transition-colors duration-300 group-hover:border-gold/60">
                  <card.icon className="h-5 w-5 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
