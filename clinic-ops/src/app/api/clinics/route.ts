import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabase';
import { getUserFromAccessToken, requireStaffForClinic } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await getUserFromAccessToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // allow any staff user to list clinics they belong to
    const supabase = createServerSupabase();
    const { data: staffData, error: staffErr } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id);
    if (staffErr) throw staffErr;
    const clinicIds = (staffData || []).map((s: any) => s.clinic_id);
    const { data, error } = await supabase.from('clinics').select('*').in('id', clinicIds);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
