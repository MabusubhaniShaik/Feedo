// app/statistics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/helpers/api.service";
import SummaryCards from "@/components/SummaryCards";
import StatisticsTabs from "@/components/StatisticsTabs";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Button } from "@/components/ui/button";

interface OwnerStatsData {
  summary: {
    total_products: number;
    total_reviews: number;
    average_rating: number;
    products_with_reviews: number;
  };
  recent_reviews: Array<{
    product_code: string;
    rating: number;
    email: string;
    date: string;
  }>;
  top_products: Array<{
    product_id: string;
    product_code: string;
    review_count: number;
    average_rating: number;
  }>;
}

interface ProductStatsData {
  product: {
    name: string;
    product_code: string;
    total_reviews: number;
    average_rating: number;
    total_questions: number;
  };
  review_statistics: {
    total_reviews: number;
    average_rating: number;
    min_rating: number;
    max_rating: number;
    total_questions_answered: number;
  };
  question_statistics: Array<{
    question_id: string;
    question_text: string;
    average_rating: number;
    total_responses: number;
    total_comments: number;
  }>;
  monthly_trend: Array<{
    month: string;
    review_count: number;
    average_rating: number;
  }>;
}

interface ReviewAnalyticsData {
  overview: {
    total_reviews: number;
    average_rating: number;
    total_questions_answered: number;
    total_comments: number;
  };
  daily_trend: Array<{
    date: string;
    review_count: number;
    average_rating: number;
  }>;
  rating_distribution: Array<{
    rating_range: string;
    count: number;
    percentage: number;
  }>;
}

export default function DashboardPage() {
  const [ownerStats, setOwnerStats] = useState<OwnerStatsData | null>(null);
  const [productStats, setProductStats] = useState<ProductStatsData | null>(
    null
  );
  const [reviewAnalytics, setReviewAnalytics] =
    useState<ReviewAnalyticsData | null>(null);
  const [loading, setLoading] = useState({
    ownerStats: true,
    productStats: true,
    reviewAnalytics: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const getUserIdFromSession = (): string | null => {
    if (typeof window === "undefined") return null;
    const userInfo = sessionStorage.getItem("user_info");
    if (!userInfo) return null;
    try {
      const parsed = JSON.parse(userInfo);
      return parsed?.id || null;
    } catch {
      return null;
    }
  };

  const fetchAllStatistics = async () => {
    try {
      setError(null);
      const productOwnerId = getUserIdFromSession();
      if (!productOwnerId) throw new Error("User not found");

      setLoading({
        ownerStats: true,
        productStats: true,
        reviewAnalytics: true,
      });

      const [ownerStatsRes, reviewAnalyticsRes] = await Promise.all([
        apiService.get<{ data: OwnerStatsData }>("/statistics/owner-stats", {
          product_owner_id: productOwnerId,
        }),
        apiService.get<{ data: ReviewAnalyticsData }>(
          "/statistics/review-analytics",
          {
            product_owner_id: productOwnerId,
          }
        ),
      ]);

      setOwnerStats(ownerStatsRes.data);
      setReviewAnalytics(reviewAnalyticsRes.data);

      if (ownerStatsRes.data.top_products.length > 0) {
        const firstProductId = ownerStatsRes.data.top_products[0].product_id;
        setSelectedProductId(firstProductId);
        await fetchProductStats(firstProductId);
      }

      setLoading({
        ownerStats: false,
        productStats: false,
        reviewAnalytics: false,
      });
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError(err.message || "Failed to load statistics");
      setLoading({
        ownerStats: false,
        productStats: false,
        reviewAnalytics: false,
      });
    }
  };

  const fetchProductStats = async (productId: string) => {
    try {
      const response = await apiService.get<{ data: ProductStatsData }>(
        "/statistics/product-stats",
        { product_id: productId }
      );
      setProductStats(response.data);
    } catch (err) {
      console.error("Error fetching product stats:", err);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setLoading((prev) => ({ ...prev, productStats: true }));
    fetchProductStats(productId).finally(() => {
      setLoading((prev) => ({ ...prev, productStats: false }));
    });
  };

  const handleExport = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Products", ownerStats?.summary.total_products || 0],
      ["Total Reviews", ownerStats?.summary.total_reviews || 0],
      ["Average Rating", ownerStats?.summary.average_rating.toFixed(1) || 0],
      ["Products with Reviews", ownerStats?.summary.products_with_reviews || 0],
      [],
      ["Date", "Reviews", "Average Rating"],
      ...(reviewAnalytics?.daily_trend.map((day) => [
        day.date,
        day.review_count,
        day.average_rating.toFixed(1),
      ]) || []),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `statistics_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading =
    loading.ownerStats || loading.productStats || loading.reviewAnalytics;

  if (isLoading && !ownerStats && !reviewAnalytics) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchAllStatistics} />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[12px] font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-[10px]">
            Comprehensive overview of your products and reviews
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={fetchAllStatistics}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] rounded-[3px]"
          >
            Refresh All
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            className="h-6 px-2 text-[10px] rounded-[3px]"
            disabled
          >
            Export CSV
          </Button>
        </div>
      </div>

      <SummaryCards data={ownerStats} />

      <StatisticsTabs
        ownerStats={ownerStats}
        productStats={productStats}
        reviewAnalytics={reviewAnalytics}
        selectedProductId={selectedProductId}
        onProductSelect={handleProductSelect}
        loading={loading}
      />
    </div>
  );
}
