"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/../../lib/supabase';

export default function AppointmentForm({ clinicId, onCreated }: { clinicId: string; onCreated: () => void }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        const supabase = createBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const q = new URLSearchParams({ clinicId });
        const res = await fetch(`/api/patients?${q.toString()}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (!res.ok) throw new Error('Failed to load patients');
        const patients = await res.json();
        setPatients(patients);
        if (patients.length) setPatientId(patients[0].id);
      } catch (err) {
        // ignore
      }
    }
    loadPatients();
  }, [clinicId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patientId || !scheduledAt) return setError('Patient and date/time required');
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ clinicId, patient_id: patientId, scheduled_at: new Date(scheduledAt).toISOString(), notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setScheduledAt('');
      setNotes('');
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name} — {p.phone}</option>
          ))}
        </select>
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        <button type="submit" disabled={loading}>Create</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
