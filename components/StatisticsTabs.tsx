// app/statistics/components/StatisticsTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package, PieChart, TrendingUp } from "lucide-react";
import RatingDistribution from "@/components/RatingDistribution";
import RecentActivity from "@/components/RecentActivity";
import TopProducts from "@/components/TopProducts";
import ProductAnalytics from "@/components/ProductAnalytics";
import ReviewAnalytics from "@/components/ReviewAnalytics";

interface StatisticsTabsProps {
  ownerStats: any;
  productStats: any;
  reviewAnalytics: any;
  selectedProductId: string | null;
  onProductSelect: (productId: string) => void;
  loading: {
    productStats: boolean;
  };
}

export default function StatisticsTabs({
  ownerStats,
  productStats,
  reviewAnalytics,
  selectedProductId,
  onProductSelect,
  loading,
}: StatisticsTabsProps) {
  console.log(":::::: reviewAnalytics", reviewAnalytics);

  // Extract the data from the array if it exists
  const reviewAnalyticsData = Array.isArray(reviewAnalytics)
    ? reviewAnalytics[0]
    : reviewAnalytics;

  // Same for ownerStats
  const ownerStatsData = Array.isArray(ownerStats) ? ownerStats[0] : ownerStats;

  // Same for productStats
  const productStatsData = Array.isArray(productStats)
    ? productStats[0]
    : productStats;

  return (
    <Tabs defaultValue="overview" className="space-y-3">
      <TabsList className="h-8">
        <TabsTrigger value="overview" className="text-[10px] h-6 px-2">
          <BarChart3 className="mr-1 h-3 w-3" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="products" className="text-[10px] h-6 px-2">
          <Package className="mr-1 h-3 w-3" />
          Top Products
        </TabsTrigger>
        <TabsTrigger value="product-analytics" className="text-[10px] h-6 px-2">
          <PieChart className="mr-1 h-3 w-3" />
          Product Analytics
        </TabsTrigger>
        <TabsTrigger value="review-analytics" className="text-[10px] h-6 px-2">
          <TrendingUp className="mr-1 h-3 w-3" />
          Review Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <RatingDistribution
            data={reviewAnalyticsData?.rating_distribution || []}
          />
          <RecentActivity reviews={ownerStatsData?.recent_reviews || []} />
        </div>
      </TabsContent>

      <TabsContent value="products">
        <TopProducts
          products={ownerStatsData?.top_products || []}
          onSelectProduct={onProductSelect}
          selectedProductId={selectedProductId}
        />
      </TabsContent>

      <TabsContent value="product-analytics">
        <ProductAnalytics
          data={productStatsData}
          loading={loading.productStats}
          selectedProductId={selectedProductId}
        />
      </TabsContent>

      <TabsContent value="review-analytics">
        <ReviewAnalytics data={reviewAnalyticsData} />
      </TabsContent>
    </Tabs>
  );
}
