"use client";
import React from 'react';
import { createBrowserSupabase } from '@/../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      // ignore
    }
    router.push('/login');
  }

  return <button onClick={handleSignOut}>Sign out</button>;
}
