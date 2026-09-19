import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@/data/products";

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const CatalogContext = React.createContext<CatalogContextValue | null>(null);

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
  return response.json() as Promise<T>;
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const productsQuery = useQuery({
    queryKey: ["catalog", "products"],
    queryFn: () => fetchJson<{ products: Product[] }>("/api/catalog/products"),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => fetchJson<{ categories: Category[] }>("/api/catalog/categories"),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  const value = React.useMemo<CatalogContextValue>(
    () => ({
      products: productsQuery.data?.products ?? [],
      categories: categoriesQuery.data?.categories ?? [],
      isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
      isError: productsQuery.isError || categoriesQuery.isError,
      refetch: () => {
        void productsQuery.refetch();
        void categoriesQuery.refetch();
      },
    }),
    [categoriesQuery, productsQuery],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = React.useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within CatalogProvider.");
  return context;
}

export function CatalogStatus() {
  const { isLoading, isError, refetch } = useCatalog();
  if (isLoading) return <div className="px-4 py-16 text-center text-sm text-muted-foreground">Carregando catálogo...</div>;
  if (isError) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Não foi possível carregar o catálogo.</p>
        <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-primary hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }
  return null;
}
