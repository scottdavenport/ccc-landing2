'use client';

import { useState, useEffect } from 'react';
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

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor()} text-sm font-medium`}
      title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : undefined}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'}`} />
      {status === 'connected' ? 'Connected to Cloudinary' :
       status === 'error' ? (error || 'Connection Error') :
       'Checking connection...'}
    </div>
  );
}
