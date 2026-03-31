export interface Testimonial {
  id: string;
  name: string;
  text: string;
  proofLink: string;
  photoUrl?: string;
}

export const TESTIMONIALS_STORAGE_KEY = "monopolio-testimonials";
export const TESTIMONIALS_EVENT = "monopolio-testimonials-updated";

export const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rafael M.",
    text: "Chegou rápido e o sabor veio certinho. Atendimento muito bom no WhatsApp.",
    proofLink: "https://wa.me/5581987258754",
  },
  {
    id: "2",
    name: "Larissa S.",
    text: "Comprei dois pods, veio tudo certo e a garantia foi explicada direitinho.",
    proofLink: "https://instagram.com/cliente.monopolio",
  },
  {
    id: "3",
    name: "Caio P.",
    text: "Pedido simples, entrega sem enrolação e produto original.",
    proofLink: "https://wa.me/5581987258754",
  },
];

export function loadTestimonials() {
  if (typeof window === "undefined") return defaultTestimonials;

  try {
    const raw = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);

    if (!raw) return defaultTestimonials;

    const parsed = JSON.parse(raw) as Testimonial[];
    return parsed.length > 0 ? parsed : defaultTestimonials;
  } catch {
    return defaultTestimonials;
  }
}

export function saveTestimonials(items: Testimonial[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(TESTIMONIALS_EVENT));
}

export function getProofLabel(link: string) {
  const lower = link.toLowerCase();

  if (lower.includes("instagram")) return "Instagram";
  if (lower.includes("wa.me") || lower.includes("whatsapp")) return "WhatsApp";

  return "Prova social";
}
