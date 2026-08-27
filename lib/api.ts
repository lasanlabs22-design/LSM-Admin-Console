import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Calls the Lasan Mart backend with the admin key attached.
 * Runs on the server only — the password never reaches the browser.
 */
export async function adminFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const key = cookieStore.get('lsm_admin')?.value || '';

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': key,
      ...(options.headers || {}),
    },
    // Always fetch fresh — a dashboard showing stale leads is useless
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/* ---------- Types, matching what the backend returns ---------- */

export type Stats = {
  requests: {
    total: number;
    new: number;
    contacted: number;
    in_progress: number;
    closed: number;
    this_week: number;
  };
  contacts: { total: number; this_week: number };
  byType: { type: string; count: number }[];
  workload: { assigned_to: string; count: number }[];
};

export type AdminRequest = {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  details: Record<string, any> | null;
  status: string;
  assigned_to: string | null;
  assigned_at: string | null;
  internal_note: string | null;
  email_sent: boolean;
  created_at: string;
  updated_at?: string;
  contact_id: string;
  name: string;
  phone: string;
  email: string | null;
  company_name: string | null;
  company_description?: string | null;
  sector: string | null;
  city: string | null;
  contact_since?: string;
};

export type AdminContact = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company_name: string | null;
  sector: string | null;
  city: string | null;
  created_at: string;
  request_count: number;
  last_request_at: string | null;
};