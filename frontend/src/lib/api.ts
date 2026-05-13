import type {
  DashboardOrderResponse,
  DashboardSummaryResponse,
  ManagerChatResponse,
  CustomerChatResponse,
  CustomerSessionSummary,
  ChatMessageItem,
  ProductResponse,
  StockPredictionResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_STORAGE_KEY = "koopai_token";
const BUSINESS_NAME_KEY = "koopai_business_name";
const BUSINESS_ID_KEY = "koopai_business_id";
const CHAT_SLUG_KEY = "koopai_chat_slug";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10000);

let tokenCache: string | null = null;

interface LoginResponse {
  access_token: string;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // Ignore parsing errors and use fallback below.
  }
  return `API hatası (${response.status})`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function requestWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated. Please login.");

  const call = async (bearer: string) => {
    try {
      return await requestWithTimeout(
        `${API_BASE_URL}${path}`,
        {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
            Authorization: `Bearer ${bearer}`,
          },
        },
        REQUEST_TIMEOUT_MS
      );
    } catch (error) {
      if (isAbortError(error)) {
        throw new Error("İstek zaman aşımına uğradı. Sunucu yanıtı gecikiyor.");
      }
      throw new Error("Ağ hatası: API sunucusuna erişilemiyor.");
    }
  };

  let response = await call(token!);

  if (response.status === 401) {
    // token invalid -> clear
    tokenCache = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(BUSINESS_NAME_KEY);
      window.localStorage.removeItem(BUSINESS_ID_KEY);
      window.localStorage.removeItem(CHAT_SLUG_KEY);
    }
    throw new Error("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<T>;
}

export function getDashboardSummary() {
  return authFetch<DashboardSummaryResponse>("/dashboard/");
}

export function getDashboardOrders() {
  return authFetch<DashboardOrderResponse[]>("/dashboard/orders");
}

export function getDashboardProducts() {
  return authFetch<ProductResponse[]>("/dashboard/products");
}

export function updateOrderStatus(orderId: number, status: string) {
  return authFetch<{ message: string; status: string }>(`/dashboard/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function updateProductStock(productId: number, newStock: number) {
  return authFetch<{ message: string; new_stock: number; status: string }>(`/dashboard/products/${productId}/stock`, {
    method: "PUT",
    body: JSON.stringify({ new_stock: newStock }),
  });
}

export function predictStockout(productName: string) {
  return authFetch<StockPredictionResponse>(`/dashboard/predict/${encodeURIComponent(productName)}`);
}

export function managerChat(sessionId: string, message: string) {
  return authFetch<ManagerChatResponse>("/chat/manager", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export function managerAskAI(sessionId: string, message: string) {
  return authFetch<ManagerChatResponse>("/chat/manager/ask-ai", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export function managerToCustomer(sessionId: string, message: string) {
  return authFetch<{ status: string; session_id: string }>(`/chat/manager/customer/${encodeURIComponent(sessionId)}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function loginBusiness(email: string, password: string) {
  const response = await requestWithTimeout(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) throw new Error(await parseError(response));
  const data: any = await response.json();
  // save token and business info
  tokenCache = data.access_token;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    if (data.business_name) window.localStorage.setItem(BUSINESS_NAME_KEY, data.business_name);
    if (data.business_id) window.localStorage.setItem(BUSINESS_ID_KEY, data.business_id);
    if (data.chat_slug) window.localStorage.setItem(CHAT_SLUG_KEY, data.chat_slug);
  }
  return data;
}

export async function registerBusiness(name: string, email: string, password: string) {
  const response = await requestWithTimeout(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) throw new Error(await parseError(response));
  const data: any = await response.json();
  tokenCache = data.access_token;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    if (data.business_name) window.localStorage.setItem(BUSINESS_NAME_KEY, data.business_name);
    if (data.business_id) window.localStorage.setItem(BUSINESS_ID_KEY, data.business_id);
    if (data.chat_slug) window.localStorage.setItem(CHAT_SLUG_KEY, data.chat_slug);
  }
  return data;
}

export function logout() {
  tokenCache = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(BUSINESS_NAME_KEY);
    window.localStorage.removeItem(BUSINESS_ID_KEY);
    window.localStorage.removeItem(CHAT_SLUG_KEY);
    window.location.reload();
  }
}

export function getStoredToken(): string | null {
  if (tokenCache) return tokenCache;
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) tokenCache = token;
  return token;
}

export async function customerChat(
  slug: string,
  sessionId: string,
  message: string,
  customerName: string | undefined
) {
  const path = `${API_BASE_URL}/chat/customer/${encodeURIComponent(slug)}`;
  let response: Response;
  try {
    response = await requestWithTimeout(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionId, customer_name: customerName ?? "Müşteri" }),
      },
      REQUEST_TIMEOUT_MS
    );
  } catch (error) {
    if (isAbortError(error)) throw new Error("İstek zaman aşımına uğradı. Sunucu yanıtı gecikiyor.");
    throw new Error("Ağ hatası: API sunucusuna erişilemiyor.");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CustomerChatResponse;
}

export async function getCustomerChatHistory(slug: string, sessionId: string) {
  const path = `${API_BASE_URL}/chat/customer/${encodeURIComponent(slug)}/sessions/${encodeURIComponent(sessionId)}/messages`;
  let response: Response;
  try {
    response = await requestWithTimeout(
      path,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      REQUEST_TIMEOUT_MS
    );
  } catch (error) {
    if (isAbortError(error)) throw new Error("İstek zaman aşımına uğradı. Sunucu yanıtı gecikiyor.");
    throw new Error("Ağ hatası: API sunucusuna erişilemiyor.");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as { sender_type: string; content: string; message_type?: string; created_at: string }[];
}

export function getCustomerSessions() {
  return authFetch<CustomerSessionSummary[]>("/chat/sessions");
}

export function getSessionMessages(sessionId: string) {
  return authFetch<{ sender_type: string; content: string; created_at: string }[]>(`/chat/sessions/${encodeURIComponent(
    sessionId
  )}/messages`);
}

export function bulkNotify(orderIds: number[], messageType: string) {
  return authFetch<{ sent_count: number; messages: Array<{ order_id: number; customer: string; message: string }> }>(`/dashboard/notify`, {
    method: "POST",
    body: JSON.stringify({ order_ids: orderIds, message_type: messageType }),
  });
}

export function getProfile() {
  return authFetch<any>("/business/me");
}
