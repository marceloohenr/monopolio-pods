import { formatShippingFee } from "@/data/shipping";

export type PaymentMethod = "pix" | "card";

export interface WhatsAppOrderCustomer {
  name: string;
  phone: string;
  cep?: string;
  neighborhood: string;
  addressDetails?: string;
  paymentMethod: PaymentMethod;
}

export interface WhatsAppOrderItem {
  name: string;
  flavor?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface BuildWhatsAppOrderMessageParams {
  createdAt: Date;
  customer: WhatsAppOrderCustomer;
  items: WhatsAppOrderItem[];
  subtotal: number;
  freight: number;
  finalTotal: number;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00A0/g, " ");
}

function formatCompactPrice(value: number) {
  return formatPrice(value).replace("R$ ", "R$");
}

function formatCustomerName(name: string) {
  const trimmedName = name.trim();
  return trimmedName || "Cliente do catálogo";
}

export function formatOrderTimestamp(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildOrderNumber(date: Date) {
  return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${String(date.getFullYear()).slice(-2)}${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function getPaymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "card":
      return "Cartão";
    case "pix":
    default:
      return "Pix";
  }
}

export function buildWhatsAppOrderMessage({
  createdAt,
  customer,
  items,
  subtotal,
  freight,
  finalTotal,
}: BuildWhatsAppOrderMessageParams) {
  return [
    "#### NOVO PEDIDO ####",
    "",
    `#️⃣   Nº pedido: ${buildOrderNumber(createdAt)}`,
    `feito em ${formatOrderTimestamp(createdAt)}`,
    "",
    `👤   ${formatCustomerName(customer.name)}`,
    `📞   ${customer.phone.trim()}`,
    customer.cep?.trim() ? `📮   CEP: ${customer.cep.trim()}` : "",
    `📍   Bairro: ${customer.neighborhood}`,
    customer.addressDetails?.trim() ? `🏠   Número/Complemento: ${customer.addressDetails.trim()}` : "",
    "",
    "------- ITENS DO PEDIDO -------",
    "",
    ...items.flatMap((item) => [
      `${item.quantity} ${item.name}`,
      item.flavor?.trim() ? `Sabor: ${item.flavor.trim()}` : "",
      `Quantidade: ${item.quantity}`,
      `Valor Unitario: ${formatCompactPrice(item.unitPrice)}`,
      `💵 ${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatCompactPrice(item.subtotal)}`,
      "",
    ]),
    "-------------------------------",
    "",
    `💳 SUBTOTAL: ${formatCompactPrice(subtotal)}`,
    `🚚 FRETE: ${formatShippingFee(freight)}`,
    `VALOR FINAL: ${formatCompactPrice(finalTotal)}`,
    "",
    "PAGAMENTO",
    `${getPaymentMethodLabel(customer.paymentMethod)}: ${formatCompactPrice(finalTotal)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
