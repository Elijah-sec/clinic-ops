-- Initial schema for clinic-ops
-- Enables pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  full_name text not null,
  phone text not null,
  notes text,
  internal_remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Appointment status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('scheduled','completed','no_show','cancelled');
  END IF;
END$$;

create table appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  scheduled_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on patients (clinic_id);
create index on appointments (clinic_id, scheduled_at);
