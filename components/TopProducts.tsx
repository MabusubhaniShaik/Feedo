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
      <Card className="shadow-luxury">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No products with reviews
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-luxury">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base font-semibold">
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {products.map((product, index) => (
            <button
              key={product.product_id}
              onClick={() => onSelectProduct(product.product_id)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all duration-200 ${
                selectedProductId === product.product_id
                  ? "border-gold/60 bg-[var(--accent)]"
                  : "border-border bg-black/20 hover:border-gold/30 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                    index < 3
                      ? "bg-gold/15 text-gold"
                      : "bg-white/[0.05] text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{product.product_code}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.review_count} review
                    {product.review_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-sm font-semibold">
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
