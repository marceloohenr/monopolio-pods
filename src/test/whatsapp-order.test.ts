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

  it("builds the whatsapp message with phone, city, neighborhood, freight and total", () => {
    const createdAt = new Date(2026, 1, 21, 19, 20);
    const message = buildWhatsAppOrderMessage({
      createdAt,
      customer: {
        name: "",
        phone: "(81) 98725-8754",
        cep: "51020-001",
        street: "Avenida Boa Viagem",
        city: "Recife",
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
    expect(message).toContain("Pedido: 2102261920");
    expect(message).toContain("Cliente: Cliente do catalogo");
    expect(message).toContain("Telefone: (81) 98725-8754");
    expect(message).toContain("CEP: 51020-001");
    expect(message).toContain("Rua: Avenida Boa Viagem");
    expect(message).toContain("Cidade: Recife");
    expect(message).toContain("Bairro: Boa Viagem");
    expect(message).toContain("Numero/Complemento: 123, apto 402");
    expect(message).toContain("1 Ignite V55");
    expect(message).toContain("Sabor: Icy Mint");
    expect(message).toContain("SUBTOTAL: R$95,00");
    expect(message).toContain("FRETE: R$ 5,00");
    expect(message).toContain("VALOR FINAL: R$100,00");
    expect(message).toContain("PAGAMENTO\nPix: R$100,00");
  });

  it("marks freight and total as consult when the region needs manual confirmation", () => {
    const message = buildWhatsAppOrderMessage({
      createdAt: new Date(2026, 1, 21, 19, 20),
      customer: {
        name: "Julio",
        phone: "(81) 99999-9999",
        cep: "50740-000",
        street: "Rua do Futuro",
        city: "Recife",
        neighborhood: "Afogados",
        paymentMethod: "card",
      },
      items: [
        {
          name: "Elfbar GH23K",
          quantity: 1,
          unitPrice: 145,
          subtotal: 145,
        },
      ],
      subtotal: 145,
      freight: null,
      finalTotal: null,
    });

    expect(message).toContain("Rua: Rua do Futuro");
    expect(message).toContain("FRETE: Consultar valores");
    expect(message).toContain("VALOR FINAL: Consultar valores");
    expect(message).toContain("PAGAMENTO\nCartao: valor final a confirmar");
  });
});
