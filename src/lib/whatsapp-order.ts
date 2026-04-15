import { formatShippingFee } from "@/data/shipping";

export type PaymentMethod = "pix" | "card";

export interface WhatsAppOrderCustomer {
  name: string;
  phone: string;
  cep?: string;
  street?: string;
  neighborhood: string;
  city?: string;
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
  freight: number | null;
  finalTotal: number | null;
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
      return "CARTÃO";
    case "pix":
    default:
      return "PIX";
  }
}

function formatOrderTotal(value: number | null) {
  return value === null ? "Consultar valores" : formatCompactPrice(value);
}

export function buildWhatsAppOrderMessage({
  createdAt,
  customer,
  items,
  subtotal,
  freight,
  finalTotal,
}: BuildWhatsAppOrderMessageParams) {
  // Estrutura final enviada para o atendimento no WhatsApp.
  return [
    "#### NOVO PEDIDO ####",
    "",
    `Pedido: ${buildOrderNumber(createdAt)}`,
    "",
    `Cliente: *${formatCustomerName(customer.name)}*`,
    `Telefone: *${customer.phone.trim()}*`,
    "-------------------------------",
    customer.cep?.trim() ? `CEP: *${customer.cep.trim()}*` : "",
    customer.street?.trim() ? `Rua: *${customer.street.trim()}*` : "",
    `Bairro: *${customer.neighborhood.trim() || "Não informado"}*`,
    customer.addressDetails?.trim() ? `Número: *${customer.addressDetails.trim()}*` : "",
    customer.city?.trim() ? `Cidade: *${customer.city.trim()}*` : "",
    "",
    "------- ITENS DO PEDIDO -------",
    "",
    ...items.flatMap((item) => [
      `*${item.quantity} ${item.name}*`,
      item.flavor?.trim() ? `Sabor: *${item.flavor.trim()}*` : "",
      `Quantidade: *${item.quantity}*`,
      `Valor Unitário: ${formatCompactPrice(item.unitPrice)}`,
      `${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatCompactPrice(item.subtotal)}`,
      "",
    ]),
    "-------------------------------",
    "",
    `SUBTOTAL: ${formatCompactPrice(subtotal)}`,
    `FRETE: ${formatShippingFee(freight)}`,
    `*VALOR FINAL: ${formatOrderTotal(finalTotal)}*`,
    "-------------------------------",
    "",
    "PAGAMENTO:",
    "",
    finalTotal === null
      ? `*${getPaymentMethodLabel(customer.paymentMethod)}: valor final a confirmar*`
      : `*${getPaymentMethodLabel(customer.paymentMethod)}: ${formatCompactPrice(finalTotal)}*`,
  ]
    .filter(Boolean)
    .join("\n");
}
