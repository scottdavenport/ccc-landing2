'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<{
    connection: string;
    branch: string | null;
    error: string | null;
  }>({
    connection: 'Testing...',
    branch: null,
    error: null
  });

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { error } = await supabase.from('sponsors').select('*').limit(1);
        if (error) throw error;

        // Get current branch
        const branch = process.env.NEXT_PUBLIC_SUPABASE_BRANCH || 'main';

        setStatus({
          connection: 'Connected successfully!',
          branch: branch,
          error: null
        });
      } catch (err) {
        setStatus({
          connection: 'Failed to connect',
          branch: process.env.NEXT_PUBLIC_SUPABASE_BRANCH || null,
          error: err instanceof Error ? err.message : 'An unknown error occurred'
        });
      }
    }

    testConnection();
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium text-gray-900">Supabase Connection Status</h3>
      <dl className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Connection Status</dt>
          <dd className="mt-1 text-sm text-gray-900">{status.connection}</dd>
        </div>
        {status.branch && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Branch</dt>
            <dd className="mt-1 text-sm text-gray-900">{status.branch}</dd>
          </div>
        )}
        {status.error && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Error</dt>
            <dd className="mt-1 text-sm text-red-600">{status.error}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
