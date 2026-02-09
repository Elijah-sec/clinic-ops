"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/../../lib/supabase';

function StatusBadge({ status }: { status: string }) {
  const color = status === 'scheduled' ? '#0a84ff' : status === 'completed' ? '#16a34a' : status === 'no_show' ? '#f59e0b' : '#ef4444';
  return <span style={{ padding: '2px 8px', background: color, color: '#fff', borderRadius: 6 }}>{status}</span>;
}

export default function AppointmentListClient({ clinicId, date }: { clinicId: string; date?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const q = new URLSearchParams({ clinicId });
      if (date) q.set('date', date);
      const res = await fetch(`/api/appointments?${q.toString()}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const appointments = await res.json();
      setItems(appointments ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, [clinicId, date]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ clinicId, id, status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      fetchItems();
    } catch (err) {
      // ignore for now
    }
  }

  return (
    <div>
      {loading && <div>Loading appointments…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((a) => (
          <li key={a.id} style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>{a.patients?.full_name ?? 'Unknown'}</strong> <small style={{ color: '#666' }}>{new Date(a.scheduled_at).toLocaleString()}</small></div>
              {a.notes && <div style={{ color: '#666' }}>{a.notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge status={a.status} />
              {a.status !== 'completed' && <button onClick={() => updateStatus(a.id, 'completed')}>Mark done</button>}
              {a.status !== 'no_show' && <button onClick={() => updateStatus(a.id, 'no_show')}>No-show</button>}
              {a.status !== 'cancelled' && <button onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
