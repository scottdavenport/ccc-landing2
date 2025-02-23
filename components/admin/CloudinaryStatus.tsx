'use client';

import { useState, useEffect } from 'react';
import { LastCheckedTime } from './LastCheckedTime';

export function CloudinaryStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkCloudinaryConnection = async () => {
      try {
        // Test Cloudinary connectivity through our API endpoint
        const response = await fetch('/api/cloudinary/status');
        const data = await response.json();

        if (response.ok && data.status === 'connected') {
          setStatus('connected');
          setError(null);
          setLastChecked(new Date());
        } else {
          throw new Error('Failed to connect to Cloudinary');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Cloudinary');
      }
    };

    checkCloudinaryConnection();
    // Check connection every minute
    const interval = setInterval(checkCloudinaryConnection, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <span className="mr-2 text-sm text-gray-500">Cloudinary:</span>
        <LastCheckedTime date={lastChecked} />
        {status === 'connecting' && (
          <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
        )}
        {status === 'connected' && (
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
        )}
        {status === 'error' && (
          <div className="h-2 w-2 rounded-full bg-red-400"></div>
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
