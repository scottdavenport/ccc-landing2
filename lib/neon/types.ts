// Define the Sponsor type
export type Sponsor = {
  id: string; // uuid type
  name: string;
  level: string; // uuid reference to sponsor_levels
  year: number;
  cloudinary_public_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

// Define the SponsorLevel type
export type SponsorLevel = {
  id: string; // uuid
  name: string;
  created_at: string;
  updated_at: string;
  amount?: number;
};

// Define the SponsorWithLevel type for joined queries
export type SponsorWithLevel = Sponsor & {
  sponsor_levels?: {
    name: string;
    amount?: number;
  };
}; 