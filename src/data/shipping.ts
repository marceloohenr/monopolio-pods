import { formatPrice } from "@/data/products";

export interface ShippingArea {
  name: string;
  fee: number;
  neighborhoods?: string[];
  cities?: string[];
}

export const DEFAULT_OTHER_NEIGHBORHOODS_RATE = 10;

export const defaultShippingArea: ShippingArea = {
  name: "Outros bairros",
  fee: DEFAULT_OTHER_NEIGHBORHOODS_RATE,
};

export const shippingAreas: ShippingArea[] = [
  {
    name: "Boa Viagem",
    fee: 5,
    neighborhoods: ["Boa Viagem"],
  },
  {
    name: "Olinda",
    fee: 0,
    cities: ["Olinda"],
  },
  {
    name: "Jaqueira",
    fee: 0,
    neighborhoods: ["Jaqueira"],
  },
  {
    name: "Casa Forte",
    fee: 0,
    neighborhoods: ["Casa Forte"],
  },
  {
    name: "Rosarinho",
    fee: 0,
    neighborhoods: ["Rosarinho"],
  },
  {
    name: "Várzea",
    fee: 5,
    neighborhoods: ["Várzea", "Varzea"],
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

export function getShippingAreaByName(name: string) {
  return shippingAreas.find((area) => normalizeShippingKey(area.name) === normalizeShippingKey(name)) ?? null;
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

export function formatShippingFee(value: number) {
  return value === 0 ? "Frete grátis" : formatPrice(value).replace(/\u00A0/g, " ");
}
