import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Vapor<span className="text-primary">Shop</span>
          </span>
        </Link>
        <SearchBar />
      </div>
    </header>
  );
}
