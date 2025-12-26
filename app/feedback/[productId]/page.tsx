// app/feedback/[productId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Star, CheckCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/helpers/api.service";

interface Question {
  _id: string;
  question: string;
  max_rating: number;
  comment: string;
  is_active: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  product_code: string;
  questions: Question[];
}

interface Response {
  rating: number;
  comment: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [responses, setResponses] = useState<Record<string, Response>>({});

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response: any = await apiService.get(`/products/${productId}`);

      if (response.status === "SUCCESS" && response.data?.[0]) {
        const productData = response.data[0];
        setProduct(productData);

        const initialResponses: Record<string, Response> = {};
        productData.questions?.forEach((q: Question) => {
          if (q.is_active) initialResponses[q._id] = { rating: 0, comment: "" };
        });
        setResponses(initialResponses);
      } else {
        setError(response.error || "Product not found");
      }
    } catch (error: any) {
      setError(error.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating },
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment },
    }));
  };

  const handleSubmit = async () => {
    if (!product || !mobile.trim()) {
      setError("Mobile number is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        responses: Object.entries(responses).map(([questionId, response]) => ({
          question_id: questionId,
          question:
            product.questions.find((q) => q._id === questionId)?.question || "",
          rating: response.rating,
          comment: response.comment,
          name: name.trim(),
          mobile_number: mobile.trim(),
          submitted_date: new Date().toISOString(),
        })),
      };

      const response: any = await apiService.patch(
        `/product/${productId}`,
        payload
      );

      if (response.status === "SUCCESS") {
        setSubmitted(true);
      } else {
        setError(response.error || "Failed to submit feedback");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (questionId: string, maxRating: number) => {
    const currentRating = responses[questionId]?.rating || 0;

    return (
      <div className="flex gap-1">
        {[...Array(maxRating)].map((_, i) => {
          const star = i + 1;
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(questionId, star)}
              className="focus:outline-none hover:scale-110 transition-transform disabled:opacity-50"
              disabled={submitting || submitted}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= currentRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  const allQuestionsRated = () => {
    if (!product) return false;
    const activeQuestions = product.questions.filter((q) => q.is_active);
    return activeQuestions.every((q) => responses[q._id]?.rating > 0);
  };

  const activeQuestions = product?.questions.filter((q) => q.is_active) || [];
  const ratedCount = Object.values(responses).filter(
    (r) => r.rating > 0
  ).length;
  const progressPercentage = activeQuestions.length
    ? (ratedCount / activeQuestions.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[0.75rem] text-gray-600">
            Loading feedback form...
          </p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-[0.875rem] font-semibold mb-2">
              Error Loading Product
            </h2>
            <p className="text-[0.75rem] text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => (window.location.href = "/")}
              size="sm"
              className="text-[0.75rem]"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-6 text-center">
            <h2 className="text-[0.875rem] font-semibold mb-2">
              Product Not Found
            </h2>
            <Button
              onClick={() => (window.location.href = "/")}
              size="sm"
              className="text-[0.75rem] mt-4"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-6 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-[1rem] font-bold mb-3">Thank You!</h2>
            <p className="text-[0.75rem] text-gray-600 mb-6">
              Your feedback has been submitted successfully.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              size="sm"
              className="text-[0.75rem] w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-[1rem] font-bold text-gray-800 mb-2">
            Product Feedback
          </h1>
          <p className="text-[0.75rem] text-gray-600">
            Share your experience to help us improve
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[0.875rem]">{product.name}</CardTitle>
            <p className="text-[0.625rem] text-gray-500">
              Product Code: {product.product_code}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-[0.75rem] text-gray-600">
              {product.description}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[0.875rem]">Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[0.75rem]">Name (Optional)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-[0.75rem] h-8"
                disabled={submitting}
              />
            </div>
            <div>
              <Label className="text-[0.75rem]">Mobile Number *</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                className="text-[0.75rem] h-8"
                required
                disabled={submitting}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[0.875rem]">Your Feedback</CardTitle>
            <p className="text-[0.625rem] text-gray-500">
              Please rate each question and share your thoughts
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[0.75rem] text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {activeQuestions.map((question, index) => (
                <div key={question._id} className="space-y-4">
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full h-6 w-6 flex items-center justify-center text-[0.625rem] font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[0.75rem] font-semibold mb-2">
                          {question.question}
                        </h3>
                        {question.comment && (
                          <p className="text-[0.625rem] text-gray-500 mb-3 p-2 bg-gray-50 rounded">
                            {question.comment}
                          </p>
                        )}

                        <div className="mb-4">
                          <Label className="text-[0.75rem] block mb-2">
                            How would you rate this?
                          </Label>
                          {renderStars(question._id, question.max_rating)}
                          <div className="text-[0.625rem] text-gray-500 mt-1">
                            Current: {responses[question._id]?.rating || 0} of{" "}
                            {question.max_rating}
                          </div>
                        </div>

                        <div>
                          <Label className="text-[0.75rem]">
                            Your Thoughts (Optional)
                          </Label>
                          <Textarea
                            value={responses[question._id]?.comment || ""}
                            onChange={(e) =>
                              handleCommentChange(question._id, e.target.value)
                            }
                            placeholder="Share your feedback..."
                            className="text-[0.75rem] min-h-[80px]"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t">
                <div className="mb-6">
                  <div className="flex justify-between mb-2 text-[0.75rem]">
                    <span>Progress</span>
                    <span className="font-bold">
                      {ratedCount} of {activeQuestions.length} rated
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting || !allQuestionsRated() || !mobile.trim()
                  }
                  className="w-full py-4 text-[0.75rem]"
                  size="sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>

                {!allQuestionsRated() && (
                  <p className="text-center text-[0.625rem] text-amber-600 mt-2">
                    Please rate all questions before submitting
                  </p>
                )}
                {!mobile.trim() && (
                  <p className="text-center text-[0.625rem] text-amber-600 mt-2">
                    Mobile number is required
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
