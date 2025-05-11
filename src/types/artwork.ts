
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
}
