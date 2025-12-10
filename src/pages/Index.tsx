import { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, ArrowRight, Package, Truck, Shield, Headphones } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { CategoryFilter } from '@/components/product/CategoryFilter';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts, mockAvailability, mockCategories } from '@/data/mockProducts';
import type { Product, ProductAvailability } from '@/types';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availability, setAvailability] = useState<Record<string, ProductAvailability>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  // Simulate fetching real-time availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setAvailability(mockAvailability);
      setIsLoadingAvailability(false);
    };

    fetchAvailability();
  }, []);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.metadata.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' ||
        product.metadata.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const features = [
    { icon: Package, title: 'Premium Products', description: 'Curated selection of top-tier tech' },
    { icon: Truck, title: 'Fast Shipping', description: 'Free delivery on orders over Rp 1M' },
    { icon: Shield, title: 'Secure Payment', description: '100% secure transactions' },
    { icon: Headphones, title: 'AI Support', description: '24/7 intelligent assistance' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-hero py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-bounce-in">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Shopping Experience</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
                Discover Premium
                <span className="text-gradient block">Tech Products</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                Shop the latest electronics with AI-powered recommendations. Get instant answers about products, pricing, and availability.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    variant="search"
                    placeholder="Search laptops, monitors, peripherals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-32 h-14 text-base shadow-lg"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex flex-col items-center text-center p-4 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 lg:py-16">
          <div className="container">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} products available
                </p>
              </div>
              
              <Button variant="outline" className="gap-2 self-start">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Filter */}
            <div className="mb-8 overflow-x-auto pb-2">
              <CategoryFilter
                categories={mockCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingAvailability ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    availability={availability[product.external_id]}
                    isLoading={isLoadingAvailability}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-primary">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center text-primary-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-4 animate-float" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Need Help Finding the Perfect Product?
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Our AI assistant can help you find exactly what you're looking for, compare products, and answer any questions.
              </p>
              <Button variant="secondary" size="lg" className="gap-2">
                Chat with AI Assistant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
