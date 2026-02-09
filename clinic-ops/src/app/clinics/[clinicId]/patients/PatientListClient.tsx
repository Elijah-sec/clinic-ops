"use client";
import React, { useEffect, useState } from 'react';
import PatientForm from './PatientForm';
import { createBrowserSupabase } from '@/../../lib/supabase';

export default function PatientListClient({ clinicId }: { clinicId: string }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  async function fetchPatients() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const q = new URLSearchParams({ clinicId });
      const res = await fetch(`/api/patients?${q.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const patientsList = await res.json();
      setPatients(patientsList);
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function startEdit(p: any) {
    setEditingId(p.id);
    setEditName(p.full_name);
    setEditPhone(p.phone);
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch('/api/patients', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ clinicId, id: editingId, full_name: editName, phone: editPhone }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setEditingId(null);
      fetchPatients();
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function deletePatient(id: string) {
    if (!confirm('Delete this patient?')) return;
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch('/api/patients', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ clinicId, id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      fetchPatients();
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  return (
    <div>
      <PatientForm clinicId={clinicId} onCreated={fetchPatients} />
      {loading && <div>Loading patients…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {patients.map((p) => (
          <li key={p.id} style={{ padding: 6, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editingId === p.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div><strong>{p.full_name}</strong></div>
                  <div>{p.phone}</div>
                  {p.notes && <div style={{ color: '#666' }}>{p.notes}</div>}
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingId !== p.id && <button onClick={() => startEdit(p)}>Edit</button>}
              <button onClick={() => deletePatient(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
