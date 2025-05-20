
export interface ArtworkTag {
  id: string;
  name: string;
  name_bg: string;
}

export interface Artwork {
  id: number;
  title: string;
  title_bg?: string;
  image: string;
  description: string;
  description_bg?: string;
  tags: ArtworkTag[];
  for_sale?: boolean;
  price?: number;
  featured?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
}
