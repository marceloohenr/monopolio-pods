import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

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
          className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="glass flex items-center gap-2 rounded-full px-2.5 py-1.5 sm:px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar pods"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-20 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-28 md:w-40"
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
