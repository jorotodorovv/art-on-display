
export interface ArtworkTag {
  id: string;
  name: string;
}

export interface Artwork {
  id: number;
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
  tags: ArtworkTag[];
}
