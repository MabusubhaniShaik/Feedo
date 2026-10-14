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
  Copy,
} from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Please fill in all required fields");
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
      toast.error(error.response?.data?.message || "Failed to save product");
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
    toast.success("Feedback URL copied to clipboard!");
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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={handleBack}
            className="-ml-3 mb-2 h-auto gap-1.5 p-0 text-xs text-gold hover:text-gold-soft"
            size="sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Edit Product" : state.product.name}
          </h1>
          <div className="mt-3 h-px w-24 gold-rule" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold">
            {state.product.product_code}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={state.saving}
                className="border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
                size="sm"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={state.saving}
                size="sm"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {state.saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleToggleEdit} className="gap-1.5" size="sm">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleViewFeedback}
                className="gap-1.5 border-gold/40 text-gold hover:bg-[var(--accent)] hover:text-gold-soft"
                size="sm"
              >
                <Eye className="h-3.5 w-3.5" />
                Feedback
              </Button>
              <Button
                onClick={handleCopyFeedbackUrl}
                variant="outline"
                className="gap-1.5"
                size="sm"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy URL
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Product Form */}
      <Card className="shadow-luxury">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg font-semibold">
            {isEditMode ? "Edit Product Details" : "Product Details"}
            {!isEditMode && (
              <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                (Read-only)
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
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
    <div className="mx-auto max-w-5xl">
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
    <div className="mx-auto max-w-5xl text-sm">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-3 h-auto gap-2 p-0 text-xs text-gold hover:text-gold-soft"
          size="sm"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Products
        </Button>
      </div>

      <Alert variant="destructive" className="border-destructive/50 shadow-luxury">
        <AlertCircle className="h-4 w-4" />
        <div>
          <h4 className="font-medium">Error Loading Product</h4>
          <p className="mt-1 text-sm">{error || "Product not found"}</p>
        </div>
      </Alert>

      <Button onClick={onRetry} className="mt-4 h-9 px-4" size="sm">
        Try Again
      </Button>
    </div>
  );
}
