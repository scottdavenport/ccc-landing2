'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/database.types';

type SponsorLevel = Database['api']['Tables']['sponsor_levels']['Row'];

export function AddSponsorForm() {
  const [name, setName] = useState('');
  const [levels, setLevels] = useState<SponsorLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSponsorLevels() {
      const { data, error } = await supabase
        .from('sponsor_levels')
        .select('*');

      if (error) {
        console.error('Error fetching sponsor levels:', error);
        return;
      }

      setLevels(data);
      if (data.length > 0) {
        setSelectedLevel(data[0].id);
      }
    }

    fetchSponsorLevels();
  }, []);

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

      if (!levels || levels.length === 0) {
        // Create a default sponsor level if none exist
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

        // Use the default level ID
        setSelectedLevel('00000000-0000-0000-0000-000000000001');
      }

      // Now create the sponsor
      const { error: createSponsorError } = await supabase
        .from('sponsors')
        .insert([{ 
          name,
          level: selectedLevel || '00000000-0000-0000-0000-000000000001',
          year: new Date().getFullYear() // Current year as default
        }]);

      if (createSponsorError) {
        console.error('Error creating sponsor:', createSponsorError);
        throw createSponsorError;
      }

      setSuccess(true);
      setName('');
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="sponsorName"
            className="block text-sm font-medium text-gray-700"
          >
            Sponsor Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="sponsorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter sponsor name"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="sponsorLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Sponsor Level
          </label>
          <div className="mt-1">
            <select
              id="sponsorLevel"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Sponsor added successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add Sponsor'}
      </button>
    </form>
  );
}
