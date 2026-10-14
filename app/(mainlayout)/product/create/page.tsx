// app/product/create/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { ProductForm, ProductFormRef } from "@/components/forms/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";

const ProductCreate = () => {
  const router = useRouter();

  const [state, setState] = useState({
    loading: false,
    saving: false,
    error: null as string | null,
    productOwners: [] as any[],
  });

  const productFormRef = useRef<ProductFormRef>(null);

  // Fetch product owners on mount
  useEffect(() => {
    fetchProductOwners();
  }, []);

  const fetchProductOwners = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response: any = await apiService.get("/user");
      const owners = response.data || response || [];
      setState((prev) => ({ ...prev, productOwners: owners }));
    } catch (error: any) {
      console.error("Error fetching product owners:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load product owners",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSave = async () => {
    if (!productFormRef.current?.validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setState((prev) => ({ ...prev, saving: true }));
      const formData = productFormRef.current.getFormData();

      // Generate product code if not provided
      const productCode =
        formData.product_code ||
        `PROD-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

      const payload = {
        ...formData,
        product_code: productCode.toUpperCase(),
        created_by: "USER",
        updated_by: "USER",
      };

      const response: any = await apiService.post("/product", payload);

      // Navigate to the newly created product's page
      if (response?._id || response?.data?._id) {
        const newProductId = response._id || response.data._id;
        router.push(`/product/${newProductId}`);
      } else {
        router.push("/product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setState((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBack = () => {
    router.push("/product");
  };

  // Loading state for product owners
  if (state.loading) {
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

  // Error state
  if (state.error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
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
            <h4 className="font-medium">Error Loading Product Owners</h4>
            <p className="mt-1 text-sm">{state.error}</p>
          </div>
        </Alert>
        <Button
          onClick={fetchProductOwners}
          className="mt-4 h-9 px-4"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
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
            Create New Product
          </h1>
          <div className="mt-3 h-px w-24 gold-rule" />
          <p className="mt-3 text-sm text-muted-foreground">
            Fill in the details below to create a new product
          </p>
        </div>

        <div className="flex gap-2">
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
          <Button onClick={handleSave} disabled={state.saving} size="sm">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {state.saving ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </div>

      {/* Product Form */}
      <Card className="shadow-luxury">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg font-semibold">
            Product Details
            <span className="ml-1 text-destructive">*</span>
            <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
              (All fields are required)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            ref={productFormRef}
            mode="create"
            initialData={{}}
            productOwners={state.productOwners}
            loading={state.saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCreate;
