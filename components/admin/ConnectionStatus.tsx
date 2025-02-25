'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('sponsors').select('count');
        if (error) throw error;
        setStatus('connected');
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus('disconnected');
      }
      setLastChecked(new Date());
    };

    // Check immediately on mount
    checkConnection();

    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor()} text-sm font-medium`}
      title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Checking...'}
    >
      <span
        className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : status === 'disconnected' ? 'bg-red-500' : 'bg-gray-500'}`}
      />
      {status === 'connected'
        ? 'Connected to Supabase'
        : status === 'disconnected'
          ? 'Disconnected'
          : 'Checking connection...'}
    </div>
  );
}
