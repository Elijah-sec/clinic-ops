import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabase';
import { getUserFromAccessToken, requireStaffForClinic } from '../../../../lib/auth';

const TABLE = 'patients';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
  if (!token) return null;
  try {
    return await getUserFromAccessToken(token);
  } catch (err) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clinicId = req.nextUrl.searchParams.get('clinicId');
  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception', 'clinician']);
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { clinicId, full_name, phone, notes, internal_remarks } = body;
  if (!clinicId || !full_name || !phone)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception']);
    const supabase = createServerSupabase();
    const { data, error } = await supabase.from(TABLE).insert([
      {
        clinic_id: clinicId,
        full_name,
        phone,
        notes: notes ?? null,
        internal_remarks: internal_remarks ?? null,
      },
    ]).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { clinicId, id, full_name, phone, notes, internal_remarks } = body;
  if (!clinicId || !id) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception']);
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        full_name: full_name ?? undefined,
        phone: phone ?? undefined,
        notes: notes ?? undefined,
        internal_remarks: internal_remarks ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', clinicId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { clinicId, id } = body;
  if (!clinicId || !id) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception']);
    const supabase = createServerSupabase();
    const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('clinic_id', clinicId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
