'use client';

import { useEffect, useState } from 'react';
import { SponsorWithLevel } from '@/types/sponsors';

type SponsorLevel = {
  id: string;
  name: string;
  amount: number;
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

interface AddSponsorFormProps {
  onSponsorAdded?: () => void;
  sponsorToEdit?: SponsorWithLevel | null;
}

export function AddSponsorForm({ onSponsorAdded, sponsorToEdit }: AddSponsorFormProps) {
  const [name, setName] = useState('');
  const [levels, setLevels] = useState<SponsorLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Wait a bit for the session to be established
    const timer = setTimeout(async () => {
      if (!isMounted) return;

      try {
        const response = await fetch('/api/sponsor-levels');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch sponsor levels');
        }
        
        const data = await response.json();

        if (!isMounted) return;

        if (!data || data.length === 0) {
          setError('No sponsor levels found. Please create sponsor levels first.');
          return;
        }

        // Transform the data to match the SponsorLevel type
        const transformedLevels: SponsorLevel[] = data.map((level: {
          id: string;
          name: string;
          amount: number;
        }) => ({
          id: level.id,
          name: level.name,
          amount: level.amount
        }));

        // Sort levels by amount from largest to smallest
        transformedLevels.sort((a, b) => b.amount - a.amount);

        setLevels(transformedLevels);
        
        // If not in edit mode, set default level
        if (!sponsorToEdit) {
          setSelectedLevel(transformedLevels[0].id);
        }
      } catch (error) {
        console.error('Error fetching sponsor levels:', error);
        setError(`Error loading sponsor levels: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sponsorToEdit]);

  // Set form values when sponsorToEdit changes
  useEffect(() => {
    if (sponsorToEdit) {
      setName(sponsorToEdit.name || '');
      setSelectedLevel(sponsorToEdit.level || '');
      setSelectedYear(sponsorToEdit.year || new Date().getFullYear());
      setWebsiteUrl(sponsorToEdit.website_url || '');
      setIsEditMode(true);
    } else {
      // Reset form when not editing
      setName('');
      setWebsiteUrl('');
      setLogoFile(null);
      setSelectedYear(new Date().getFullYear());
      setIsEditMode(false);
    }
  }, [sponsorToEdit]);

  // Generate an array of years (current year ± 3 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setError(null);
    }
  };

  const uploadToCloudinary = async (
    file: File
  ): Promise<{ public_id: string; secure_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sponsors');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
      }

      return data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upload image to Cloudinary'
      );
    }
  };

  const deleteFromCloudinary = async (publicId: string) => {
    try {
      const timestamp = new Date().getTime();
      const signature = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        body: JSON.stringify({ publicId, timestamp }),
      }).then(res => res.json());

      await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: 'POST',
          body: JSON.stringify({
            public_id: publicId,
            signature: signature.signature,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            timestamp,
          }),
        }
      );
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    let cloudinaryData = null;

    try {
      // Step 1: Upload logo to Cloudinary if provided
      if (logoFile) {
        cloudinaryData = await uploadToCloudinary(logoFile);
      }

      if (isEditMode && sponsorToEdit) {
        // Update existing sponsor via API
        const response = await fetch('/api/sponsors', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: sponsorToEdit.id,
            name,
            level: selectedLevel,
            year: selectedYear,
            website_url: websiteUrl || null,
            ...(cloudinaryData && {
              cloudinary_public_id: cloudinaryData.public_id,
              image_url: cloudinaryData.secure_url
            })
          }),
        });

        if (!response.ok) {
          // Rollback: Delete from Cloudinary if API update fails
          if (cloudinaryData) {
            await deleteFromCloudinary(cloudinaryData.public_id);
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update sponsor');
        }
      } else {
        // Insert new sponsor via API
        const response = await fetch('/api/sponsors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            level: selectedLevel,
            year: selectedYear,
            website_url: websiteUrl || null,
            cloudinary_public_id: cloudinaryData?.public_id || null,
            image_url: cloudinaryData?.secure_url || null
          }),
        });

        if (!response.ok) {
          // Rollback: Delete from Cloudinary if API insert fails
          if (cloudinaryData) {
            await deleteFromCloudinary(cloudinaryData.public_id);
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create sponsor');
        }
      }

      setSuccess(true);
      setName('');
      setLogoFile(null);
      if (onSponsorAdded) {
        onSponsorAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the sponsor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg shadow-lg">
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-secondary/10 text-secondary rounded-lg">
          Sponsor {isEditMode ? 'updated' : 'added'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="sponsorName" className="block text-sm font-medium text-foreground mb-1">
              Sponsor Name
            </label>
            <input
              type="text"
              id="sponsorName"
              value={name}
              onChange={e => setName(e.target.value)}
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
                onChange={e => setSelectedLevel(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name} (${level.amount ? level.amount.toLocaleString() : '0'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No sponsor levels available. One will be created automatically.
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="sponsorYear"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Sponsor Year
            </label>
            <select
              id="sponsorYear"
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-foreground mb-1">
              Website URL (optional)
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-foreground mb-1">
              Sponsor Logo
            </label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : isEditMode ? 'Update Sponsor' : 'Add Sponsor'}
        </button>
      </form>
    </div>
  );
}
