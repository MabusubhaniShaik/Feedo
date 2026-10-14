"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiService } from "@/helpers/api.service";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  User,
  Calendar,
  CheckCircle,
  MessageSquare,
  Download,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewQuestion {
  response_question_id: string;
  response_question_text: string;
  response_rating: number;
  response_question_comment?: string;
  image_urls: string[];
}

interface Review {
  _id: string;
  product_id: string;
  product_code: string;
  mobile_number: string;
  email: string;
  review_info: ReviewQuestion[];
  average_rating: number;
  is_status: boolean;
  created_by: string;
  updated_by: string;
  created_date: string;
  updated_date: string;
}

interface ApiResponse {
  status: string;
  status_code: number;
  message: string;
  data: Review[];
  pagination: {
    current_page: number;
    page_count: number;
    total_record_count: number;
    limit: number;
  };
}

interface ReviewFilters {
  page: number;
  limit: number;
  sortBy: "newest" | "highest" | "lowest";
}

const DEFAULT_FILTERS: ReviewFilters = {
  page: 1,
  limit: 10,
  sortBy: "newest",
};

const ReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_count: 1,
    total_record_count: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_FILTERS);

  const getProductOwnerId = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    const userInfo = sessionStorage.getItem("user_info");
    if (!userInfo) return null;
    try {
      const parsed = JSON.parse(userInfo);
      return parsed?.id || null;
    } catch {
      return null;
    }
  }, []);

  const sortMapping = useMemo(
    () => ({
      newest: "-created_date",
      highest: "-average_rating",
      lowest: "average_rating",
    }),
    []
  );

  const fetchReviews = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const productOwnerId = getProductOwnerId();
        if (!productOwnerId) {
          throw new Error("Product owner not found");
        }

        const params = {
          page: filters.page,
          limit: filters.limit,
          product_owner_id: productOwnerId,
          sort: sortMapping[filters.sortBy],
        };

        const response: any = await apiService.get<ApiResponse>(
          "/product-review",
          params
        );

        if (response.status === "SUCCESS") {
          setReviews(response.data);
          setPagination(
            response.pagination ?? {
              current_page: filters.page,
              page_count: 1,
              total_record_count: response.data.length,
              limit: filters.limit,
            }
          );
        } else {
          throw new Error(response.message || "Failed to fetch reviews");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, getProductOwnerId, sortMapping]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    fetchReviews(true);
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value as ReviewFilters["sortBy"],
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    const csvContent = convertToCSV(reviews);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `reviews_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (reviewsData: Review[]): string => {
    const headers = [
      "Product Code",
      "Email",
      "Date",
      "Average Rating",
      "Questions",
      "Comments",
    ];
    const rows = reviewsData.map((review) => [
      review.product_code,
      review.email,
      formatDate(review.created_date),
      review.average_rating.toFixed(1),
      review.review_info.length,
      review.review_info.filter((q) => q.response_question_comment).length,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-gold text-gold"
                : "fill-white/10 text-white/10"
            }`}
          />
        ))}
      </div>
    );
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  }, []);

  const overallStats = useMemo(() => {
    if (reviews.length === 0) return null;

    return {
      averageRating: Number(
        (
          reviews.reduce((acc, review) => acc + review.average_rating, 0) /
          reviews.length
        ).toFixed(1)
      ),
      totalQuestions: reviews.reduce(
        (acc, review) => acc + review.review_info.length,
        0
      ),
    };
  }, [reviews]);

  const paginationItems = useMemo(() => {
    if (pagination.page_count <= 1) return null;

    const items = [];
    const maxVisible = 5;

    if (pagination.page_count <= maxVisible) {
      for (let i = 1; i <= pagination.page_count; i++) {
        items.push(i);
      }
    } else {
      let start = Math.max(1, pagination.current_page - 2);
      let end = Math.min(pagination.page_count, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        items.push(i);
      }
    }

    return items;
  }, [pagination.page_count, pagination.current_page]);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={handleRefresh} size="sm" className="mt-2">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
              Feedback
            </p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
              Product Reviews
            </h1>
            <div className="mt-3 h-px w-24 gold-rule" />
            <p className="mt-3 text-sm text-muted-foreground">
              Customer feedback and ratings
            </p>
          </div>

          {overallStats && !loading && (
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-border bg-black/20 px-5 py-3 text-center">
                <div className="text-2xl font-semibold text-gold">
                  {overallStats.averageRating.toFixed(1)}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Overall
                </div>
              </div>
              <div className="rounded-xl border border-border bg-black/20 px-5 py-3 text-center">
                <div className="text-2xl font-semibold">
                  {reviews.length}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Reviews
                </div>
              </div>
              <div className="rounded-xl border border-border bg-black/20 px-5 py-3 text-center">
                <div className="text-2xl font-semibold">
                  {overallStats.totalQuestions}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Responses
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={handleSortChange}
              disabled={loading || refreshing}
            >
              <SelectTrigger className="h-9 w-[150px] border-gold/40 text-sm focus:border-gold">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="highest">Highest</SelectItem>
                <SelectItem value="lowest">Lowest</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              size="sm"
              className="h-9 gap-1.5 border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              size="sm"
              className="h-9 gap-1.5 border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
              disabled={loading || refreshing || reviews.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          {!loading && !refreshing && (
            <span className="text-xs text-muted-foreground">
              {pagination.total_record_count} record
              {pagination.total_record_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading && !refreshing ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <Skeleton className="mb-3 h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <MessageSquare className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to review this product
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-4 border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {reviews.map((review, index) => (
              <AccordionItem
                key={review._id}
                value={`review-${index}`}
                className="overflow-hidden rounded-xl border border-border bg-black/20 px-4 transition-colors hover:border-gold/30"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.average_rating)}
                          <span className="ml-1 font-semibold">
                            {review.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-normal px-2 py-0"
                        >
                          {review.product_code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{review.email}</span>
                        <Calendar className="ml-2 h-3.5 w-3.5" />
                        <span>{formatDate(review.created_date)}</span>
                      </div>
                    </div>
                    {review.is_status && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gold/40 px-2 py-0 text-gold"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 border-t border-border pt-4">
                    {review.review_info.map((question, qIndex) => (
                      <div
                        key={question.response_question_id}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium">
                            {question.response_question_text}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {renderStars(question.response_rating)}
                            <span className="text-sm font-semibold text-gold">
                              {question.response_rating}/5
                            </span>
                          </div>
                        </div>
                        {question.response_question_comment && (
                          <p className="rounded-lg border-l-2 border-gold/50 bg-[var(--accent)] p-3 text-sm italic text-muted-foreground">
                            &ldquo;{question.response_question_comment}&rdquo;
                          </p>
                        )}
                        {qIndex < review.review_info.length - 1 && (
                          <hr className="border-border" />
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {pagination.page_count > 1 && !loading && reviews.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(Math.max(1, pagination.current_page - 1))
                  }
                  className={`${
                    pagination.current_page === 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>

              {paginationItems?.map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pagination.current_page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(
                      Math.min(
                        pagination.page_count,
                        pagination.current_page + 1
                      )
                    )
                  }
                  className={`${
                    pagination.current_page === pagination.page_count
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
