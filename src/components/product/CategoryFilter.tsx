import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        >
          <Badge
            variant={selectedCategory === category.slug ? 'default' : 'category'}
            className={cn(
              "px-4 py-2 text-sm cursor-pointer",
              selectedCategory === category.slug && "shadow-md"
            )}
          >
            {category.name}
            {category.count !== undefined && (
              <span className="ml-1.5 opacity-70">({category.count})</span>
            )}
          </Badge>
        </button>
      ))}
    </div>
  );
}
