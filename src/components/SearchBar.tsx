import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition"
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-32 md:w-48"
          />
          <button type="button" onClick={() => { setOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
