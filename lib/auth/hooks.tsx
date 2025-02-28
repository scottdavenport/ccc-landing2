'use client';

import { useClerk, useAuth as useClerkAuth, useSignIn } from '@clerk/nextjs';

export function useAuth() {
  const { isLoaded, userId, isSignedIn } = useClerkAuth();
  const clerk = useClerk();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  
  const loading = !isLoaded || !isSignInLoaded;
  const user = isSignedIn ? { id: userId } : null;

  const login = async (email: string, password: string) => {
    try {
      console.log('Auth Hook: Attempting sign in...');
      
      if (!signIn) {
        throw new Error('Sign in is not available');
      }
      
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status !== 'complete') {
        console.error('Auth Hook: Sign in error:', result.status);
        throw new Error(`Sign in failed: ${result.status}`);
      }

      console.log('Auth Hook: Sign in successful');
      return result;
    } catch (err) {
      console.error('Auth Hook: Unexpected error during sign in:', err);
      throw err;
    }
  };

  const logout = async () => {
    await clerk.signOut();
  };

  return {
    user,
    loading,
    signIn: login,
    signOut: logout,
  };
} 