"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Question {
  _id: string;
  question_text: string;
  max_rating: number;
  info: string;
  is_active: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string[];
  price: number;
  product_owner_name: string;
  product_code: string;
  questions: Question[];
}

interface UserInfo {
  name: string;
  mobile: string;
  email: string;
}

interface FeedbackPayload {
  product_id: string;
  product_code: string;
  user_name?: string;
  mobile_number: string;
  email?: string;
  review_info: {
    response_question_id: string;
    response_question_text: string;
    response_question_comment?: string;
    response_rating: number;
    image_urls?: string[];
  }[];
  average_rating?: number;
}

const ProductFeedback = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = params?.productId as string;
  const isFeedbackSubmitted = searchParams.get("isFeedBackSubmited") === "true";

  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    mobile: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  // Dynamic configuration
  const config = {
    sections: [
      {
        id: "product",
        title: "Product Information",
        description: "Details about the product you're reviewing",
      },
      {
        id: "user",
        title: "Your Information",
        description: "Please provide your contact details",
      },
      {
        id: "feedback",
        title: "Feedback Questions",
        description: "Rate your experience with the product",
      },
    ],
    userFields: [
      { id: "name", label: "Name", placeholder: "Your name", required: false },
      {
        id: "mobile",
        label: "Mobile Number",
        placeholder: "10-digit mobile number",
        required: true,
      },
      {
        id: "email",
        label: "Email",
        placeholder: "your.email@example.com",
        required: false,
        type: "email",
      },
    ],
  };

  useEffect(() => {
    if (isFeedbackSubmitted) {
      const timer = setTimeout(() => {
        router.replace(`/feedback/${productId}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isFeedbackSubmitted, productId, router]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await apiService.get<{
          status: string;
          data: Product[];
        }>(`/product/${productId}`);
        if (response.data?.[0]) {
          const productData = response.data[0];
          setProduct(productData);

          const initialStates = productData.questions.reduce(
            (acc, q) => {
              acc.ratings[q._id] = 0;
              acc.comments[q._id] = "";
              return acc;
            },
            {
              ratings: {} as Record<string, number>,
              comments: {} as Record<string, string>,
            }
          );

          setRatings(initialStates.ratings);
          setComments(initialStates.comments);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleRatingChange = (questionId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleInputChange = (
    type: "comment" | "user",
    id: string,
    value: string
  ) => {
    if (type === "comment") {
      setComments((prev) => ({ ...prev, [id]: value }));
    } else {
      setUserInfo((prev) => ({ ...prev, [id]: value }));
      if (errors[id as keyof UserInfo]) {
        setErrors((prev) => ({ ...prev, [id]: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Partial<UserInfo> = {};

    if (!userInfo.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(userInfo.mobile.trim())) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    // REMOVED email validation to fix network error
    if (userInfo.email && userInfo.email.trim() !== "") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!product) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Filter out questions with 0 rating and prepare review info
      const reviewInfoArray = product.questions
        .map((question) => ({
          response_question_id: question._id,
          response_question_text: question.question_text,
          response_question_comment: comments[question._id] || undefined,
          response_rating: ratings[question._id] || 0,
          image_urls: [],
        }))
        .filter((item) => item.response_rating > 0);

      // Check if there are any valid ratings
      if (reviewInfoArray.length === 0) {
        alert("Please provide at least one rating (minimum 1 star)");
        setSubmitting(false);
        return;
      }

      // Calculate average rating from valid ratings only
      const averageRating =
        reviewInfoArray.reduce((sum, item) => sum + item.response_rating, 0) /
        reviewInfoArray.length;

      // Prepare feedback payload - only send email if it's not empty
      const feedbackPayload: FeedbackPayload = {
        product_id: product._id,
        product_code: product.product_code,
        user_name: userInfo.name.trim() || undefined,
        mobile_number: userInfo.mobile.trim(),
        email: userInfo.email.trim() || undefined, // Send undefined if empty
        review_info: reviewInfoArray,
        average_rating: parseFloat(averageRating.toFixed(1)),
      };

      // Submit to API
      const response = await apiService.post<{
        status: string;
        message: string;
      }>("/product-review", feedbackPayload);

      console.log("Feedback submitted successfully:", response);

      // Update URL with query parameter
      router.push(`/feedback/${productId}?isFeedBackSubmited=true`);

      // Clear form after successful submission
      handleClear();
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    if (!product) return;

    const clearedStates = product.questions.reduce(
      (acc, q) => {
        acc.ratings[q._id] = 0;
        acc.comments[q._id] = "";
        return acc;
      },
      {
        ratings: {} as Record<string, number>,
        comments: {} as Record<string, string>,
      }
    );

    setRatings(clearedStates.ratings);
    setComments(clearedStates.comments);
    setUserInfo({ name: "", mobile: "", email: "" });
    setErrors({});
  };

  if (isFeedbackSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-green-700 mb-3">
                  Thank You for Your Feedback!
                </h1>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your valuable feedback has been submitted successfully. We
                  appreciate you taking the time to share your experience with
                  us.
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Your feedback helps us improve our products and services.
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={() => router.push(`/feedback/${productId}`)}
                      variant="outline"
                    >
                      Go Back to Product
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "product":
        return (
          <Card>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.description}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Price:</span>
                      <span className="font-semibold">${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Seller:</span>
                      <span>{product.product_owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Product Code:</span>
                      <span className="font-mono text-sm">
                        {product.product_code}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-2">Categories:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.category.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case "user":
        return (
          <Card>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {config.userFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      type={field.type || "text"}
                      value={userInfo[field.id as keyof UserInfo]}
                      onChange={(e) =>
                        handleInputChange("user", field.id, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={
                        errors[field.id as keyof UserInfo]
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {errors[field.id as keyof UserInfo] && (
                      <p className="text-xs text-destructive">
                        {errors[field.id as keyof UserInfo]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );

      case "feedback":
        return (
          <Card>
            <div className="p-6">
              <div className="space-y-6">
                {product.questions.map((question, idx) => (
                  <div key={question._id}>
                    {idx > 0 && <Separator className="mb-6" />}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <h4 className="font-medium">
                            {question.question_text}
                          </h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{question.info}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Max: {question.max_rating}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Rating:</span>
                          <span>
                            {ratings[question._id] || 0}/{question.max_rating}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(question.max_rating)].map((_, i) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRatingChange(question._id, i + 1)
                              }
                              className="h-8 w-8 hover:bg-transparent"
                            >
                              <span className="text-2xl">
                                {i + 1 <= (ratings[question._id] || 0)
                                  ? "★"
                                  : "☆"}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Comments (Optional)</Label>
                        <Textarea
                          value={comments[question._id] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "comment",
                              question._id,
                              e.target.value
                            )
                          }
                          placeholder="Share your detailed feedback here..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Product Feedback</h1>
          <p className="text-muted-foreground text-sm">
            Share your experience with {product.name}
          </p>
        </div>

        {config.sections.map((section) => (
          <div key={section.id}>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            {renderSection(section.id)}
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClear} disabled={submitting}>
            Clear Form
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFeedback;
