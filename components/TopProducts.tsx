// app/statistics/components/TopProducts.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TopProductsProps {
  products: Array<{
    product_id: string;
    product_code: string;
    review_count: number;
    average_rating: number;
  }>;
  onSelectProduct: (productId: string) => void;
  selectedProductId: string | null;
}

export default function TopProducts({
  products,
  onSelectProduct,
  selectedProductId,
}: TopProductsProps) {
  if (products.length === 0) {
    return (
      <Card className="text-[10px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px]">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No products with reviews
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-[10px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[12px]">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product, index) => (
            <button
              key={product.product_id}
              onClick={() => onSelectProduct(product.product_id)}
              className={`w-full text-left flex items-center justify-between p-2 border rounded transition-colors ${
                selectedProductId === product.product_id
                  ? "bg-primary/5 border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-6 flex items-center justify-center rounded ${
                    index < 3 ? "bg-yellow-500/10" : "bg-muted"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      index < 3 ? "text-yellow-600" : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{product.product_code}</p>
                  <p className="text-muted-foreground">
                    {product.review_count} review
                    {product.review_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {product.average_rating.toFixed(1)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
