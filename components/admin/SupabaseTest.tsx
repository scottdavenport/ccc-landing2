'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define types for our environment variables
type ClientEnvVars = {
  SUPABASE_URL: string | undefined;
  SUPABASE_KEY: string | undefined;
  SUPABASE_BRANCH: string | undefined;
  VERCEL_ENV: string | undefined;
  VERCEL_GIT_COMMIT_REF: string | undefined;
  NODE_ENV: string | undefined;
};

type EnvVarMapping = {
  [key: string]: keyof ClientEnvVars;
};

// These variables are available at build time and runtime on the client
const clientEnvVars: ClientEnvVars = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_BRANCH: process.env.NEXT_PUBLIC_SUPABASE_BRANCH,
  VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  VERCEL_GIT_COMMIT_REF: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
  NODE_ENV: process.env.NODE_ENV
};

console.log('Client environment:', clientEnvVars);

export function SupabaseTest() {
  const [status, setStatus] = useState<{
    connection: string;
    branch: string | null;
    error: string | null;
    missingEnvVars: string[];
    environment: string | null;
    vercelEnv: string | null;
    gitRef: string | null;
  }>({
    connection: 'Testing...',
    branch: null,
    error: null,
    missingEnvVars: [],
    environment: null,
    vercelEnv: null,
    gitRef: null
  });

  useEffect(() => {
    async function testConnection() {
      // Get environment information from client-side accessible vars
      const vercelEnv = clientEnvVars.VERCEL_ENV || 'local';
      const gitRef = clientEnvVars.VERCEL_GIT_COMMIT_REF || 'unknown';
      const environment = clientEnvVars.NODE_ENV || 'development';
      
      // Determine branch based on environment
      let branch;
      if (vercelEnv === 'production') {
        branch = 'main';
      } else if (vercelEnv === 'preview') {
        branch = gitRef || 'preview';
      } else {
        branch = clientEnvVars.SUPABASE_BRANCH || 'development';
      }

      // Check for required environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];
      
      // Map environment variables to our client-safe object keys
      const envVarMapping: EnvVarMapping = {
        'NEXT_PUBLIC_SUPABASE_URL': 'SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'SUPABASE_KEY'
      };

      const envVarStatus = requiredEnvVars.map(envVar => ({
        name: envVar,
        exists: !!clientEnvVars[envVarMapping[envVar]],
        value: clientEnvVars[envVarMapping[envVar]] ? `${clientEnvVars[envVarMapping[envVar]]?.substring(0, 8)}...` : undefined
      }));

      const missingEnvVars = envVarStatus.filter(env => !env.exists).map(env => env.name);
      
      console.log('Debug Info:', {
        envVarStatus,
        vercelEnv,
        gitRef,
        environment,
        branch: clientEnvVars.SUPABASE_BRANCH
      });

      if (missingEnvVars.length > 0) {
        setStatus({
          connection: 'Configuration Error',
          branch: clientEnvVars.SUPABASE_BRANCH || null,
          error: 'Missing required environment variables',
          missingEnvVars,
          environment,
          vercelEnv,
          gitRef
        });
        return;
      }

      try {
        // Test basic connection
        const { error } = await supabase.from('sponsors').select('*').limit(1);
        if (error) throw error;

        // Branch was determined above

        setStatus({
          connection: 'Connected successfully!',
          branch,
          error: null,
          missingEnvVars: [],
          environment,
          vercelEnv,
          gitRef
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setStatus({
          connection: 'Failed to connect',
          branch: process.env.NEXT_PUBLIC_SUPABASE_BRANCH || null,
          error: errorMessage,
          missingEnvVars: [],
          environment,
          vercelEnv,
          gitRef
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
          <dd className={`mt-1 text-sm ${
            status.connection === 'Connected successfully!'
              ? 'text-green-600'
              : status.connection === 'Testing...'
              ? 'text-gray-900'
              : 'text-red-600'
          }`}>
            {status.connection}
          </dd>
        </div>
        
        {status.branch && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Branch</dt>
            <dd className="mt-1 text-sm text-gray-900">{status.branch}</dd>
          </div>
        )}

        {(status.error || status.missingEnvVars.length > 0) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {status.error || 'Configuration Error'}
                </h3>
                {status.missingEnvVars.length > 0 && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>Missing environment variables:</p>
                    <ul className="list-disc list-inside mt-1">
                      {status.missingEnvVars.map(envVar => (
                        <li key={envVar}>{envVar}</li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Please check your Vercel project settings and ensure all required
                      environment variables are set for this environment.
                    </p>
                  </div>
                )}
                {status.error && !status.missingEnvVars.length && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>Error details: {status.error}</p>
                    <p className="mt-2">
                      Environment Information:
                    </p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Node Environment: {status.environment}</li>
                      <li>Vercel Environment: {status.vercelEnv}</li>
                      <li>Git Reference: {status.gitRef}</li>
                    </ul>
                    <p className="mt-2">
                      Please verify your Supabase configuration and ensure your database
                      is accessible from this environment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}
