import * as React from "react";
import { Trash2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loadTestimonials, saveTestimonials, type Testimonial } from "@/data/testimonials";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const AdminTestimonialsPage = () => {
  const [items, setItems] = React.useState<Testimonial[]>([]);
  const [name, setName] = React.useState("");
  const [text, setText] = React.useState("");
  const [proofLink, setProofLink] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");

  React.useEffect(() => {
    setItems(loadTestimonials());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !text.trim() || !proofLink.trim()) return;

    const nextItems = [
      {
        id: createId(),
        name: name.trim(),
        text: text.trim(),
        proofLink: proofLink.trim(),
        photoUrl: photoUrl || undefined,
      },
      ...items,
    ];

    setItems(nextItems);
    saveTestimonials(nextItems);
    setName("");
    setText("");
    setProofLink("");
    setPhotoUrl("");
  };

  const handleRemove = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    saveTestimonials(nextItems);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SeoHead title="Admin de depoimentos" description="Area administrativa local." path="/admin/depoimentos" noindex />

      <Header />

      <main className="container mx-auto max-w-5xl flex-1 space-y-6 py-4 md:py-6">
        <section className="px-4 md:px-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">Admin local</p>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Depoimentos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Os depoimentos cadastrados aqui ficam salvos neste navegador via localStorage.
          </p>
        </section>

        <div className="grid gap-4 px-4 md:grid-cols-[0.95fr_1.05fr] md:px-0">
          <section className="glass rounded-2xl p-4 md:p-5">
            <h2 className="font-display text-xl font-bold text-foreground">Novo depoimento</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do cliente" />
              <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Texto do depoimento" />
              <Input value={proofLink} onChange={(event) => setProofLink(event.target.value)} placeholder="Link do WhatsApp ou Instagram" />

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Foto opcional</label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {photoUrl && (
                  <img src={photoUrl} alt="Prévia do cliente" className="h-16 w-16 rounded-full object-cover" />
                )}
              </div>

              <Button type="submit" className="w-full">
                Salvar depoimento
              </Button>
            </form>
          </section>

          <section className="glass rounded-2xl p-4 md:p-5">
            <h2 className="font-display text-xl font-bold text-foreground">Cadastrados</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.proofLink}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminTestimonialsPage;
