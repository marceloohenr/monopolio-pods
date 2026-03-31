import { describe, expect, it } from "vitest";
import { formatCep, hasValidCep, normalizeCep } from "@/lib/cep";

describe("cep utils", () => {
  it("normalizes and formats the CEP mask", () => {
    expect(normalizeCep("51020-001")).toBe("51020001");
    expect(formatCep("51020001")).toBe("51020-001");
    expect(formatCep("51020")).toBe("51020");
  });

  it("validates complete CEP values", () => {
    expect(hasValidCep("51020-001")).toBe(true);
    expect(hasValidCep("51020-00")).toBe(false);
  });
});
