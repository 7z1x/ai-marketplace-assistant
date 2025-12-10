import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product, ProductAvailability } from '@/types';

interface ProductCardProps {
  product: Product;
  availability?: ProductAvailability;
  isLoading?: boolean;
}

export function ProductCard({ product, availability, isLoading = false }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card variant="product" className="flex flex-col">
      {/* Image Container */}
      <Link to={`/product/${product.external_id}`} className="relative overflow-hidden">
        <div className="aspect-square overflow-hidden bg-secondary/50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="secondary" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Quick View
          </Button>
        </div>

        {/* Category Badge */}
        <Badge variant="soft" className="absolute top-3 left-3">
          {product.metadata.category}
        </Badge>

        {/* Stock Status */}
        {availability && !availability.is_available && (
          <Badge variant="outOfStock" className="absolute top-3 right-3">
            Out of Stock
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand */}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {product.metadata.brand}
        </span>

        {/* Title */}
        <Link to={`/product/${product.external_id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Stock */}
        <div className="mt-auto pt-3 border-t border-border/50">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : availability ? (
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground">
                {formatPrice(availability.price)}
              </p>
              <div className="flex items-center justify-between">
                {availability.is_available ? (
                  <Badge variant="stock" className="text-xs">
                    {availability.stock} in stock
                  </Badge>
                ) : (
                  <Badge variant="outOfStock" className="text-xs">
                    Out of stock
                  </Badge>
                )}
                <Button 
                  variant="soft" 
                  size="iconSm"
                  disabled={!availability.is_available}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Price unavailable</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <div className="pt-3 border-t space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}
