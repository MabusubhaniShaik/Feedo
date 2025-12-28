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
      alert("Please fill in all required fields");
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
      alert(error.response?.data?.message || "Failed to create product");
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

  // Error state
  if (state.error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-[0.75rem]"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Products
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error Loading Product Owners</h4>
            <p className="text-sm mt-1">{state.error}</p>
          </div>
        </Alert>
        <Button
          onClick={fetchProductOwners}
          className="mt-4 text-[0.75rem]"
          size="sm"
        >
          Try Again
        </Button>
      </div>
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
            Products
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[0.875rem]">
              Create New Product
            </h1>
            <p className="text-muted-foreground text-[0.75rem]">
              Fill in the details below to create a new product
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={state.saving}
            className="text-[0.75rem]"
            size="sm"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={state.saving}
            className="text-[0.75rem]"
            size="sm"
          >
            <Save className="h-3 w-3 mr-1" />
            {state.saving ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </div>

      {/* Product Form */}
      <Card className="text-[0.75rem] gap-0 p-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[0.875rem]">
            Product Details
            <span className="text-red-500 ml-1">*</span>
            <span className="text-muted-foreground text-[0.75rem] ml-2">
              (All fields are required)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ProductForm
            ref={productFormRef}
            mode="create"
            initialData={{}}
            productOwners={state.productOwners}
            loading={state.saving}
          />
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-[0.875rem] font-medium text-blue-800 mb-2">
          💡 Quick Tips:
        </h3>
        <ul className="text-[0.75rem] text-blue-700 space-y-1">
          <li>• Product code will be automatically generated</li>
          <li>• Add at least one category for better organization</li>
          <li>• Include review questions to collect customer feedback</li>
          <li>• Products are active by default (can be changed later)</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCreate;
