import type {
  AuthResponse,
  Entry,
  EntryFilters,
  EntryInput,
  PaginatedEntries,
  PublicSharePayload,
  SolutionLanguage,
  Stats,
  User,
} from './types';

const TOKEN_KEY = 'leetlog_token';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function buildQuery(
  filters: EntryFilters,
  pagination?: { page?: number; limit?: number }
): string {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.status) params.set('status', filters.status);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.language) params.set('language', filters.language);
  if (filters.q) params.set('q', filters.q);
  if (pagination?.page) params.set('page', String(pagination.page));
  if (pagination?.limit) params.set('limit', String(pagination.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl(url), {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/api/auth/me');
}

export function ensureShareLink(): Promise<{ user: User }> {
  return request<{ user: User }>('/api/auth/share-link', { method: 'POST' });
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchEntries(
  filters: EntryFilters,
  pagination: { page: number; limit?: number } = { page: 1, limit: 10 }
): Promise<PaginatedEntries> {
  const limit = pagination.limit ?? 10;
  const page = Math.max(1, pagination.page);
  const data = await request<PaginatedEntries | Entry[]>(
    `/api/entries${buildQuery(filters, { page, limit })}`
  );

  // Compat: older API returned a raw array (e.g. undeployed Vercel).
  if (Array.isArray(data)) {
    const filtered = filters.language
      ? data.filter((entry) => {
          const langs =
            entry.languages?.length
              ? entry.languages
              : (entry.solutions ?? []).map((sol) => sol.language);
          return langs.includes(filters.language as SolutionLanguage);
        })
      : data;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }

  return data;
}

export function fetchStats(): Promise<Stats> {
  return request<Stats>('/api/stats');
}

export function createEntry(data: EntryInput): Promise<Entry> {
  return request<Entry>('/api/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateEntry(id: string, data: EntryInput): Promise<Entry> {
  return request<Entry>(`/api/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteEntry(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/entries/${id}`, { method: 'DELETE' });
}

export function fetchPublicShare(
  slug: string,
  pagination: { page?: number; limit?: number } = {}
): Promise<PublicSharePayload> {
  const params = new URLSearchParams();
  if (pagination.page) params.set('page', String(pagination.page));
  if (pagination.limit) params.set('limit', String(pagination.limit));
  const qs = params.toString();
  return request<PublicSharePayload>(
    `/api/public/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`
  );
}

export function shareUrlForSlug(slug: string): string {
  const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
  return `${base}#/u/${encodeURIComponent(slug)}`;
}
