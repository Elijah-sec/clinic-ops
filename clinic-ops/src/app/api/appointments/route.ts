import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabase';
import { getUserFromAccessToken, requireStaffForClinic } from '../../../../lib/auth';

const TABLE = 'appointments';

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

// GET: list appointments for a clinic; optional date param (ISO yyyy-mm-dd) to filter day
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clinicId = req.nextUrl.searchParams.get('clinicId');
  const date = req.nextUrl.searchParams.get('date');
  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception', 'clinician']);
    const supabase = createServerSupabase();
    let query = supabase
      .from(TABLE)
      .select('*, patients(full_name,phone)')
      .eq('clinic_id', clinicId)
      .order('scheduled_at', { ascending: true });

    if (date) {
      // filter scheduled_at between start and end of day
      const start = new Date(date + 'T00:00:00.000Z').toISOString();
      const end = new Date(date + 'T23:59:59.999Z').toISOString();
      query = query.gte('scheduled_at', start).lte('scheduled_at', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}

// POST: create appointment
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { clinicId, patient_id, scheduled_at, notes } = body;
  if (!clinicId || !patient_id || !scheduled_at)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception']);
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          clinic_id: clinicId,
          patient_id,
          scheduled_at,
          notes: notes ?? null,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}

// PATCH: update appointment (status or fields)
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { clinicId, id, status, scheduled_at, notes } = body;
  if (!clinicId || !id) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    await requireStaffForClinic(clinicId, user.id, ['admin', 'reception', 'clinician']);
    const supabase = createServerSupabase();
    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (scheduled_at) updateFields.scheduled_at = scheduled_at;
    if (notes !== undefined) updateFields.notes = notes;
    updateFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(updateFields)
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
