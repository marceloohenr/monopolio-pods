import { Link, useParams } from "react-router-dom";
import { Battery, Droplets, Percent, Settings, Sparkles, Zap } from "lucide-react";
import { categories } from "@/data/products";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Battery,
  Droplets,
  Settings,
  Sparkles,
  Percent,
};

export function CategoryNav() {
  const { slug } = useParams();

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2 md:px-0">
      <Link
        to="/"
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
          !slug
            ? "bg-primary text-primary-foreground box-glow"
            : "glass text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        Todos
      </Link>

      {categories.map((category) => {
        const Icon = iconMap[category.icon] || Zap;
        const isActive = slug === category.slug;

        return (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground box-glow"
                : "glass text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
