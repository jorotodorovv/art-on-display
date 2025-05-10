
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// Define artwork types and data for sale
interface ArtworkForSale {
  id: number;
  title: string;
  image: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
}

const artworksForSale: ArtworkForSale[] = [
  {
    id: 1,
    title: "Serene Lake",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    price: 850,
    category: "Paintings",
    description: "Acrylic on canvas, 24x36 inches",
    available: true
  },
  {
    id: 2,
    title: "Abstract Forms",
    image: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
    price: 650,
    category: "Mixed Media",
    description: "Mixed media on paper, 18x24 inches",
    available: true
  },
  {
    id: 3,
    title: "Mountain Vista",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    price: 450,
    category: "Digital Art",
    description: "Digital print on archival paper, 16x20 inches",
    available: true
  },
  {
    id: 4,
    title: "Night Sky",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
    price: 1200,
    category: "Paintings",
    description: "Oil on canvas, 30x40 inches",
    available: true
  },
  {
    id: 5,
    title: "Geometric Patterns",
    image: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e",
    price: 550,
    category: "Digital Art",
    description: "Digital art, limited edition print",
    available: false
  }
];

const ForSale = () => {
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const handleInquire = (artwork: ArtworkForSale) => {
    toast({
      title: "Inquiry Sent",
      description: `We'll contact you about "${artwork.title}" soon.`,
    });
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div>
        <h1 className="text-3xl font-bold mb-2">Artwork For Sale</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Browse available original artworks and prints. Contact via email for purchase inquiries or custom commissions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {artworksForSale.map((artwork) => (
          <div key={artwork.id} className="flex flex-col border rounded-lg overflow-hidden">
            <div className="relative">
              <img 
                src={artwork.image} 
                alt={artwork.title} 
                className="w-full h-64 object-cover"
              />
              {!artwork.available && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <Badge className="text-lg py-1.5 px-3">Sold</Badge>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-1">{artwork.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{artwork.category}</p>
              <p className="mb-3">{artwork.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <p className="text-lg font-medium">{formatPrice(artwork.price)}</p>
                <Button 
                  onClick={() => handleInquire(artwork)} 
                  disabled={!artwork.available}
                  className="hover-scale"
                >
                  {artwork.available ? "Inquire" : "Sold"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Commission Information</h2>
        <p className="mb-4">
          I'm available for custom artwork commissions. Please contact me with your ideas and requirements.
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Process:</h3>
            <p className="text-sm text-muted-foreground">Initial consultation, concept sketches, final artwork creation</p>
          </div>
          <div>
            <h3 className="font-medium">Timeline:</h3>
            <p className="text-sm text-muted-foreground">2-4 weeks depending on size and complexity</p>
          </div>
          <div>
            <h3 className="font-medium">Pricing:</h3>
            <p className="text-sm text-muted-foreground">Starting at $500, varies based on size and materials</p>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="hover-scale">
            <a href="mailto:artist@example.com">Request Commission</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForSale;
