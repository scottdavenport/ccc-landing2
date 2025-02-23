'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/database.types';

type Sponsor = Database['api']['Tables']['sponsors']['Row'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

export function SponsorsTable() {
  const [sponsors, setSponsors] = useState<(Sponsor & { level_name: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const { data, error } = await supabase
          .from('sponsors')
          .select(`
            *,
            sponsor_levels (
              name
            )
          `)
          .order('name');

        if (error) {
          throw error;
        }

        if (!data) {
          setSponsors([]);
          return;
        }

        const sponsorsWithLevelNames = data.map(sponsor => ({
          ...sponsor,
          level_name: sponsor.sponsor_levels?.name || 'Unknown'
        }));

        setSponsors(sponsorsWithLevelNames);
      } catch (err) {
        console.error('Error fetching sponsors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sponsors');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        {error}
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sponsors found. Add your first sponsor above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Level
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Year
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Added
            </th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {sponsors.map((sponsor) => (
            <tr key={sponsor.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {sponsor.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {sponsor.level_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {sponsor.year}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(sponsor.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
