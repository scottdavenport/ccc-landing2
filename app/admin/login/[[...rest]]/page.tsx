'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ccc-teal py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card max-w-md w-full p-8 rounded-lg space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-foreground mb-6">Sign in to CCC Admin</h2>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-white",
              card: "glass-card",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-border",
              formFieldInput: "appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm",
              formFieldLabel: "block text-sm font-medium text-foreground mb-1",
            }
          }}
          redirectUrl="/admin"
          signUpUrl={undefined}
        />
      </div>
    </div>
  );
} 