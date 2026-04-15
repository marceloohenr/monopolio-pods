import { formatPrice } from "@/data/products";

export interface ShippingArea {
  name: string;
  fee: number | null;
  neighborhoods?: string[];
  cities?: string[];
}

export const DEFAULT_OTHER_NEIGHBORHOODS_RATE: number | null = null;

export const defaultShippingArea: ShippingArea = {
  name: "Consultar valores",
  fee: DEFAULT_OTHER_NEIGHBORHOODS_RATE,
};

export const shippingAreas: ShippingArea[] = [
  {
    name: "Zona Norte do Recife",
    fee: 0,
    neighborhoods: [
      "Água Fria",
      "Alto Santa Terezinha",
      "Arruda",
      "Beberibe",
      "Bomba do Hemeterio",
      "Cajueiro",
      "Campina do Barreto",
      "Campo Grande",
      "Dois Unidos",
      "Encruzilhada",
      "Fundao",
      "Hipodromo",
      "Linha do Tiro",
      "Peixinhos",
      "Ponto de Parada",
      "Porto da Madeira",
      "Rosarinho",
      "Torreao",
      "Aflitos",
      "Alto do Mandu",
      "Alto Jose Bonifacio",
      "Alto Jose do Pinho",
      "Apipucos",
      "Brejo da Guabiraba",
      "Brejo de Beberibe",
      "Casa Amarela",
      "Casa Forte",
      "Corrego do Jenipapo",
      "Derby",
      "Dois Irmaos",
      "Espinheiro",
      "Gracas",
      "Guabiraba",
      "Jaqueira",
      "Macaxeira",
      "Mangabeira",
      "Monteiro",
      "Morro da Conceicao",
      "Nova Descoberta",
      "Parnamirim",
      "Passarinho",
      "Pau-Ferro",
      "Poco da Panela",
      "Santana",
      "Sitio dos Pintos",
      "Tamarineira",
      "Vasco da Gama",
    ],
  },
  {
    name: "Zona Sul do Recife",
    fee: 5,
    neighborhoods: ["Boa Viagem", "Brasilia Teimosa", "Cohab", "Ibura", "Imbiribeira", "Ipsep", "Jordao", "Pina"],
  },
  {
    name: "Olinda",
    fee: 0,
    cities: ["Olinda"],
  },
];

export const shippingNeighborhoodOptions = [...shippingAreas, defaultShippingArea].map((area) => ({
  name: area.name,
  fee: area.fee,
}));

function normalizeShippingKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesAny(values: string[] | undefined, target: string) {
  if (!values?.length || !target) return false;
  const normalizedTarget = normalizeShippingKey(target);
  return values.some((value) => normalizeShippingKey(value) === normalizedTarget);
}

function matchesArea(area: ShippingArea, target: string) {
  return (
    normalizeShippingKey(area.name) === normalizeShippingKey(target) ||
    matchesAny(area.neighborhoods, target) ||
    matchesAny(area.cities, target)
  );
}

export function getShippingAreaByName(name: string) {
  return shippingAreas.find((area) => matchesArea(area, name)) ?? null;
}

export function findShippingAreaByLocation({
  neighborhood,
  city,
}: {
  neighborhood?: string;
  city?: string;
}) {
  return (
    shippingAreas.find(
      (area) => matchesAny(area.neighborhoods, neighborhood ?? "") || matchesAny(area.cities, city ?? ""),
    ) ?? defaultShippingArea
  );
}

export function getShippingFeeByNeighborhood(neighborhood: string) {
  return getShippingAreaByName(neighborhood)?.fee ?? defaultShippingArea.fee;
}

export function getShippingFeeByLocation({
  neighborhood,
  city,
}: {
  neighborhood?: string;
  city?: string;
}) {
  return findShippingAreaByLocation({ neighborhood, city }).fee;
}

export function formatShippingFee(value: number | null) {
  if (value === null) return "Consultar valores";
  return value === 0 ? "Frete grátis" : formatPrice(value).replace(/\u00A0/g, " ");
}



