'use client';

import { type ConnectionStatus } from './SupabaseTest';

export function SupabaseTestUI({ status }: { status: ConnectionStatus }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium text-gray-900">Supabase Connection Status</h3>
      <dl className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Connection Status</dt>
          <dd className={`mt-1 text-sm ${
            status.connection === 'Connected'
              ? 'text-green-600'
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
