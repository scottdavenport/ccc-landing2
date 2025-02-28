'use client';

import { useEffect, useState } from 'react';

type ConnectionType = 'neon' | 'cloudinary';
type ConnectionState = 'connected' | 'disconnected' | 'checking';

interface ConnectionStatusProps {
  type: ConnectionType;
}

export function ConnectionStatus({ type }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionState>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        let isConnected = false;
        
        if (type === 'neon') {
          const response = await fetch('/api/db/connection');
          if (response.ok) {
            const data = await response.json();
            isConnected = data.connected;
          }
        } else if (type === 'cloudinary') {
          const response = await fetch('/api/cloudinary/connection');
          if (response.ok) {
            const data = await response.json();
            isConnected = data.connected;
          }
        }
        
        setStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error(`${type} connection error:`, error);
        setStatus('disconnected');
      }
      setLastChecked(new Date());
    };

    // Check immediately on mount
    checkConnection();

    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [type]);

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

  const getServiceName = () => {
    return type === 'neon' ? 'Neon DB' : 'Cloudinary';
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
        ? `Connected to ${getServiceName()}`
        : status === 'disconnected'
          ? `${getServiceName()} Disconnected`
          : `Checking ${getServiceName()} connection...`}
    </div>
  );
}
