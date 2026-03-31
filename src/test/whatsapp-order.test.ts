import { describe, expect, it } from "vitest";
import {
  buildOrderNumber,
  buildWhatsAppOrderMessage,
  formatOrderTimestamp,
} from "@/lib/whatsapp-order";

describe("whatsapp order formatting", () => {
  it("formats the order metadata from the current date", () => {
    const createdAt = new Date(2026, 1, 21, 19, 20);

    expect(buildOrderNumber(createdAt)).toBe("2102261920");
    expect(formatOrderTimestamp(createdAt)).toBe("21/02/2026 19:20");
  });

  it("builds the whatsapp message with phone, neighborhood, freight and total", () => {
    const createdAt = new Date(2026, 1, 21, 19, 20);
    const message = buildWhatsAppOrderMessage({
      createdAt,
      customer: {
        name: "",
        phone: "(81) 98725-8754",
        cep: "51020-001",
        neighborhood: "Boa Viagem",
        addressDetails: "123, apto 402",
        paymentMethod: "pix",
      },
      items: [
        {
          name: "Ignite V55",
          flavor: "Icy Mint",
          quantity: 1,
          unitPrice: 95,
          subtotal: 95,
        },
      ],
      subtotal: 95,
      freight: 5,
      finalTotal: 100,
    });

    expect(message).toContain("#### NOVO PEDIDO ####");
    expect(message).toContain("#️⃣   Nº pedido: 2102261920");
    expect(message).toContain("👤   Cliente do catálogo");
    expect(message).toContain("📞   (81) 98725-8754");
    expect(message).toContain("📮   CEP: 51020-001");
    expect(message).toContain("📍   Bairro: Boa Viagem");
    expect(message).toContain("🏠   Número/Complemento: 123, apto 402");
    expect(message).toContain("1 Ignite V55");
    expect(message).toContain("Sabor: Icy Mint");
    expect(message).toContain("💳 SUBTOTAL: R$95,00");
    expect(message).toContain("🚚 FRETE: R$ 5,00");
    expect(message).toContain("VALOR FINAL: R$100,00");
    expect(message).toContain("PAGAMENTO\nPix: R$100,00");
  });
});
