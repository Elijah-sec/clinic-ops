"use client";
import React, { useState } from 'react';
import { createBrowserSupabase } from '@/../../lib/supabase';

export default function PatientForm({ clinicId, onCreated }: { clinicId: string; onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName || !phone) return setError('Name and phone are required');
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch(`/api/patients`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ clinicId, full_name: fullName, phone, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setFullName('');
      setPhone('');
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
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="submit" disabled={loading}>Add</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
