/**
 * The shapes the backend returns. Kept apart from lib/api.ts so client
 * components can use them without pulling in server-only code.
 */

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

/** The partner currently holding a request, as shown on the request */
export type RequestAssignment = {
  id: string;
  status: string;
  company_name: string | null;
  partner_name: string;
  partner_phone: string | null;
  decline_reason: string | null;
  verdict: string | null;
  comment: string | null;
};

export type AdminRequest = {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  details: Record<string, unknown> | null;
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
  assignment?: RequestAssignment | null;
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
  photo_url: string | null;
  logo_url: string | null;
};

/* ---------- Assigning work to partners ---------- */

export type Vendor = {
  id: string;
  name: string;
  company_name: string | null;
  role: string | null;
  phone: string;
  city: string | null;
  services: string[] | null;
  skills: string[] | null;
  rate_card: string | null;
  offers_this: boolean;
  active_jobs: number;
  rated_jobs: number;
  good_jobs: number;
};

export type OfferedAssignment = {
  id: string;
  status: string;
  name: string;
  company_name: string | null;
  phone: string;
  decline_reason: string | null;
};

export type AssignData = {
  request: { title: string | null; customer_city: string | null } | null;
  service: string | null;
  pickedNames: string[];
  vendors: Vendor[];
  assignments: OfferedAssignment[];
};

/* ---------- Work out with partners ---------- */

export type WorkItem = {
  id: string;
  status: string;
  request_id: string;
  title: string | null;
  details: { service?: string } | null;
  customer_name: string;
  customer_city: string | null;
  customer_phone: string;
  partner_name: string;
  partner_role: string | null;
  partner_photo: string | null;
  partner_phone: string;
  company_name: string | null;
  assigned_at: string;
  verdict: string | null;
  comment: string | null;
};

export type WorkStats = {
  offered: number;
  accepted: number;
  in_progress: number;
  completed: number;
};

/* ---------- Vibes posting access ---------- */

export type AccessPerson = {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  company_name: string | null;
  city: string | null;
  reels_posted: number;
  vibes_reason: string | null;
  vibes_requested_at: string;
};
