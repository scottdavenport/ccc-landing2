'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth';

function DebugInfo() {
  const [branchName, setBranchName] = useState<string>('Loading...');
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Get the current branch name from the Supabase URL
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const branch = process.env.NEXT_PUBLIC_SUPABASE_BRANCH || 'unknown';
    setBranchName(branch);
  }, []);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/supabase-diagnostic');
      const data = await response.json();
      setDiagnosticResult(data);
      console.log('Diagnostic result:', data);
    } catch (error) {
      console.error('Error running diagnostic:', error);
      setDiagnosticResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-white/80 rounded-lg text-sm">
      <h3 className="font-semibold mb-2">Debug Info</h3>
      <div>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
        <p>Has Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
        <p>Branch: {branchName}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
        
        <button 
          onClick={runDiagnostic}
          disabled={isLoading}
          className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
        >
          {isLoading ? 'Running...' : 'Run Diagnostic'}
        </button>
        
        {diagnosticResult && (
          <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
            <pre className="text-xs">{JSON.stringify(diagnosticResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to sign in...');
      await signIn(email, password);
      console.log('Sign in successful');
      router.push('/admin'); // Redirect to admin dashboard after login
    } catch (err) {
      console.error('Sign in error:', err);
      if (err instanceof Error) {
        setError(`Authentication failed: ${err.message}`);
      } else {
        setError('Failed to sign in. Please check your credentials and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ccc-teal py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card max-w-md w-full p-8 rounded-lg space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-foreground">Sign in to CCC Admin</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
        <DebugInfo />
      </div>
    </div>
  );
}
