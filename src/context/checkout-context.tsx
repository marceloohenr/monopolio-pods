import * as React from "react";
import { type Product, WHATSAPP_NUMBER, products } from "@/data/products";
import { getShippingFeeByLocation } from "@/data/shipping";
import { type PaymentMethod, buildWhatsAppOrderMessage } from "@/lib/whatsapp-order";

export interface CheckoutItem {
  id: string;
  productId: string;
  flavor: string;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  addressDetails: string;
  paymentMethod: PaymentMethod;
}

interface CheckoutContextValue {
  isOpen: boolean;
  items: CheckoutItem[];
  customer: CustomerDetails;
  itemCount: number;
  subtotal: number;
  freight: number | null;
  finalTotal: number | null;
  canSubmit: boolean;
  openCheckout: (product?: Product, options?: { flavor?: string; quantity?: number }) => void;
  closeCheckout: () => void;
  addProduct: (product: Product, options?: { flavor?: string; quantity?: number }) => void;
  updateItemFlavor: (itemId: string, flavor: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCustomerField: (field: keyof CustomerDetails, value: string) => void;
  submitCheckout: () => void;
}

const CHECKOUT_ITEMS_KEY = "monopolio-checkout-items";
const CHECKOUT_CUSTOMER_KEY = "monopolio-checkout-customer";
const defaultCustomerDetails: CustomerDetails = {
  name: "",
  phone: "",
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  addressDetails: "",
  paymentMethod: "pix",
};

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDefaultFlavor(product: Product) {
  return product.variations.find((variation) => variation.inStock)?.name ?? product.variations[0]?.name ?? "";
}

function normalizeCustomerDetails(value: Partial<CustomerDetails> | null | undefined): CustomerDetails {
  const paymentMethod = value?.paymentMethod === "card" ? "card" : "pix";

  return {
    ...defaultCustomerDetails,
    ...value,
    paymentMethod,
  };
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function hasValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}

function hasShippingLocation(customer: CustomerDetails) {
  return customer.city.trim().length > 0 && customer.neighborhood.trim().length > 0;
}

function hasCompleteAddress(customer: CustomerDetails) {
  return customer.street.trim().length > 0 && hasShippingLocation(customer);
}

function getCheckoutSummary(items: CheckoutItem[]) {
  const validItems = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) return null;

      const unitPrice = product.promoPrice ?? product.price;
      const itemSubtotal = unitPrice * item.quantity;

      return {
        item,
        product,
        unitPrice,
        itemSubtotal,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        item: CheckoutItem;
        product: Product;
        unitPrice: number;
        itemSubtotal: number;
      } => Boolean(entry),
    );

  const subtotal = validItems.reduce((acc, entry) => acc + entry.itemSubtotal, 0);

  return {
    items: validItems.map(({ item, product, unitPrice, itemSubtotal }) => ({
      name: product.name,
      flavor: item.flavor,
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal,
    })),
    subtotal,
  };
}

function buildCheckoutUrl(items: CheckoutItem[], customer: CustomerDetails, createdAt = new Date()) {
  const summary = getCheckoutSummary(items);
  const freight = getShippingFeeByLocation({
    neighborhood: customer.neighborhood,
    city: customer.city,
  });
  const finalTotal = freight === null ? null : summary.subtotal + freight;
  const message = buildWhatsAppOrderMessage({
    createdAt,
    customer,
    items: summary.items,
    subtotal: summary.subtotal,
    freight,
    finalTotal,
  });

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState<CheckoutItem[]>(() => readStorage(CHECKOUT_ITEMS_KEY, []));
  const [customer, setCustomer] = React.useState<CustomerDetails>(() =>
    normalizeCustomerDetails(readStorage<Partial<CustomerDetails>>(CHECKOUT_CUSTOMER_KEY, defaultCustomerDetails)),
  );

  React.useEffect(() => {
    writeStorage(CHECKOUT_ITEMS_KEY, items);
  }, [items]);

  React.useEffect(() => {
    writeStorage(CHECKOUT_CUSTOMER_KEY, customer);
  }, [customer]);

  const addProduct = React.useCallback(
    (product: Product, options?: { flavor?: string; quantity?: number }) => {
      const flavor = options?.flavor?.trim() || getDefaultFlavor(product);
      const quantity = Math.max(1, options?.quantity ?? 1);

      setItems((current) => {
        const existing = current.find((entry) => entry.productId === product.id && entry.flavor === flavor);

        if (existing) {
          return current.map((entry) =>
            entry.id === existing.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
          );
        }

        return [
          ...current,
          {
            id: createItemId(),
            productId: product.id,
            flavor,
            quantity,
          },
        ];
      });
    },
    [],
  );

  const openCheckout = React.useCallback(
    (product?: Product, options?: { flavor?: string; quantity?: number }) => {
      if (product) {
        addProduct(product, options);
      }

      setIsOpen(true);
    },
    [addProduct],
  );

  const closeCheckout = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateItemFlavor = React.useCallback((itemId: string, flavor: string) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, flavor } : item)));
  }, []);

  const updateItemQuantity = React.useCallback((itemId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  }, []);

  const removeItem = React.useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const setCustomerField = React.useCallback((field: keyof CustomerDetails, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  }, []);

  const itemCount = React.useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return acc;

      const unitPrice = product.promoPrice ?? product.price;
      return acc + unitPrice * item.quantity;
    }, 0);
  }, [items]);

  const freight = React.useMemo(() => {
    if (!hasShippingLocation(customer)) return null;

    return getShippingFeeByLocation({
      neighborhood: customer.neighborhood,
      city: customer.city,
    });
  }, [customer.city, customer.neighborhood]);

  const finalTotal = React.useMemo(() => (freight === null ? null : subtotal + freight), [freight, subtotal]);

  const canSubmit = items.length > 0 && hasValidPhone(customer.phone) && hasCompleteAddress(customer);

  const submitCheckout = React.useCallback(() => {
    if (!canSubmit || typeof window === "undefined") return;

    const checkoutUrl = buildCheckoutUrl(items, customer, new Date());
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  }, [canSubmit, customer, items]);

  const value = React.useMemo<CheckoutContextValue>(
    () => ({
      isOpen,
      items,
      customer,
      itemCount,
      subtotal,
      freight,
      finalTotal,
      canSubmit,
      openCheckout,
      closeCheckout,
      addProduct,
      updateItemFlavor,
      updateItemQuantity,
      removeItem,
      clearCart,
      setCustomerField,
      submitCheckout,
    }),
    [
      addProduct,
      canSubmit,
      clearCart,
      closeCheckout,
      customer,
      finalTotal,
      freight,
      isOpen,
      itemCount,
      items,
      openCheckout,
      removeItem,
      setCustomerField,
      submitCheckout,
      subtotal,
      updateItemFlavor,
      updateItemQuantity,
    ],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const context = React.useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider.");
  }

  return context;
}
