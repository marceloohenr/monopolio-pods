import { describe, expect, it } from "vitest";
import {
  DEFAULT_OTHER_NEIGHBORHOODS_RATE,
  defaultShippingArea,
  findShippingAreaByLocation,
  formatShippingFee,
  getShippingFeeByLocation,
  getShippingFeeByNeighborhood,
} from "@/data/shipping";

describe("shipping config", () => {
  it("returns the configured fee for known neighborhoods and cities", () => {
    expect(getShippingFeeByNeighborhood("Aflitos")).toBe(0);
    expect(getShippingFeeByNeighborhood("Campo Grande")).toBe(0);
    expect(getShippingFeeByNeighborhood("Jaqueira")).toBe(0);
    expect(getShippingFeeByNeighborhood("Casa Forte")).toBe(0);
    expect(getShippingFeeByNeighborhood("Boa Viagem")).toBe(5);
    expect(getShippingFeeByNeighborhood("Pina")).toBe(5);
    expect(getShippingFeeByNeighborhood("Brasilia Teimosa")).toBe(5);
    expect(getShippingFeeByNeighborhood("Cohab")).toBe(5);
    expect(getShippingFeeByNeighborhood("Olinda")).toBe(0);
  });

  it("falls back to consult values for other neighborhoods", () => {
    expect(getShippingFeeByNeighborhood(defaultShippingArea.name)).toBe(DEFAULT_OTHER_NEIGHBORHOODS_RATE);
    expect(getShippingFeeByNeighborhood("Bairro não mapeado")).toBe(DEFAULT_OTHER_NEIGHBORHOODS_RATE);
  });

  it("matches configured áreas from neighborhood or city", () => {
    expect(findShippingAreaByLocation({ neighborhood: "Campo Grande", city: "Recife" }).name).toBe("Zona Norte do Recife");
    expect(findShippingAreaByLocation({ neighborhood: "Boa Viagem", city: "Recife" }).name).toBe("Zona Sul do Recife");
    expect(findShippingAreaByLocation({ city: "Olinda" }).name).toBe("Olinda");
    expect(findShippingAreaByLocation({ neighborhood: "Bairro não mapeado", city: "Recife" }).name).toBe(
      defaultShippingArea.name,
    );
    expect(getShippingFeeByLocation({ neighborhood: "Bairro não mapeado", city: "Olinda" })).toBe(0);
  });

  it("formats free and paid shipping labels", () => {
    expect(formatShippingFee(null)).toBe("Consultar valores");
    expect(formatShippingFee(0)).toBe("Frete grátis");
    expect(formatShippingFee(5)).toBe("R$ 5,00");
  });
});

