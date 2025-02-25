import { useRef, useState } from 'react';
import Image from 'next/image';

interface SponsorFormProps {
  onSuccess?: () => void;
}

export function SponsorForm({ onSuccess }: SponsorFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    console.log('Form submission starting...');
    // Set submitting state immediately
    await Promise.resolve(setIsSubmitting(true));
    setError(null);
    setIsSuccess(false);

    // Small delay to ensure state updates are processed
    await new Promise(resolve => setTimeout(resolve, 100));

    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError('Please select a logo file');
      setIsSubmitting(false);
      return;
    }

    console.log('Submitting form with data:', {
      name: formData.get('name'),
      website: formData.get('website'),
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });

    try {
      const response = await fetch(`${window.location.origin}/api/sponsors`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Set success state first
      setIsSuccess(true);
      setError(null);

      // Reset form
      resetForm();

      // Call onSuccess callback if provided
      if (onSuccess) {
        const timer = setTimeout(() => {
          setIsSuccess(false); // Clear success message
          onSuccess();
        }, 1500); // Give time to show success message

        return () => clearTimeout(timer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Sponsor Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          required
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium">
          Logo
        </label>
        <input
          type="file"
          id="logo"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          required
          disabled={isSubmitting}
          className="mt-1 block w-full"
        />
      </div>

      {previewUrl && (
        <div className="image-preview">
          <Image
            src={previewUrl}
            alt="Logo preview"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
      )}

      {error && <div className="error-message text-red-500">{error}</div>}

      {isSuccess && (
        <div className="success-message text-green-500">Sponsor created successfully</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
        data-testid="submit-button"
        className={`rounded px-4 py-2 text-white transition-all ${isSubmitting ? 'bg-blue-300 cursor-not-allowed opacity-50' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        <span className="inline-block min-w-[80px]">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </span>
      </button>
    </form>
  );
}
