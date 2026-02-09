"use client";
import React, { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const res = await fetch('/api/clinics', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (!res.ok) throw new Error('Failed');
        const list = await res.json();
        setClinics(list || []);
      } catch (err) {
        // redirect to login if unauthorized
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Clinics</h1>
      {clinics.length === 0 && <div>No clinics found. Create one in the Supabase SQL editor or via API.</div>}
      <ul>
        {clinics.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            <a href={`/clinics/${c.id}/dashboard`}>{c.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
