// Merkezi veritabanı tip tanımları – multi-tenant yapı

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN", // Otel Müdürü
  MANAGER = "MANAGER", // Bölüm Müdürü
  RECEPTION = "RECEPTION",
  HOUSEKEEPING = "HOUSEKEEPING",
  FINANCE = "FINANCE",
  PERSONEL = "PERSONEL",
  NIGHT_AUDIT = "NIGHT_AUDIT",
  DOKTOR = "DOKTOR", // Legacy suport
  SEKRETER = "SEKRETER", // Legacy support
}

export const USER_ROLES = Object.values(UserRole);

export type ReservationStatus =
  | "inquiry"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export type RoomStatus =
  | "DIRTY"
  | "CLEANING"
  | "CLEAN"
  | "INSPECTED"
  | "OOO"
  | "OCCUPIED";

export type ReservationChannel = "whatsapp" | "web" | "phone" | "walk_in";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface DaySchedule {
  open: string;   // "09:00"
  close: string;  // "19:00"
  enabled: boolean;
}

export type WorkingHours = Record<DayOfWeek, DaySchedule>;

export interface SubscriptionPlanFeatures {
  description?: string;
  duration_days?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  features: SubscriptionPlanFeatures;
  monthly_price: number;
  max_doctors: number;
  max_staff: number;
  monthly_credits: number;
  has_ai_features: boolean;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  working_hours: WorkingHours;
  working_hours_overrides?: unknown[];
  check_in_time: string;
  check_out_time: string;
  default_currency: string;
  plan_id: string | null;
  credits: number;
  trial_ends_at: string | null;
  automations_enabled?: boolean;
  n8n_workflow_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  hotel_id: string | null; // SUPER_ADMIN için null
  full_name: string | null;
  phone: string | null;
  email?: string | null;
  role: UserRole;
  department?: string | null;
  is_active: boolean;
  financial_limit?: number | null;
  max_refund_amount?: number | null;
  max_discount_percentage?: number | null;
  shift_assignment?: string | null;
  two_factor_enabled?: boolean;
  ip_restriction?: string | null;
  last_login?: string | null;
  last_action?: string | null;
  total_actions_count?: number;
  created_at: string;
}


export interface BoardType {
  id: string;
  hotel_id: string;
  name: string;
  code: string | null;
  description: string | null;
  meal_times: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  created_at: string;
}

export interface Guest {
  id: string;
  hotel_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  identity_no: string | null;
  passport_number: string | null;
  preferences_note: string | null;
  allergies: string | null;
  nationality: string | null;
  id_type: 'TC' | 'PASSPORT' | string | null;
  is_vip: boolean;
  is_blacklist: boolean;
  blacklist_reason: string | null;
  marketing_consent: boolean;
  tags: string[];
  preferences: Record<string, any>;
  created_at: string;
}

export interface RoomType {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  base_price: number;
  capacity_adults: number;
  capacity_children: number;
  amenities?: string[];
  images?: string[];
  default_pax?: number;
  extra_bed_capability?: boolean;
  estimated_cleaning_time?: number; // Enterprise addition
  created_at: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_type_id: string;
  room_number: string;
  floor: string | null; // Floor name/number (text)
  status: RoomStatus;
  pax_limit?: number;
  notes: string | null;
  last_cleaned_at: string | null;
  created_at: string;
}


export interface Reservation {
  id: string;
  hotel_id: string;
  guest_id: string;
  room_type_id: string;
  room_id: string | null;
  assigned_staff_id: string | null;
  check_in_date: string;
  check_out_date: string;
  status: ReservationStatus;
  channel: ReservationChannel;
  source_id?: string | null; // Detailed booking source
  board_type: string | null;
  adults_count: number;
  children_count: number;
  estimated_amount: number | null;
  guest_note: string | null;
  internal_note: string | null;
  tags: string[] | null;
  source_conversation_id: string | null;
  source_message_id: string | null;
  created_at: string;
}

export interface BookingSource {
  id: string;
  hotel_id: string;
  name: string;
  created_at: string;
}

export interface RatePlan {
  id: string;
  hotel_id: string;
  room_type_id: string;
  name: string;
  currency: string;
  base_price: number;
  min_stay: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyPrice {
  id: string;
  hotel_id: string;
  rate_plan_id: string;
  room_type_id: string;
  date: string;
  price: number;
  created_at: string;
}

export interface RoomBlock {
  id: string;
  hotel_id: string;
  room_id: string;
  check_in_at: string;
  check_out_at: string;
  reason: string | null;
  block_type: "OOO" | "OOS";
  created_at: string;
}

export interface ProductCatalog {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  tax_rate: number;
  category: string | null;
  created_at: string;
}

export interface FolioItem {
  id: string;
  hotel_id: string;
  reservation_id: string;
  item_type: string;
  description: string | null;
  amount: number;
  created_at: string;
}

export interface HousekeepingTask {
  id: string;
  hotel_id: string;
  room_id: string;
  assigned_to: string | null;
  task_type: string;
  status: string; // "DIRTY", "CLEANING", "INSPECTION", "READY"
  priority_level: number;
  estimated_time: number;
  checkout_task: boolean;
  started_at: string | null;
  cleaning_started_at: string | null;
  cleaning_completed_at: string | null;
  cleaning_duration_minutes: number | null;
  inspection_passed_at: string | null;
  inspected_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface MaintenanceTicket {
  id: string;
  hotel_id: string;
  room_id: string;
  reported_by: string | null;
  category: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  created_at: string;
  updated_at: string;
}


