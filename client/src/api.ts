import type {
  AuthResponse,
  Entry,
  EntryFilters,
  EntryInput,
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

function buildQuery(filters: EntryFilters): string {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.status) params.set('status', filters.status);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.q) params.set('q', filters.q);
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

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function fetchEntries(filters: EntryFilters): Promise<Entry[]> {
  return request<Entry[]>(`/api/entries${buildQuery(filters)}`);
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
