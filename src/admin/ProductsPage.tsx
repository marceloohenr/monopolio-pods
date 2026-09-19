import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { formatPrice, isProductAvailable } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminRequest } from "./api";

type Filter = "all" | "available" | "unavailable";

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminRequest<{ products: Product[] }>("/api/admin/products"),
  });
  const availability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      adminRequest<{ product: Product }>(`/api/admin/products/${id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable }),
      }),
    onSuccess: ({ product }) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(product.isAvailable ? "Produto marcado como disponível." : "Produto marcado como indisponível.");
    },
    onError: (error) => toast.error(error.message),
  });
  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (productsQuery.data?.products ?? []).filter((product) => {
      const available = isProductAvailable(product);
      const matchesFilter = filter === "all" || (filter === "available" ? available : !available);
      return matchesFilter && (!normalized || product.name.toLowerCase().includes(normalized));
    });
  }, [filter, productsQuery.data, query]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p><h2 className="mt-1 text-2xl font-semibold">Produtos</h2><p className="mt-1 text-sm text-muted-foreground">Gerencie informações, sabores, imagens e disponibilidade.</p></div>
        <Button asChild><Link to="/products/new"><Plus className="h-4 w-4" /> Novo produto</Link></Button>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Pesquisar produto..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <div className="flex gap-1 rounded-md bg-muted p-1">
            {([['all', 'Todos'], ['available', 'Disponíveis'], ['unavailable', 'Indisponíveis']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded px-3 py-2 text-xs font-medium ${filter === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      {productsQuery.isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Carregando produtos...</p> : productsQuery.isError ? <p className="py-10 text-center text-sm text-destructive">Não foi possível carregar os produtos.</p> : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <div className="hidden grid-cols-[64px_1fr_120px_130px_180px] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span>Imagem</span><span>Produto</span><span>Preço</span><span>Status</span><span>Ações</span>
          </div>
          <div className="divide-y divide-border">
            {products.map((product) => {
              const available = isProductAvailable(product);
              return (
                <article key={product.id} className="grid gap-3 p-4 md:grid-cols-[64px_1fr_120px_130px_180px] md:items-center md:gap-4">
                  <img src={product.images[0] || "/placeholder.svg"} alt="" className="h-16 w-16 rounded-md border border-border object-contain" />
                  <div className="min-w-0"><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.brand} · {product.variations.length} sabores</p></div>
                  <p className="font-semibold">{formatPrice(product.promoPrice ?? product.price)}</p>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{available ? "Disponível" : "Indisponível"}</span>
                  <div className="flex items-center justify-between gap-3 md:justify-start">
                    <Switch checked={available} disabled={availability.isPending} onCheckedChange={(checked) => availability.mutate({ id: product.id, isAvailable: checked })} aria-label={`Alterar disponibilidade de ${product.name}`} />
                    <Button asChild variant="outline" size="sm"><Link to={`/products/${product.id}`}><Edit3 className="h-4 w-4" /> Editar</Link></Button>
                  </div>
                </article>
              );
            })}
            {products.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

