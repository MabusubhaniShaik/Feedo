// app/product/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { ProductForm, ProductFormRef } from "@/components/forms/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Save,
  X,
  Eye,
  BarChart3,
  Copy,
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryParams = useSearchParams();

  const isEditMode = queryParams.get("isEdit") === "true";

  const [state, setState] = useState({
    product: null as any,
    loading: true,
    error: null as string | null,
    productOwners: [] as any[],
    saving: false,
  });

  const productFormRef = useRef<ProductFormRef>(null);

  // Fetch product and owners
  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchProductOwners();
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response: any = await apiService.get(`/product/${productId}`);

      // Handle response format
      let productData;

      if (response.data && Array.isArray(response.data)) {
        productData = response.data[0];
      } else if (response && response._id) {
        productData = response;
      } else if (response.data && response.data._id) {
        productData = response.data;
      }

      if (productData?._id) {
        setState((prev) => ({ ...prev, product: productData }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Product not found",
          product: null,
        }));
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load product",
        product: null,
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchProductOwners = async () => {
    try {
      const response: any = await apiService.get("/user");
      const owners = response.data || response || [];
      setState((prev) => ({ ...prev, productOwners: owners }));
    } catch (error) {
      console.error("Error fetching product owners:", error);
    }
  };

  const handleToggleEdit = () => {
    if (!id) return;
    const route = isEditMode ? `/product/${id}` : `/product/${id}?isEdit=true`;
    router.push(route);
  };

  const handleSave = async () => {
    if (!id || !productFormRef.current?.validate()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setState((prev) => ({ ...prev, saving: true }));
      const formData = productFormRef.current.getFormData();

      await apiService.put(`/product/${id}`, {
        ...formData,
        updated_by: "USER",
      });

      fetchProduct(id);
      router.push(`/product/${id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setState((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleCancel = () => {
    if (!id) return;
    router.push(`/product/${id}`);
  };

  const handleBack = () => router.push("/product");

  const handleCopyFeedbackUrl = () => {
    if (!id) return;
    const url = `${window.location.origin}/feedback/${id}`;
    navigator.clipboard.writeText(url);
    alert("Feedback URL copied to clipboard!");
  };

  const handleViewReports = () => {
    if (!id) return;
    router.push(`/reports?product=${id}`);
  };

  const handleViewFeedback = () => {
    if (!id) return;
    // router.push(`/feedback/${id}`);
    window.open(`/feedback/${id}`, "_blank");
  };

  // Loading state
  if (state.loading) {
    return <ProductDetailLoading />;
  }

  // Error state
  if (state.error || !state.product) {
    return (
      <ProductDetailError
        error={state.error}
        onBack={handleBack}
        onRetry={() => id && fetchProduct(id)}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl text-[0.75rem]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-[0.75rem]"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Products
          </Button>

          <div>
            <h1 className="text-xl font-bold text-[0.875rem]">
              {isEditMode ? "Edit Product" : state.product.name}
            </h1>
            <p className="text-muted-foreground text-[0.75rem]">
              {state.product.product_code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isEditMode ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={state.saving}
                className="text-[0.625rem] h-6 px-2"
                size="sm"
              >
                <X className="h-2.5 w-2.5 mr-0.5" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={state.saving}
                className="text-[0.625rem] h-6 px-2"
                size="sm"
              >
                <Save className="h-2.5 w-2.5 mr-0.5" />
                {state.saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleToggleEdit}
                className="text-[0.625rem] h-6 px-2 gap-1"
                size="sm"
              >
                <Edit className="h-2.5 w-2.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleViewFeedback}
                className="text-[0.625rem] h-6 px-2 gap-1"
                size="sm"
              >
                <Eye className="h-2.5 w-2.5" />
                Feedback
              </Button>
              <Button
                variant="outline"
                onClick={handleViewReports}
                className="text-[0.625rem] h-6 px-2 gap-1"
                size="sm"
              >
                <BarChart3 className="h-2.5 w-2.5" />
                Reports
              </Button>
              <Button
                onClick={handleCopyFeedbackUrl}
                className="text-[0.625rem] h-6 px-2 gap-1"
                size="sm"
              >
                <Copy className="h-2.5 w-2.5" />
                Copy URL
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Product Form */}
      <Card className="text-[0.75rem] p-0 gap-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[0.875rem]">
            {isEditMode ? "Edit Product Details" : "Product Details"}
            {!isEditMode && (
              <span className="font-normal text-muted-foreground ml-2 text-[0.75rem]">
                (Read-only)
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <ProductForm
            ref={productFormRef}
            mode={isEditMode ? "edit" : "view"}
            initialData={state.product}
            productOwners={state.productOwners}
            loading={state.saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Loading Component
function ProductDetailLoading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

// Error Component
interface ProductDetailErrorProps {
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
}

function ProductDetailError({
  error,
  onBack,
  onRetry,
}: ProductDetailErrorProps) {
  return (
    <div className="container mx-auto p-4 max-w-6xl text-[0.75rem]">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-[0.75rem]"
          size="sm"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Products
        </Button>
      </div>

      <Alert variant="destructive" className="text-[0.75rem]">
        <AlertCircle className="h-3 w-3" />
        <div>
          <h4 className="font-medium">Error Loading Product</h4>
          <p className="mt-1 text-[0.75rem]">{error || "Product not found"}</p>
        </div>
      </Alert>

      <Button onClick={onRetry} className="mt-4 text-[0.75rem]" size="sm">
        Try Again
      </Button>
    </div>
  );
}
