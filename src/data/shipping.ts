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
    name: "Região Central do Recife",
    fee: 0,
    neighborhoods: [
      "Bairro do Recife",
      "Boa Vista",
      "Cabanga",
      "Coelhos",
      "Ilha do Leite",
      "Ilha Joana Bezerra",
      "Paissandu",
      "Santo Amaro",
      "Santo Antonio",
      "São José",
      "Soledade",
    ],
  },
  {
    name: "Zona Oeste do Recife",
    fee: 0,
    neighborhoods: [
      "Caxanga",
      "Cidade Universitaria",
      "Cordeiro",
      "Engenho do Meio",
      "Ilha do Retiro",
      "Iputinga",
      "Madalena",
      "Prado",
      "Torre",
      "Torroes",
      "Varzea",
      "Zumbi",
    ],
  },
  {
    name: "Região Sudoeste do Recife",
    fee: 5,
    neighborhoods: [
      "Afogados",
      "Areias",
      "Barro",
      "Bongi",
      "Cacote",
      "Coqueiral",
      "Curado",
      "Estancia",
      "Jardim São Paulo",
      "Jiquia",
      "Mangueira",
      "Mustardinha",
      "San Martin",
      "Sancho",
      "Tejipio",
      "Toto",
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
  {
    name: "Jaboatão - Faixa 10",
    fee: 10,
    neighborhoods: ["Piedade", "Jardim Jordao"],
    cities: ["Jaboatão dos Guararapes"],
  },
  {
    name: "Jaboatão - Faixa 15",
    fee: 15,
    neighborhoods: [
      "Prazeres",
      "Candeias",
      "Cavaleiro",
      "Cajueiro Seco",
      "Curado",
      "Barra de Jangada",
      "Jaboatao Centro",
      "Muribeca",
    ],
    cities: ["Jaboatão dos Guararapes"],
  },
  {
    name: "Cabo de Santo Agostinho",
    fee: 25,
    cities: ["Cabo de Santo Agostinho"],
  },
  {
    name: "São Lourenço da Mata",
    fee: 20,
    cities: ["São Lourenço da Mata"],
  },
  {
    name: "Paulista - Faixa 5",
    fee: 5,
    neighborhoods: [
      "Vila Torres Galvao",
      "Jardim Maranguape",
      "Arthur Lundgren I",
      "Arthur Lundgren II",
      "Arthur Lundgren",
      "Centro",
      "Paulista Centro",
      "Paratibe",
      "Maranguape I",
      "Maranguape II",
    ],
    cities: ["Paulista"],
  },
  {
    name: "Paulista - Faixa 10",
    fee: 10,
    neighborhoods: ["Pau Amarelo", "Janga", "Nossa Senhora da Conceição", "Conceição"],
    cities: ["Paulista"],
  },
  {
    name: "Paulista - Faixa 20",
    fee: 20,
    neighborhoods: ["Maria Farinha"],
    cities: ["Paulista"],
  },
  {
    name: "Abreu e Lima",
    fee: 20,
    cities: ["Abreu e Lima"],
  },
  {
    name: "Igarassu",
    fee: 25,
    cities: ["Igarassu"],
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
  const neighborhoodValue = neighborhood ?? "";
  const cityValue = city ?? "";

  const cityAndNeighborhoodMatch = shippingAreas.find((area) => {
    if (!matchesAny(area.cities, cityValue)) return false;
    return area.neighborhoods?.length ? matchesAny(area.neighborhoods, neighborhoodValue) : true;
  });

  if (cityAndNeighborhoodMatch) return cityAndNeighborhoodMatch;

  const neighborhoodOnlyMatch = shippingAreas.find(
    (area) => !area.cities?.length && matchesAny(area.neighborhoods, neighborhoodValue),
  );

  if (neighborhoodOnlyMatch) return neighborhoodOnlyMatch;

  return shippingAreas.find((area) => matchesAny(area.cities, cityValue)) ?? defaultShippingArea;
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
