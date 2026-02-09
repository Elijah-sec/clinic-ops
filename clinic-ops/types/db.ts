export type AppointmentStatus = "scheduled" | "completed" | "no_show" | "cancelled";

export interface Clinic {
  id: string;
  name: string;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  phone: string;
  notes?: string | null;
  internal_remarks?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export type StaffRole = "admin" | "reception" | "clinician";

export interface Staff {
  id: string;
  clinic_id: string;
  user_id: string; // Supabase Auth UID
  full_name: string;
  role: StaffRole;
  phone?: string | null;
  created_at: string;
  updated_at?: string | null;
}
