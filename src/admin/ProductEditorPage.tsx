import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical, ImagePlus, Plus, Save, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Category, Product, ProductImageRecord } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminRequest } from "./api";

interface FormState {
  name: string;
  brand: string;
  categoryId: string;
  puffs: string;
  description: string;
  price: string;
  isAvailable: boolean;
  variations: Array<{ id?: string; name: string; isAvailable: boolean }>;
}

const emptyForm: FormState = {
  name: "", brand: "", categoryId: "", puffs: "", description: "", price: "", isAvailable: false,
  variations: [{ name: "", isAvailable: true }],
};

export function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [product, setProduct] = React.useState<Product | null>(null);
  const categoriesQuery = useQuery({ queryKey: ["catalog", "categories"], queryFn: () => adminRequest<{ categories: Category[] }>("/api/catalog/categories") });
  const productQuery = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => adminRequest<{ product: Product }>(`/api/admin/products/${id}`),
    enabled: editing,
  });

  React.useEffect(() => {
    if (!productQuery.data?.product) return;
    const current = productQuery.data.product;
    setProduct(current);
    setForm({
      name: current.name,
      brand: current.brand,
      categoryId: current.categoryId,
      puffs: String(current.puffs),
      description: current.description,
      price: (current.priceCents != null ? current.priceCents / 100 : current.price).toFixed(2),
      isAvailable: Boolean(current.isAvailable),
      variations: current.variations.map((variation) => ({ id: variation.id, name: variation.name, isAvailable: variation.isAvailable ?? variation.inStock })),
    });
  }, [productQuery.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(), brand: form.brand.trim(), categoryId: form.categoryId,
        puffs: Number(form.puffs), description: form.description.trim(),
        priceCents: Math.round(Number(form.price.replace(",", ".")) * 100),
        variations: form.variations.filter((variation) => variation.name.trim()).map((variation) => ({ ...variation, name: variation.name.trim() })),
      };
      if (!payload.name || !payload.brand || !payload.categoryId || !payload.description || !Number.isFinite(payload.priceCents) || payload.priceCents < 0) {
        throw new Error("Preencha os campos obrigatórios com valores válidos.");
      }
      const result = await adminRequest<{ product: Product }>(editing ? `/api/admin/products/${id}` : "/api/admin/products", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (editing && result.product.isAvailable !== form.isAvailable) {
        return adminRequest<{ product: Product }>(`/api/admin/products/${result.product.id}/availability`, {
          method: "PATCH", body: JSON.stringify({ isAvailable: form.isAvailable }),
        });
      }
      return result;
    },
    onSuccess: ({ product: saved }) => {
      setProduct(saved);
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(editing ? "Produto atualizado com sucesso." : "Produto criado. Adicione uma imagem antes de disponibilizá-lo.");
      if (!editing) navigate(`/products/${saved.id}`, { replace: true });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const updateVariation = (index: number, patch: Partial<FormState["variations"][number]>) => updateField("variations", form.variations.map((variation, position) => position === index ? { ...variation, ...patch } : variation));
  const moveVariation = (index: number, offset: -1 | 1) => {
    const destination = index + offset;
    if (destination < 0 || destination >= form.variations.length) return;
    const next = [...form.variations];
    [next[index], next[destination]] = [next[destination], next[index]];
    updateField("variations", next);
  };

  if (editing && productQuery.isLoading) return <p className="py-12 text-center text-sm text-muted-foreground">Carregando produto...</p>;
  if (editing && productQuery.isError) return <p className="py-12 text-center text-sm text-destructive">Produto não encontrado.</p>;

  return (
    <section className="space-y-5">
      <div><Button asChild variant="ghost" size="sm" className="-ml-3 mb-2"><Link to="/products"><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Produtos</p><h2 className="mt-1 text-2xl font-semibold">{editing ? "Editar produto" : "Novo produto"}</h2></div>
      <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-5">
        <div className="grid gap-5 rounded-lg border border-border bg-background p-5 md:grid-cols-2">
          <Field label="Nome" htmlFor="product-name"><Input id="product-name" required maxLength={140} value={form.name} onChange={(event) => updateField("name", event.target.value)} /></Field>
          <Field label="Marca" htmlFor="product-brand"><Input id="product-brand" required maxLength={80} value={form.brand} onChange={(event) => updateField("brand", event.target.value)} /></Field>
          <Field label="Categoria" htmlFor="product-category"><select id="product-category" required value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option>{categoriesQuery.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <Field label="Puffs" htmlFor="product-puffs"><Input id="product-puffs" type="number" min="0" step="1" required value={form.puffs} onChange={(event) => updateField("puffs", event.target.value)} /></Field>
          <Field label="Preço" htmlFor="product-price"><Input id="product-price" type="number" min="0" step="0.01" required value={form.price} onChange={(event) => updateField("price", event.target.value)} /></Field>
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3"><div><Label htmlFor="product-available">Disponibilidade</Label><p className="text-xs text-muted-foreground">Produto comprável na loja.</p></div><Switch id="product-available" checked={form.isAvailable} onCheckedChange={(checked) => updateField("isAvailable", checked)} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="product-description">Descrição</Label><Textarea id="product-description" required maxLength={2000} rows={5} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></div>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Sabores</h3><p className="text-sm text-muted-foreground">Ative ou desative sabores sem controlar quantidade.</p></div><Button type="button" variant="outline" size="sm" onClick={() => updateField("variations", [...form.variations, { name: "", isAvailable: true }])}><Plus className="h-4 w-4" /> Adicionar</Button></div>
          <div className="mt-4 space-y-3">{form.variations.map((variation, index) => <div key={variation.id ?? index} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center"><div className="flex"><Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label="Mover sabor para cima" onClick={() => moveVariation(index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" disabled={index === form.variations.length - 1} aria-label="Mover sabor para baixo" onClick={() => moveVariation(index, 1)}><ArrowDown className="h-4 w-4" /></Button></div><Input aria-label={`Nome do sabor ${index + 1}`} placeholder="Nome do sabor" value={variation.name} onChange={(event) => updateVariation(index, { name: event.target.value })} /><div className="flex items-center gap-2"><Switch checked={variation.isAvailable} onCheckedChange={(checked) => updateVariation(index, { isAvailable: checked })} /><span className="text-xs text-muted-foreground">{variation.isAvailable ? "Ativo" : "Inativo"}</span></div><Button type="button" variant="ghost" size="icon" aria-label="Remover sabor" onClick={() => updateField("variations", form.variations.filter((_, position) => position !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
        </div>

        {product ? <ImagesManager product={product} onProduct={setProduct} /> : <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center"><ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Salve o produto para adicionar imagens.</p></div>}

        <div className="sticky bottom-3 flex justify-end rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur"><Button type="submit" disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? "Salvando..." : "Salvar alterações"}</Button></div>
      </form>
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>; }

function ImagesManager({ product, onProduct }: { product: Product; onProduct: (product: Product) => void }) {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const images = product.imageRecords ?? [];
  const apply = (updated: Product, message: string) => { onProduct(updated); void queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); void queryClient.invalidateQueries({ queryKey: ["catalog"] }); toast.success(message); };
  const upload = async (file: File) => { const body = new FormData(); body.append("image", file); const result = await adminRequest<{ product: Product }>(`/api/admin/products/${product.id}/images`, { method: "POST", body }); apply(result.product, "Imagem adicionada com sucesso."); };
  const replace = async (imageId: string, file: File) => { const body = new FormData(); body.append("image", file); const result = await adminRequest<{ product: Product }>(`/api/admin/products/${product.id}/images/${imageId}/replace`, { method: "POST", body }); apply(result.product, "Imagem substituída com sucesso."); };
  const dragEnd = async (event: DragEndEvent) => { if (!event.over || event.active.id === event.over.id) return; const oldIndex = images.findIndex((image) => image.id === event.active.id); const newIndex = images.findIndex((image) => image.id === event.over!.id); const ordered = arrayMove(images, oldIndex, newIndex); onProduct({ ...product, imageRecords: ordered, images: ordered.map((image) => image.path) }); try { const result = await adminRequest<{ product: Product }>(`/api/admin/products/${product.id}/images/order`, { method: "PUT", body: JSON.stringify({ imageIds: ordered.map((image) => image.id) }) }); apply(result.product, "Ordem das imagens atualizada."); } catch (error) { onProduct(product); toast.error(error instanceof Error ? error.message : "Não foi possível ordenar as imagens."); } };

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Imagens do produto</h3><p className="text-sm text-muted-foreground">Arraste para ordenar. A imagem principal aparece primeiro na loja.</p></div><label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"><Upload className="h-4 w-4" /> Adicionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file).catch((error) => toast.error(error.message)); event.currentTarget.value = ""; }} /></label></div>
      {images.length ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void dragEnd(event)}><SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{images.map((image) => <SortableImage key={image.id} image={image} productId={product.id} canRemove={images.length > 1} onUpdated={apply} onReplace={replace} />)}</div></SortableContext></DndContext> : <p className="mt-4 rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhuma imagem adicionada.</p>}
    </div>
  );
}

function SortableImage({ image, productId, canRemove, onUpdated, onReplace }: { image: ProductImageRecord; productId: string; canRemove: boolean; onUpdated: (product: Product, message: string) => void; onReplace: (id: string, file: File) => Promise<void> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const action = async (url: string, method: string, message: string) => { const result = await adminRequest<{ product: Product }>(url, { method }); onUpdated(result.product, message); };
  return (
    <article ref={setNodeRef} style={style} className="overflow-hidden rounded-md border border-border bg-muted/30">
      <div className="relative aspect-square bg-background"><img src={image.path} alt="" className="h-full w-full object-contain" />{image.isPrimary && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">Principal</span>}<button type="button" {...attributes} {...listeners} className="absolute right-2 top-2 cursor-grab rounded bg-background/90 p-2 shadow" aria-label="Arrastar imagem"><GripVertical className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-2 gap-1 p-2">
        {!image.isPrimary && <Button type="button" variant="outline" size="sm" onClick={() => void action(`/api/admin/products/${productId}/images/${image.id}/primary`, "PATCH", "Imagem principal atualizada.").catch((error) => toast.error(error.message))}><Star className="h-3.5 w-3.5" /> Principal</Button>}
        <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-md border border-input px-2 text-xs font-medium hover:bg-accent"><Upload className="h-3.5 w-3.5" /> Substituir<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onReplace(image.id, file).catch((error) => toast.error(error.message)); event.currentTarget.value = ""; }} /></label>
        <Button type="button" variant="ghost" size="sm" disabled={!canRemove} className="col-span-2 text-destructive hover:text-destructive" onClick={() => { if (window.confirm("Remover esta imagem?")) void action(`/api/admin/products/${productId}/images/${image.id}`, "DELETE", "Imagem removida.").catch((error) => toast.error(error.message)); }}><Trash2 className="h-3.5 w-3.5" /> Remover</Button>
      </div>
    </article>
  );
}
