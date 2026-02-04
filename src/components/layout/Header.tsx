import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            Tech<span className="text-primary">Store</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="soft" className="hidden sm:flex gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Cart (0)</span>
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
