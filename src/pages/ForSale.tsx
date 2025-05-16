
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useArtworks } from "@/contexts/ArtworkContext";
import { useLanguage } from "@/components/LanguageToggle";
import EditableContent from "@/components/admin/EditableContent";
import { getContentById, saveContent } from "@/services/contentService";

const ForSale = () => {
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  const { artworksForSale, isLoading } = useArtworks();
  const { language } = useLanguage();
  const [content, setContent] = useState({
    "for-sale-heading": {
      en: "Artwork For Sale",
      bg: "Творби за Продажба"
    },
    "for-sale-description": {
      en: "Browse available original artworks and prints. Contact via email for purchase inquiries or custom commissions.",
      bg: "Разгледайте налични оригинални творби и принтове. Свържете се чрез имейл за въпроси за покупка или поръчки."
    }
  });
  
  useEffect(() => {
    setLoaded(!isLoading);
    loadContent();
  }, [isLoading]);
  
  const loadContent = async () => {
    try {
      const loadedContent = { ...content };
      
      // Try to load each content piece
      for (const key of Object.keys(content)) {
        const data = await getContentById(key);
        if (data) {
          loadedContent[key] = data;
        }
      }
      
      setContent(loadedContent);
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };
  
  const handleContentUpdate = async (id: string, newContent: { en: string; bg: string }) => {
    const result = await saveContent(id, newContent);
    
    if (result) {
      // Update local state
      setContent(prev => ({
        ...prev,
        [id]: newContent
      }));
    }
    
    return result;
  };
  
  const handleInquire = (title: string) => {
    toast({
      title: language === "en" ? "Inquiry Sent" : "Запитването е изпратено",
      description: (language === "en" ? "We'll contact you about \"" : "Ще се свържем с вас относно \"") + title + "\" soon.",
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
        <EditableContent
          id="for-sale-heading"
          content={content["for-sale-heading"]}
          type="heading"
          onUpdate={(newContent) => handleContentUpdate("for-sale-heading", newContent)}
          className="text-3xl font-bold mb-2"
        />
        <EditableContent
          id="for-sale-description"
          content={content["for-sale-description"]}
          type="paragraph"
          onUpdate={(newContent) => handleContentUpdate("for-sale-description", newContent)}
          className="text-muted-foreground mb-6 max-w-2xl"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {artworksForSale.map((artwork) => {
          // Get appropriate title and description based on language
          const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
          const description = language === 'en' ? artwork.description : (artwork.description_bg || artwork.description);
          
          return (
            <div key={artwork.id} className="flex flex-col border rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={artwork.image} 
                  alt={title} 
                  className="w-full h-64 object-cover"
                />
                {!artwork.forSale && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Badge className="text-lg py-1.5 px-3">{language === "en" ? "Sold" : "Продадено"}</Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-1">{title}</h3>
                <p className="mb-3">{description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <p className="text-lg font-medium">{formatPrice(artwork.price || 0)}</p>
                  <Button 
                    onClick={() => handleInquire(title)} 
                    disabled={!artwork.forSale}
                    className="hover-scale"
                  >
                    {artwork.forSale ? (language === "en" ? "Inquire" : "Запитване") : (language === "en" ? "Sold" : "Продадено")}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {artworksForSale.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No artworks currently for sale.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{language === "en" ? "Commission Information" : "Информация за Поръчки"}</h2>
        <p className="mb-4">
          {language === "en" ? "I'm available for custom artwork commissions. Please contact me with your ideas and requirements." : "Приемам поръчки за персонализирани творби. Моля, свържете се с мен с вашите идеи и изисквания."}
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">{language === "en" ? "Process:" : "Процес:"}</h3>
            <p className="text-sm text-muted-foreground">{language === "en" ? "Initial consultation, concept sketches, final artwork creation" : "Първоначална консултация, концептуални скици, създаване на финална творба"}</p>
          </div>
          <div>
            <h3 className="font-medium">{language === "en" ? "Timeline:" : "Време:"}</h3>
            <p className="text-sm text-muted-foreground">{language === "en" ? "2-4 weeks depending on size and complexity" : "2-4 седмици в зависимост от размера и сложността"}</p>
          </div>
          <div>
            <h3 className="font-medium">{language === "en" ? "Pricing:" : "Цени:"}</h3>
            <p className="text-sm text-muted-foreground">{language === "en" ? "Starting at $500, varies based on size and materials" : "Започват от $500, варират според размера и материалите"}</p>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="hover-scale">
            <a href="mailto:artist@example.com">{language === "en" ? "Request Commission" : "Заявка за Поръчка"}</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForSale;
