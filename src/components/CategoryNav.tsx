import { categories } from "@/data/products";
import { Link, useParams } from "react-router-dom";
import { Zap, Battery, Droplets, Settings, Sparkles, Percent } from "lucide-react";

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
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
      <Link
        to="/"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          !slug
            ? "bg-primary text-primary-foreground box-glow"
            : "glass text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        Todos
      </Link>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] || Zap;
        const isActive = slug === cat.slug;
        return (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary text-primary-foreground box-glow"
                : "glass text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
