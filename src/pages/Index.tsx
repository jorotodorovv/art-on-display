
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/LanguageToggle";
import EditableContent from "@/components/admin/EditableContent";
import { getContentById, saveContent } from "@/services/contentService";
import { toast } from "@/components/ui/sonner";

// Default content if none exists in the database
const defaultContent = {
  "home-heading": {
    en: "Contemporary Art by ArtistName",
    bg: "Съвременно Изкуство от ArtistName"
  },
  "home-subheading": {
    en: "Exploring the boundary between abstract and figurative art through diverse media and techniques.",
    bg: "Изследване на границата между абстрактното и фигуративното изкуство чрез разнообразни медии и техники."
  }
};

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const { language } = useLanguage();
  
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
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <section className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6">
          <EditableContent
            id="home-heading"
            content={content["home-heading"]}
            type="heading"
            onUpdate={(newContent) => handleContentUpdate("home-heading", newContent)}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          />
          <EditableContent
            id="home-subheading"
            content={content["home-subheading"]}
            type="paragraph"
            onUpdate={(newContent) => handleContentUpdate("home-subheading", newContent)}
            className="text-lg text-muted-foreground"
          />
          <div className="flex flex-wrap gap-4">
            <Button asChild className="hover-scale">
              <Link to="/gallery">
                {language === "en" ? "Browse Gallery" : "Разгледай Галерията"}
              </Link>
            </Button>
            <Button variant="outline" asChild className="hover-scale">
              <Link to="/about">
                {language === "en" ? "About the Artist" : "За Художника"}
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="aspect-square bg-muted rounded-md overflow-hidden image-hover">
            <img 
              src="https://placehold.co/1000" 
              alt={language === "en" ? "Featured artwork" : "Избрана творба"} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {language === "en" ? "Featured Works" : "Избрани Творби"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: language === "en" ? "Tranquil Waters" : "Спокойни Води",
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
              category: language === "en" ? "Paintings" : "Картини"
            },
            {
              id: 2,
              title: language === "en" ? "Mountain View" : "Планински Изглед",
              image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
              category: language === "en" ? "Digital Art" : "Дигитално Изкуство"
            },
            {
              id: 3,
              title: language === "en" ? "Urban Landscape" : "Градски Пейзаж",
              image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
              category: language === "en" ? "Photography" : "Фотография"
            }
          ].map((work) => (
            <Link 
              to="/gallery" 
              key={work.id} 
              className="group block"
            >
              <div className="rounded-md overflow-hidden image-hover">
                <img 
                  src={work.image} 
                  alt={work.title} 
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-medium">{work.title}</h3>
                <p className="text-sm text-muted-foreground">{work.category}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild className="hover-scale">
            <Link to="/gallery">
              {language === "en" ? "View All Works" : "Виж Всички Творби"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
