-- Add staff table and role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE staff_role AS ENUM ('admin','reception','clinician');
  END IF;
END$$;

create table staff (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid not null,
  full_name text not null,
  role staff_role not null default 'reception',
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on staff (clinic_id);
create unique index if not exists staff_unique_user_per_clinic on staff (clinic_id, user_id);
