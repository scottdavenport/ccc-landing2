/**
 * Type definitions for sponsor-related data
 */

export type SponsorWithLevel = {
  id: string;
  name: string;
  year: number;
  created_at: string;
  cloudinary_public_id?: string;
  image_url?: string;
  web_url?: string;
  isEditing?: boolean;
  level: string;
  level_name?: string;
  level_amount?: number;
  sponsor_levels?: {
    name: string;
    amount: number;
  };
};
