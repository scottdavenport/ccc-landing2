export type Sponsor = {
  id: string; // uuid type
  name: string;
  level: string; // uuid reference to sponsor_levels
  year: number;
  cloudinary_public_id?: string;
  image_url?: string;
  web_url?: string;
  created_at: string;
  updated_at: string;
};

export type SponsorLevel = {
  id: string; // uuid
  name: string;
  created_at: string;
  updated_at: string;
  amount: number;
};

export type Database = {
  api: {
    Tables: {
      sponsors: {
        Row: Sponsor;
        Insert: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>>;
      };
      sponsor_levels: {
        Row: SponsorLevel;
        Insert: Omit<SponsorLevel, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SponsorLevel, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
