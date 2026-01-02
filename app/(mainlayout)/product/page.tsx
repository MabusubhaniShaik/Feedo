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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

interface PaginationData {
  current_page: number;
  page_count: number;
  total_record_count: number;
  limit: number;
}

const ProductPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    page_count: 1,
    total_record_count: 0,
    limit: 10,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  const getUserIdFromSession = (): string | null => {
    if (typeof window === "undefined") return null;
    const userInfo = sessionStorage.getItem("user_info");
    if (!userInfo) return null;
    try {
      const parsed = JSON.parse(userInfo);
      return parsed?.id || null;
    } catch {
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productOwnerId = getUserIdFromSession();
      if (!productOwnerId) throw new Error("User not found");

      const response: any = await apiService.get("/product", {
        product_owner_id: productOwnerId,
        page,
        limit,
      });

      const data = response.data || response;
      const paginationData = response.pagination || {
        current_page: page,
        page_count: 1,
        total_record_count: Array.isArray(data) ? data.length : 0,
        limit,
      };

      setProducts(Array.isArray(data) ? data : []);
      setPagination(paginationData);
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

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setPagination((prev) => ({
        ...prev,
        total_record_count: prev.total_record_count - 1,
      }));

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1);
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const { page_count } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    if (page_count <= maxVisiblePages) {
      for (let i = 1; i <= page_count; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(page_count, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (endPage < page_count) {
        if (endPage < page_count - 1) pages.push("...");
        pages.push(page_count);
      }
    }

    return pages;
  };

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
      cell: (product: Product) => truncateText(product.name, 15),
    },
    {
      key: "description" as keyof Product,
      header: "Description",
      className: "text-[0.75rem]",
      cell: (product: Product) => (
        <div className="max-w-[12.5rem] truncate text-[0.75rem]">
          {truncateText(product.description, 25) || "-"}
        </div>
      ),
    },
    {
      key: "price" as keyof Product,
      header: "Price",
      className: "text-[0.75rem]",
      cell: (product: Product) => `$${product.price?.toFixed(2) || "0.00"}`,
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
      <Card className="text-[0.75rem]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[0.875rem]">Products</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={handleCreate}
                size="sm"
                className="text-[0.75rem] h-6 px-2 rounded-[3px]"
              >
                <PackagePlus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button
                onClick={fetchProducts}
                variant="outline"
                size="sm"
                className="text-[0.75rem] h-6 px-2 rounded-[3px]"
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
            className="[&_tr]:cursor-pointer [&_tr:hover]:bg-muted/50"
          />

          {/* Pagination */}
          <div className="mt-4 w-full flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={`text-[0.75rem] ${
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  />
                </PaginationItem>

                {generatePageNumbers().map((pageNum, index) =>
                  pageNum === "..." ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <span className="px-1 text-[0.75rem]">...</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum as number)}
                        isActive={page === pageNum}
                        className="text-[0.75rem]"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.page_count, page + 1)
                      )
                    }
                    className={`text-[0.75rem] ${
                      page === pagination.page_count
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="text-[0.75rem] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[0.875rem]">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-medium">{productToDelete?.name}</span>? This
              cannot be undone.
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
