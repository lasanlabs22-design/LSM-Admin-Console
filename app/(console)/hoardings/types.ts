/** A hoarding as the backend returns it */
export type AdminHoarding = {
  id: string;
  title: string;
  media_type: string;
  city: string;
  area: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  width_ft: number | null;
  height_ft: number | null;
  illumination: string | null;
  facing: string | null;
  traffic: string | null;
  price_per_month: number | null;
  min_months: number | null;
  availability: 'available' | 'booked';
  /** YYYY-MM-DD */
  available_from: string | null;
  photos: string[];
  description: string | null;
  status: 'live' | 'hidden';
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HoardingStats = {
  total: number;
  live: number;
  available: number;
  cities: number;
};

/** The choices the form offers; the backend accepts any short text */
export const MEDIA_TYPES = [
  'Billboard',
  'Unipole',
  'Gantry',
  'Bus Shelter',
  'LED Screen',
  'Pole Kiosk',
  'Wall Wrap',
  'Other',
];

export const ILLUMINATION = ['Front-lit', 'Back-lit', 'Non-lit', 'Digital'];

/** ₹1,25,000 — Indian grouping */
export function rupees(n: number | null | undefined): string {
  if (n == null) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

export function sizeLabel(h: Pick<AdminHoarding, 'width_ft' | 'height_ft'>) {
  if (!h.width_ft || !h.height_ft) return null;
  return `${h.width_ft} × ${h.height_ft} ft`;
}
