'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { SponsorLogoDialog } from './SponsorLogoDialog';

type Sponsor = Database['api']['Tables']['sponsors']['Row'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

export function SponsorsTable() {
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);

  const handleUploadClick = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
  };

  const handleUpload = async (file: File) => {
    if (!selectedSponsorId) return;
    try {
      // First upload to Cloudinary via our API
      const formData = new FormData();
      formData.append('logo', file);

      const uploadResponse = await fetch('/api/sponsors/logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      const { image_url, cloudinary_public_id } = await uploadResponse.json();

      // Then update the sponsor record in Supabase
      const { error } = await supabase
        .from('sponsors')
        .update({ 
          image_url,
          cloudinary_public_id
        })
        .eq('id', selectedSponsorId);

      if (error) throw error;

      // Update local state
      setSponsors(prev =>
        prev.map(sponsor =>
          sponsor.id === selectedSponsorId
            ? { ...sponsor, image_url, cloudinary_public_id }
            : sponsor
        )
      );
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo');
    } finally {
      setSelectedSponsorId(null);
    }
  };
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
      {selectedSponsorId && (
        <SponsorLogoDialog
          isOpen={true}
          onClose={() => setSelectedSponsorId(null)}
          onUpload={handleUpload}
          sponsorName={sponsors.find(s => s.id === selectedSponsorId)?.name || ''}
        />
      )}
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Logo
            </th>
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
                {sponsor.image_url ? (
                  <div className="relative w-12 h-12">
                    <Image
                      src={sponsor.image_url}
                      alt={`${sponsor.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadClick(sponsor.id)}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                )}
              </td>
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
