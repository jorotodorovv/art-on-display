
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageToggle";
import { useArtworks } from "@/contexts/ArtworkContext";
import { ArtworkForSale } from "@/contexts/ArtworkContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { DollarSign, Mail } from "lucide-react";
import { getContentById, saveContent } from "@/services/contentService";
import EditableContent from "@/components/admin/EditableContent";
import { useAuth } from "@/contexts/AuthContext";

// Default content
const defaultContent = {
  "for-sale-heading": {
    en: "Artwork For Sale",
    bg: "Творби за Продажба"
  },
  "for-sale-description": {
    en: "Browse available original artworks and prints. Contact via email for purchase inquiries or custom commissions.",
    bg: "Разгледайте налични оригинални творби и принтове. Свържете се чрез имейл за въпроси за покупка или поръчки."
  }
};

const ForSale = () => {
  const { language } = useLanguage();
  const { artworksForSale } = useArtworks();
  const { isAdmin } = useAuth();
  const [content, setContent] = useState(defaultContent);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const loadedContent = { ...defaultContent };
      
      // Try to load each content piece
      for (const key of Object.keys(defaultContent)) {
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
    try {
      const result = await saveContent(id, newContent);
      
      if (result) {
        // Update local state
        setContent(prev => ({
          ...prev,
          [id]: newContent
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error updating content:", error);
      return false;
    }
  };

  const handleContactClick = (artwork: ArtworkForSale) => {
    // Get title based on current language
    const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
    
    // Format email with subject and body
    const subject = encodeURIComponent(`Interest in "${title}"`);
    const body = encodeURIComponent(`I'm interested in the artwork: "${title}" (ID: ${artwork.id})\n\nPlease provide more information about this piece.`);
    
    // Open email client
    window.location.href = `mailto:artist@example.com?subject=${subject}&body=${body}`;
    
    toast.info(language === 'en' ? "Opening email client..." : "Отваряне на имейл клиент...");
  };

  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="max-w-2xl mx-auto text-center">
        <EditableContent
          id="for-sale-heading"
          content={content["for-sale-heading"]}
          type="heading"
          onUpdate={(newContent) => handleContentUpdate("for-sale-heading", newContent)}
          className="text-3xl font-bold mb-4"
        />
        <EditableContent
          id="for-sale-description"
          content={content["for-sale-description"]}
          type="paragraph"
          onUpdate={(newContent) => handleContentUpdate("for-sale-description", newContent)}
          className="text-muted-foreground"
        />
      </div>

      {artworksForSale.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === "en" 
              ? "No artworks currently for sale." 
              : "В момента няма творби за продажба."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {artworksForSale.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={artwork.image} 
                  alt={language === 'en' ? artwork.title : (artwork.title_bg || artwork.title)} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'en' ? artwork.title : (artwork.title_bg || artwork.title)}
                </h3>
                
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="secondary" className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {artwork.price.toLocaleString()} USD
                  </Badge>
                  
                  <Button size="sm" onClick={() => handleContactClick(artwork)}>
                    <Mail className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Inquire' : 'Запитване'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForSale;
