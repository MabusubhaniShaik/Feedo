// app/product/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, PackagePlus, Trash2 } from "lucide-react";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
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

  const handleRowClick = async (product: Product) => {
    router.push(`/product/${product._id}`);
  };

  const handleCreate = () => {
    router.push("/product/create");
  };

  const handleDeleteClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await apiService.delete(`/product/${productToDelete._id}`);

      // Remove product from local state
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));

      // Close dialog
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Helper function to check if text needs truncation
  const needsTruncation = (text: string, maxLength: number = 15) => {
    return text && text.length > maxLength;
  };

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
      cell: (product: Product) => {
        const truncatedName = truncateText(product.name, 15);
        const showTooltip = needsTruncation(product.name, 15);

        if (showTooltip) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">{truncatedName}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-[0.75rem]">{product.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <span>{truncatedName}</span>;
      },
    },
    {
      key: "description" as keyof Product,
      header: "Description",
      className: "text-[0.75rem]",
      cell: (product: Product) => {
        const truncatedDesc = truncateText(product.description, 25);
        const showTooltip = needsTruncation(product.description, 25);

        if (showTooltip) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[12.5rem] truncate text-[0.75rem] cursor-default">
                    {truncatedDesc || "-"}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-[0.75rem]">{product.description || "-"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <div className="max-w-[12.5rem] text-[0.75rem]">
            {product.description || "-"}
          </div>
        );
      },
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
      className: "text-[0.75rem]",
      cell: (product: Product) => (
        <div className="flex flex-wrap gap-1">
          {product.category.slice(0, 2).map((cat, index) => (
            <Badge key={index} variant="secondary" className="text-[0.625rem]">
              {truncateText(cat, 10)}
            </Badge>
          ))}
          {product.category.length > 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-[0.625rem] cursor-default"
                  >
                    +{product.category.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="text-[0.75rem] font-medium">
                      All Categories:
                    </p>
                    {product.category.map((cat, idx) => (
                      <p key={idx} className="text-[0.75rem]">
                        • {cat}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => handleDeleteClick(product, e)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="text-[0.75rem] gap-0 p-0">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[0.875rem]">
              Product Management
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={handleCreate}
                size="sm"
                className="text-[0.625rem] h-6 px-2 gap-1"
              >
                <PackagePlus className="h-2.5 w-2.5" />
                Add Product
              </Button>
              <Button
                onClick={fetchProducts}
                variant="outline"
                size="sm"
                className="text-[0.625rem] h-6 px-2 gap-1"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <TooltipProvider>
            <DataTable
              data={products}
              columns={columns}
              loading={loading}
              emptyMessage="No products found"
              onRowClick={handleRowClick}
              className="[&_tr]:cursor-pointer [&_tr:hover]:bg-muted/50"
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="text-[0.75rem] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[0.875rem]">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{productToDelete?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="text-[0.75rem]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-[0.75rem]"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductPage;
