let csrfToken = "";

export function setCsrfToken(value: string) {
  csrfToken = value;
}

export async function adminRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (options.method && !["GET", "HEAD"].includes(options.method.toUpperCase()) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(url, { ...options, headers, credentials: "same-origin" });
  if (response.status === 401) window.dispatchEvent(new Event("admin:unauthorized"));
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Não foi possível concluir a operação." }));
    throw new Error(body.message || "Não foi possível concluir a operação.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminBasePath = `/${window.location.pathname.split("/").filter(Boolean)[0] || ""}`;

