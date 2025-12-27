// app/manage/product/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/helpers/api.service";
import { DataTable } from "@/components/common/DataTable";
import { DataDialog } from "@/components/common/DataDialog";
import { ProductForm, ProductFormRef } from "@/components/forms/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, PackagePlus, Edit, Trash2 } from "lucide-react";

interface Product {
  _id: string;
  product_code: string;
  name: string;
  description: string;
  price: number;
  category: string[];
  image_urls: string[];
  product_owner_id: string;
  product_owner_name: string;
  questions: Array<{
    question_text: string;
    max_rating: number;
    info: string;
    is_active?: boolean;
  }>;
  total_reviews: number;
  average_rating: number;
  is_active: boolean;
  created_date: string;
  created_by: string;
  updated_by: string;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "create" | "edit">(
    "view"
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [productOwners, setProductOwners] = useState<
    Array<{ _id: string; name: string }>
  >([]);

  const productFormRef = useRef<ProductFormRef>(null);

  useEffect(() => {
    fetchProducts();
    fetchProductOwners();
  }, []);

  const fetchProducts = async () => {
    try {
      const response: any = await apiService.get("/product");
      const data = response.data || response;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductOwners = async () => {
    try {
      // Assuming you have an endpoint to get product owners (users)
      const response: any = await apiService.get("/user");
      const data = response.data || response;
      setProductOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching product owners:", error);
    }
  };

  const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
      const response: any = await apiService.get(`/product/${id}`);
      return response.data[0];
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  };

  const handleRowClick = async (product: Product) => {
    setFormLoading(true);
    try {
      // Fetch complete product data including questions
      const fullProductData = await fetchProductById(product._id);
      if (fullProductData) {
        setSelectedProduct(fullProductData);
        setDialogMode("view");
        setDialogOpen(true);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setFormLoading(true);
    try {
      // Fetch complete product data including questions
      const fullProductData = await fetchProductById(product._id);
      if (fullProductData) {
        setSelectedProduct(fullProductData);
        setDialogMode("edit");
        setDialogOpen(true);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.delete(`/product/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    try {
      // Get form data from the ref
      const formData = productFormRef.current?.getFormData();

      if (!formData) {
        throw new Error("No form data available");
      }

      if (dialogMode === "create") {
        await apiService.post("/product", {
          ...formData,
          created_by: "SYSTEM",
          updated_by: "SYSTEM",
        });
      } else if (dialogMode === "edit" && selectedProduct) {
        await apiService.put(`/product/${selectedProduct._id}`, {
          ...formData,
          updated_by: "SYSTEM",
        });
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const getFormData = useCallback(() => {
    return productFormRef.current?.getFormData();
  }, []);

  // Columns definition
  const columns = [
    {
      key: "product_code" as keyof Product,
      header: "Product Code",
      className: "text-[0.75rem]",
    },
    {
      key: "name" as keyof Product,
      header: "Name",
      className: "text-[0.75rem]",
    },
    {
      key: "description" as keyof Product,
      header: "Description",
      className: "text-[0.75rem]",
      cell: (product: Product) => (
        <div className="max-w-[12.5rem] truncate text-[0.75rem]">
          {product.description || "-"}
        </div>
      ),
    },
    {
      key: "price" as keyof Product,
      header: "Price",
      className: "text-[0.75rem]",
      cell: (product: Product) => (
        <span className="text-[0.75rem]">
          ${product.price?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      key: "category" as keyof Product,
      header: "Category",
      className: "text-[0.75rem]", // Fixed: Added opening quote
      cell: (product: Product) => (
        <div className="flex flex-wrap gap-1">
          {product.category.slice(0, 2).map((cat, index) => (
            <Badge key={index} variant="secondary" className="text-[0.625rem]">
              {cat}
            </Badge>
          ))}
          {product.category.length > 2 && (
            <Badge variant="outline" className="text-[0.625rem]">
              +{product.category.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "is_active" as keyof Product,
      header: "Status",
      className: "text-[0.75rem]",
      cell: (product: Product) => (
        <Badge
          variant={product.is_active ? "default" : "destructive"}
          className="text-[0.625rem]"
        >
          {product.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "_id" as keyof Product,
      header: "Actions",
      className: "text-[0.75rem] text-right",
      cell: (product: Product) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product._id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-0">
      <Card className="text-[0.875rem]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[1rem]">Product Management</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                size="sm"
                className="text-[0.75rem] h-8"
              >
                <PackagePlus className="h-3 w-3 mr-1" />
                Add Product
              </Button>
              <Button
                onClick={fetchProducts}
                variant="outline"
                size="sm"
                className="text-[0.75rem] h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="No products found"
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      <DataDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        title="Product"
        data={selectedProduct || undefined}
        onSubmit={handleFormSubmit}
        submitLabel={dialogMode === "create" ? "Create" : "Update"}
        loading={formLoading}
        getFormData={getFormData}
      >
        <ProductForm
          ref={productFormRef}
          mode={dialogMode}
          initialData={selectedProduct || undefined}
          loading={formLoading}
          productOwners={productOwners}
        />
      </DataDialog>
    </div>
  );
};

export default ProductPage;
