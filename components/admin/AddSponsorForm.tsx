'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type SponsorLevel = Database['api']['Tables']['sponsor_levels']['Row'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

interface AddSponsorFormProps {
  onSponsorAdded?: () => void;
}

export function AddSponsorForm({ onSponsorAdded }: AddSponsorFormProps) {
  const [name, setName] = useState('');
  const [levels, setLevels] = useState<SponsorLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Wait a bit for the session to be established
    const timer = setTimeout(async () => {
      if (!isMounted) return;

      const { data, error } = await supabase
        .from('sponsor_levels')
        .select('*');

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching sponsor levels:', error);
        setError(`Error loading sponsor levels: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        setError('No sponsor levels found. Please create sponsor levels first.');
        return;
      }

      setLevels(data);
      setSelectedLevel(data[0].id);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array since we only want this to run once

  // Create a default sponsor level if none exist
  const createDefaultSponsorLevel = async () => {
    const { error: createLevelError } = await supabase
      .from('sponsor_levels')
      .insert([{ 
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Gold'
      }]);

    if (createLevelError) {
      console.error('Error creating default sponsor level:', createLevelError);
      throw new Error('Failed to create default sponsor level');
    }

    return '00000000-0000-0000-0000-000000000001';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First check if we have any sponsor levels
      const { data: levels, error: levelsError } = await supabase
        .from('sponsor_levels')
        .select('*');

      if (levelsError) {
        console.error('Error fetching sponsor levels:', levelsError);
        throw new Error('Failed to check sponsor levels');
      }

      let levelId = selectedLevel;
      
      if (!levels || levels.length === 0) {
        // Create a default sponsor level if none exist
        levelId = await createDefaultSponsorLevel();
      }

      // Now create the sponsor
      const { error: createSponsorError } = await supabase
        .from('sponsors')
        .insert([{ 
          name,
          level: levelId,
          year: new Date().getFullYear() // Current year as default
        }]);

      if (createSponsorError) {
        console.error('Error creating sponsor:', createSponsorError);
        throw createSponsorError;
      }

      setSuccess(true);
      setName('');
      onSponsorAdded?.();
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="glass-card p-6 rounded-lg shadow-lg">
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-secondary/10 text-secondary rounded-lg">
          Sponsor added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="sponsorName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Sponsor Name
            </label>
            <input
              type="text"
              id="sponsorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter sponsor name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="sponsorLevel"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Sponsor Level
            </label>
            {levels.length > 0 ? (
              <select
                id="sponsorLevel"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No sponsor levels available. One will be created automatically.
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Sponsor'}
        </button>
      </form>
    </div>
  );
}
