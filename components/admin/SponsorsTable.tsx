/**
 * SponsorsTable Component
 * 
 * This component displays a table of sponsors with their logos, names, levels, and other details.
 * It provides functionality to view and upload sponsor logos using Cloudinary for storage
 * and Supabase for data management.
 */

'use client'; // Mark as client-side component for Next.js

// Core React and Next.js imports
import { useEffect, useState } from 'react';  // For managing component state and side effects
import Image from 'next/image';               // Next.js optimized image component

// Database and type imports
import { supabase } from '@/lib/supabase/client';        // Supabase client for database operations
import { Database } from '@/lib/supabase/database.types'; // TypeScript types for database schema [dig deeper]

// UI Components
import { Button } from '@/components/ui/button';         // Reusable button component
import { Upload } from 'lucide-react';                  // Upload icon [dig deeper]
import { SponsorLogoDialog } from './SponsorLogoDialog'; // Dialog for logo uploads

// Base sponsor type from database
type Sponsor = Database['api']['Tables']['sponsors']['Row'];

// Extended type that includes joined sponsor_levels data
type SponsorWithLevel = Sponsor & {
  sponsor_levels?: {
    name: string;
  } | null;
};

/**
 * LoadingSpinner Component
 * 
 * A simple loading indicator that shows a spinning animation.
 * Used while the sponsors data is being fetched from the database. [dig deeper]
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * SponsorsTable Component
 * 
 * Main component that manages the sponsors table UI and data.
 * Handles loading states, errors, and logo upload functionality.
 */
export function SponsorsTable() {
  // State for tracking which sponsor's logo is being uploaded
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);

  /**
   * Handles the click event when a user wants to upload a logo.
   * Sets the selected sponsor ID which triggers the upload dialog.
   */
  const handleUploadClick = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
  };

  /**
   * Handles the logo upload process for a sponsor.
   * This is a multi-step process:
   * 1. Uploads the file to Cloudinary through our API
   * 2. Updates the sponsor record in Supabase with the new image details
   * 3. Updates the local UI state to show the new logo
   * 
   * @param file - The image file selected by the user
   */
  const handleUpload = async (file: File) => {
    if (!selectedSponsorId) return;
    try {
      // Step 1: Upload to Cloudinary via our API
      // We use FormData to send the file in a multipart request
      const formData = new FormData();
      formData.append('logo', file);

      // Step 1: Upload to Cloudinary via fetch API
      // fetch throws its own type of error handling with response.ok
      const uploadResponse = await fetch('/api/sponsors/logo', {
        method: 'POST',
        body: formData,
      });

      // fetch API specific error checking
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      // Get the Cloudinary URLs and IDs from the response
      const { image_url, cloudinary_public_id } = await uploadResponse.json();

      // Step 2: Update the sponsor record in Supabase
      // Supabase has its own error handling pattern
      // It returns an object with { data, error } structure
      const { data, error } = await supabase  // Note: Supabase always returns { data, error }
        .from('sponsors')      // Select the sponsors table
        .update({              // Update these fields
          image_url,           // The URL where the image can be accessed
          cloudinary_public_id // Cloudinary's unique ID for the image
        })
        .eq('id', selectedSponsorId);  // Only update the sponsor with this ID

      // Supabase specific error checking
      // If error exists, it means the Supabase operation failed
      if (error) throw error;  // This error is from Supabase, not from fetch or other services

      // Step 3: Update local state to reflect the new logo immediately
      setSponsors(prev => {  // 'prev' contains the current list of sponsors
        // Use map to create a new array where we update just one sponsor
        return prev.map(sponsor => {
          // For each sponsor, check if this is the one we just updated
          if (sponsor.id === selectedSponsorId) {
            // If it matches, create a new sponsor object with updated image info
            return { 
              ...sponsor,              // Keep all existing sponsor properties
              image_url,              // Add the new image URL
              cloudinary_public_id    // Add the new Cloudinary ID
            };
          }
          // If it's not the sponsor we're updating, keep it unchanged
          return sponsor;
        });
      });
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo');
    } finally {
      // Clean up: reset the selected sponsor regardless of success/failure
      setSelectedSponsorId(null);
    }
  };
  // State for managing the list of sponsors and UI states
  const [sponsors, setSponsors] = useState<(Sponsor & { level_name: string })[]>([]); // Sponsors array with level names
  const [isLoading, setIsLoading] = useState(true);  // Loading state for showing spinner
  const [error, setError] = useState<string | null>(null);  // Error state for showing error messages

  // useEffect hook to fetch sponsors when component mounts
  useEffect(() => {
    // Separate async function because useEffect callback cannot be async
    async function fetchSponsors() {
      try {
        // Fetch sponsors data from Supabase
        // Using join to get sponsor level names in the same query
        const { data, error } = await supabase
          .from('sponsors')
          .select(`
            *,
            sponsor_levels (
              name
            )
          `)
          .order('name');   // Order results by sponsor name

        // Handle Supabase errors
        if (error) {
          throw error;
        }

        // Handle case where no data is returned
        if (!data) {
          setSponsors([]);
          return;
        }

        // Cast the data to include the joined sponsor_levels
        const sponsorsWithLevelNames = (data as SponsorWithLevel[]).map(sponsor => ({
          ...sponsor,  // Spread all sponsor properties
          // Get level name from joined data, fallback to 'Unknown'
          level_name: sponsor.sponsor_levels?.name || 'Unknown'
        }));

        // Update state with transformed data
        setSponsors(sponsorsWithLevelNames);
      } catch (err) {
        // Log error and update error state for UI
        console.error('Error fetching sponsors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sponsors');
      } finally {
        // Always mark loading as complete, whether successful or not
        setIsLoading(false);
      }
    }

    // Call the fetch function when component mounts
    fetchSponsors();
  }, []); // Empty dependency array means this runs once on mount

  // 1. Loading State: Show spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Error State: Show error message if something went wrong
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        {error}
      </div>
    );
  }

  // 3. Empty State: Show message when no sponsors exist
  if (sponsors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sponsors found. Add your first sponsor above.
      </div>
    );
  }

  // 4. Main Render: Show the sponsors table
  return (
    <div className="overflow-x-auto">  {/* Enables horizontal scrolling if table is too wide */}
      {/* Conditional render of the logo upload dialog */}
      {selectedSponsorId && (
        <SponsorLogoDialog
          isOpen={true}
          onClose={() => setSelectedSponsorId(null)}
          onUpload={handleUpload}
          sponsorName={sponsors.find(s => s.id === selectedSponsorId)?.name || ''}
        />
      )}

      {/* Main sponsors table */}
      <table className="min-w-full divide-y divide-border">
        {/* Table Header */}
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Logo
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-background divide-y divide-border">
          {/* Map through sponsors array to create table rows */}
          {sponsors.map((sponsor) => (
            <tr key={sponsor.id} className="hover:bg-muted/50 transition-colors">
              {/* Other Data Columns */}
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
              {/* Logo Column: Shows either the logo image or upload button */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {sponsor.image_url ? (
                  // If sponsor has a logo, display it
                  <div className="relative w-12 h-12">  {/* Container for Next.js Image */}
                    <Image
                      src={sponsor.image_url}
                      alt={`${sponsor.name} logo`}
                      fill                    // Makes image fill container
                      className="object-contain"  // Maintains aspect ratio
                    />
                  </div>
                ) : (
                  // If no logo, show upload button
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
