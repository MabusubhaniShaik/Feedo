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

        const response = await apiService.get<ApiResponse>(
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
            className={`w-3 h-3 ${
              i < rating
                ? "fill-yellow-500 text-yellow-500"
                : "fill-gray-200 text-gray-200"
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
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive" className="text-[10px]">
          <AlertDescription className="text-[10px]">{error}</AlertDescription>
          <Button
            onClick={handleRefresh}
            size="sm"
            className="mt-2 text-[10px]"
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[12px] font-bold tracking-tight">
              Product Reviews
            </h1>
            <p className="text-muted-foreground mt-1 text-[10px]">
              Customer feedback and ratings
            </p>
          </div>

          {overallStats && !loading && (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-[12px] font-bold">
                  {overallStats.averageRating.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground">Overall</div>
              </div>
              <div className="text-center">
                <div className="text-[12px] font-bold">{reviews.length}</div>
                <div className="text-[10px] text-muted-foreground">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-[12px] font-bold">
                  {overallStats.totalQuestions}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Responses
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={handleSortChange}
              disabled={loading || refreshing}
            >
              <SelectTrigger className="w-[120px] h-6 text-[10px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="text-[10px]">
                <SelectItem value="newest" className="text-[10px]">
                  Newest
                </SelectItem>
                <SelectItem value="highest" className="text-[10px]">
                  Highest
                </SelectItem>
                <SelectItem value="lowest" className="text-[10px]">
                  Lowest
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              size="sm"
              className="h-6 px-2 text-[10px] gap-1 rounded-[3px]"
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={`w-[5px] h-[5px] ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              size="sm"
              className="h-6 px-2 text-[10px] gap-1 rounded-[3px]"
              disabled={loading || refreshing || reviews.length === 0}
            >
              <Download className="w-[5px] h-[5px]" />
              Export
            </Button>
          </div>

          {!loading && !refreshing && (
            <span className="text-[10px] text-muted-foreground">
              {pagination.total_record_count} record
              {pagination.total_record_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {loading && !refreshing ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-md p-3">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="border rounded-md p-8 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Be the first to review this product
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-3 text-[10px]"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {reviews.map((review, index) => (
              <AccordionItem
                key={review._id}
                value={`review-${index}`}
                className="border rounded-md px-3"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2 text-[10px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.average_rating)}
                          <span className="font-medium ml-1">
                            {review.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-normal px-1.5 py-0"
                        >
                          {review.product_code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-2.5 h-2.5" />
                        <span>{review.email}</span>
                        <Calendar className="w-2.5 h-2.5 ml-2" />
                        <span>{formatDate(review.created_date)}</span>
                      </div>
                    </div>
                    {review.is_status && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 px-1.5 py-0"
                      >
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-3 border-t space-y-4">
                    {review.review_info.map((question, qIndex) => (
                      <div
                        key={question.response_question_id}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-[10px]">
                            {question.response_question_text}
                          </h3>
                          <div className="flex items-center gap-1">
                            {renderStars(question.response_rating)}
                            <span className="text-[10px] font-medium">
                              {question.response_rating}/5
                            </span>
                          </div>
                        </div>
                        {question.response_question_comment && (
                          <p className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
                            {question.response_question_comment}
                          </p>
                        )}
                        {qIndex < review.review_info.length - 1 && (
                          <hr className="my-2" />
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
                  className={`text-[10px] ${
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
                    className="text-[10px]"
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
                  className={`text-[10px] ${
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
