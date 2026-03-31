export interface CepAddress {
  cep: string;
  neighborhood: string;
  city: string;
  street: string;
  state: string;
}

interface ViaCepResponse {
  bairro?: string;
  cep?: string;
  erro?: boolean;
  localidade?: string;
  logradouro?: string;
  uf?: string;
}

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string) {
  const digits = normalizeCep(value);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function hasValidCep(value: string) {
  return normalizeCep(value).length === 8;
}

export async function lookupCepAddress(cep: string, signal?: AbortSignal): Promise<CepAddress> {
  const normalizedCep = normalizeCep(cep);

  if (normalizedCep.length !== 8) {
    throw new Error("CEP inválido.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, { signal });

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    cep: data.cep ?? formatCep(normalizedCep),
    neighborhood: data.bairro?.trim() ?? "",
    city: data.localidade?.trim() ?? "",
    street: data.logradouro?.trim() ?? "",
    state: data.uf?.trim() ?? "",
  };
}
