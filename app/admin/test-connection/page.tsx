'use client';

import { createClient } from '@/lib/supabase-auth';
import { useEffect, useState } from 'react';

export default function TestConnection() {
  const [status, setStatus] = useState('Checking connection...');
  const [config, setConfig] = useState<{
    url: string | undefined;
    hasKey: boolean;
    session: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    async function checkConnection() {
      try {
        // Test the connection by getting the session
        const { data, error } = await supabase.auth.getSession();
        
        // Get configuration
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setConfig({
          url,
          hasKey,
          error: error?.message,
          session: !!data?.session
        });
        
        if (error) {
          setStatus(`Connection Error: ${error.message}`);
        } else {
          setStatus('Connection successful!');
        }
      } catch (err) {
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-4">
        <div className="p-4 bg-white/80 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Status</h2>
          <p>{status}</p>
        </div>
        {config && (
          <div className="p-4 bg-white/80 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Configuration</h2>
            <pre className="whitespace-pre-wrap">{JSON.stringify(config, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
