
export type ConnectionStatus = {
  connection: string;
  branch: string | null;
  error: string | null;
  missingEnvVars: string[];
  environment: string | null;
  vercelEnv: string | null;
  gitRef: string | null;
};

// Server-side configuration
async function getSupabaseConfig() {
  // Get environment information
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
  const environment = process.env.NODE_ENV || 'development';
  
  // Use the api schema as required by the server
  const schema = 'api';

  return {
    vercelEnv,
    gitRef,
    environment,
    schema,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

export async function SupabaseTest(): Promise<ConnectionStatus> {
  console.log('Environment check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  const config = await getSupabaseConfig();
  
  // Check for missing environment variables
  const missingEnvVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  // Initialize status
  const status: ConnectionStatus = {
    connection: missingEnvVars.length > 0 ? 'Missing environment variables' : 'Connected',
    branch: config.schema,
    error: missingEnvVars.length > 0 ? `Missing required environment variables: ${missingEnvVars.join(', ')}` : null,
    missingEnvVars,
    environment: config.environment,
    vercelEnv: config.vercelEnv,
    gitRef: config.gitRef
  };

  // Return early if missing environment variables
  if (missingEnvVars.length > 0) {
    return status;
  }

  try {
    console.log('Starting Supabase connection test...');
    
    // Test connection using REST API directly
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sponsors?select=id&limit=1`;
    console.log('Testing URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Accept-Profile': 'api',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', {
      contentType: response.headers.get('content-type'),
      profile: response.headers.get('profile'),
      error: response.headers.get('x-error')
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Update status with error information
      status.error = errorText;
      status.connection = 'Failed';
      
      // If it's a schema error, provide more helpful information
      if (errorText.includes('schema')) {
        status.error = `Schema error: The current schema is '${config.schema}'. Please ensure your database has the required tables in this schema.`;
      }
      
      return status;
    }
    
    const data = await response.json();
    console.log('Response data:', data);

    // Update status for successful connection
    return {
      ...status,
      connection: 'Connected',
      error: null
    };
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Check for specific schema-related errors
    if (errorMessage.includes('schema')) {
      errorMessage = 'Schema error: Please ensure you are using the correct schema. The schema must be: api';
    }

    return {
      ...status,
      connection: 'Failed to connect',
      error: errorMessage
    };
  }
}
// UI Component to display the connection status
export default function SupabaseTestUI({ status }: { status: ConnectionStatus }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium text-gray-900">Supabase Connection Status</h3>
      <dl className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Connection Status</dt>
          <dd className={`mt-1 text-sm ${status.connection === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
            {status.connection}
          </dd>
          {status.error && (
            <dd className="mt-1 text-sm text-red-600">
              {status.error}
            </dd>
          )}
          {status.missingEnvVars.length > 0 && (
            <dd className="mt-2 text-sm text-gray-500">
              Please add the following variables to your <code className="text-sm font-mono bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file:
              <ul className="mt-1 list-disc list-inside">
                {status.missingEnvVars.map((envVar) => (
                  <li key={envVar} className="text-sm font-mono">{envVar}</li>
                ))}
              </ul>
            </dd>
          )}
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
