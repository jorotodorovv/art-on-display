
export interface ArtworkTag {
  id: string;
  name: string;
}

export interface Artwork {
  id: number;
  title: string;
  image: string;
  description: string;
  tags: ArtworkTag[];
  forSale?: boolean;
  price?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
