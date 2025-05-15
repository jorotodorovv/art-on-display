
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useArtworks } from "@/contexts/ArtworkContext";
import { useLanguage } from "@/components/LanguageToggle";

const translations = {
  en: {
    title: "Artwork For Sale",
    description: "Browse available original artworks and prints. Contact via email for purchase inquiries or custom commissions.",
    inquirySent: "Inquiry Sent",
    inquiryDescription: "We'll contact you about \"{title}\" soon.",
    sold: "Sold",
    inquire: "Inquire",
    commissionsTitle: "Commission Information",
    commissionsDescription: "I'm available for custom artwork commissions. Please contact me with your ideas and requirements.",
    process: "Process:",
    processDetails: "Initial consultation, concept sketches, final artwork creation",
    timeline: "Timeline:",
    timelineDetails: "2-4 weeks depending on size and complexity",
    pricing: "Pricing:",
    pricingDetails: "Starting at $500, varies based on size and materials",
    requestCommission: "Request Commission"
  },
  bg: {
    title: "Obras en Venta",
    description: "Explore obras originales y impresiones disponibles. Contacte por email para consultas de compra o comisiones personalizadas.",
    inquirySent: "Consulta Enviada",
    inquiryDescription: "Te contactaremos sobre \"{title}\" pronto.",
    sold: "Vendido",
    inquire: "Consultar",
    commissionsTitle: "Información de Comisiones",
    commissionsDescription: "Estoy disponible para comisiones de obras personalizadas. Contáctame con tus ideas y requisitos.",
    process: "Proceso:",
    processDetails: "Consulta inicial, bocetos conceptuales, creación de obra final",
    timeline: "Tiempo:",
    timelineDetails: "2-4 semanas dependiendo del tamaño y complejidad",
    pricing: "Precios:",
    pricingDetails: "Desde $500, varía según tamaño y materiales",
    requestCommission: "Solicitar Comisión"
  }
};

const ForSale = () => {
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  const { artworksForSale, isLoading } = useArtworks();
  const { language } = useLanguage();
  const t = translations[language];
  
  useEffect(() => {
    setLoaded(!isLoading);
  }, [isLoading]);
  
  const handleInquire = (title: string) => {
    toast({
      title: t.inquirySent,
      description: t.inquiryDescription.replace("{title}", title),
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
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          {t.description}
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
                  <Badge className="text-lg py-1.5 px-3">{t.sold}</Badge>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-1">{artwork.title}</h3>
              <p className="mb-3">{artwork.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <p className="text-lg font-medium">{formatPrice(artwork.price)}</p>
                <Button 
                  onClick={() => handleInquire(artwork.title)} 
                  disabled={!artwork.available}
                  className="hover-scale"
                >
                  {artwork.available ? t.inquire : t.sold}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {artworksForSale.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No artworks currently for sale.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{t.commissionsTitle}</h2>
        <p className="mb-4">
          {t.commissionsDescription}
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">{t.process}</h3>
            <p className="text-sm text-muted-foreground">{t.processDetails}</p>
          </div>
          <div>
            <h3 className="font-medium">{t.timeline}</h3>
            <p className="text-sm text-muted-foreground">{t.timelineDetails}</p>
          </div>
          <div>
            <h3 className="font-medium">{t.pricing}</h3>
            <p className="text-sm text-muted-foreground">{t.pricingDetails}</p>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="hover-scale">
            <a href="mailto:artist@example.com">{t.requestCommission}</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForSale;
