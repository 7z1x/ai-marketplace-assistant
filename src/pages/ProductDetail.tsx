import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, MessageCircle, Star, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { mockProducts, mockAvailability } from '@/data/mockProducts';
import type { Product, ProductAvailability } from '@/types';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [availability, setAvailability] = useState<ProductAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const foundProduct = mockProducts.find(p => p.external_id === productId);
      setProduct(foundProduct || null);
      
      if (foundProduct && mockAvailability[foundProduct.external_id]) {
        setAvailability(mockAvailability[foundProduct.external_id]);
      }
      
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        {/* Product Section */}
        <section className="container pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary/50 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand & Title */}
              <div>
                <Badge variant="soft" className="mb-3">{product.metadata.category}</Badge>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">{product.metadata.brand}</p>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-accent fill-accent' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.0 (128 reviews)</span>
                </div>
              </div>

              {/* Price & Stock */}
              <Card variant="glass" className="p-4">
                {availability ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{formatPrice(availability.price)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {availability.is_available ? (
                        <Badge variant="stock" className="text-sm py-1 px-3">
                          <Check className="h-3 w-3 mr-1" />
                          {availability.stock} in stock
                        </Badge>
                      ) : (
                        <Badge variant="outOfStock" className="text-sm py-1 px-3">
                          Out of stock
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Updated: {new Date(availability.last_updated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-16 w-full" />
                )}
              </Card>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button 
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x min-w-[3rem] text-center">{quantity}</span>
                    <button 
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 gap-2"
                    disabled={!availability?.is_available}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* AI Assistant Button */}
                <Button variant="soft" size="lg" className="w-full gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Ask AI About This Product
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground">Official Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12">
            <div className="border-b">
              <div className="flex gap-8">
                {(['description', 'specs', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.content}</p>
                </div>
              )}

              {activeTab === 'specs' && product.metadata.specifications && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.metadata.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Reviews coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget 
        productContext={{ 
          product_id: product.external_id, 
          name: product.name 
        }} 
      />
    </div>
  );
};

export default ProductDetail;
