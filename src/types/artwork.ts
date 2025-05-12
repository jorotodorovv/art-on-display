
export interface ArtworkTag {
  id: string;
  name: string;
}

export interface Artwork {
  id: number;
  title: string;
  description: string;
  blob_url: string;
  date: string;
  price?: number;
  forSale?: boolean;
  tags: ArtworkTag[];
  created_at?: string;
  updated_at?: string;
}

export interface EditableContent {
  id?: string;
  key: string;
  content_en: string;
  content_es: string;
  page: string;
}
