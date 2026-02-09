import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from './supabase';
import type { Staff } from '../types/db';

export type AuthUser = {
  id: string;
  email?: string | null;
};

export async function getStaffForUser(
  supabase: SupabaseClient,
  clinicId: string,
  userId: string
): Promise<Staff | null> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as Staff) ?? null;
}

export async function requireStaffForClinic(
  clinicId: string,
  userId: string,
  requiredRoles: Array<Staff['role']> = ['admin']
): Promise<Staff> {
  const supabase = createServerSupabase();
  const staff = await getStaffForUser(supabase, clinicId, userId);
  if (!staff) throw new Error('User is not staff for this clinic');
  if (!requiredRoles.includes(staff.role)) throw new Error('Insufficient role');
  return staff;
}

export async function getUserFromAccessToken(
  accessToken: string
): Promise<AuthUser> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw error;
  if (!data.user) throw new Error('Invalid access token');
  return { id: data.user.id, email: data.user.email };
}
