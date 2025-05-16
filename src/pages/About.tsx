
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageToggle";
import EditableContent from "@/components/admin/EditableContent";
import { getContentById, saveContent } from "@/services/contentService";

const About = () => {
  const [loaded, setLoaded] = useState(false);
  const { language } = useLanguage();
  const [content, setContent] = useState({
    "about-heading": {
      en: "About the Artist",
      bg: "За Художника"
    },
    "about-bio": {
      en: "Contemporary artist based in New York, working primarily with acrylics and mixed media.",
      bg: "Съвременен художник, базиран в Ню Йорк, работещ основно с акрил и смесени техники."
    },
    "about-paragraph-1": {
      en: "With over 10 years of experience, my work explores themes of nature, urban environments, and the intersection between technology and traditional art forms.",
      bg: "С над 10 години опит, моята работа изследва теми за природата, градската среда и пресечната точка между технологиите и традиционните форми на изкуство."
    },
    "about-paragraph-2": {
      en: "My work investigates the juxtaposition between the natural world and human-made environments. Through a combination of traditional painting techniques and digital processes, I create pieces that invite viewers to reconsider their relationship with their surroundings.",
      bg: "Моята работа изследва съпоставянето между природния свят и създадената от човека среда. Чрез комбинация от традиционни живописни техники и дигитални процеси, създавам произведения, които приканват зрителите да преосмислят връзката си с околната среда."
    },
    "about-paragraph-3": {
      en: "I'm particularly interested in how light, color, and texture can evoke emotional responses and create immersive experiences. Each piece begins with observations from my daily life, transformed through an iterative process of abstraction and refinement.",
      bg: "Особено се интересувам от това как светлината, цветът и текстурата могат да предизвикат емоционални реакции и да създадат завладяващи преживявания. Всяко произведение започва с наблюдения от ежедневието ми, трансформирани чрез итеративен процес на абстракция и усъвършенстване."
    }
  });
  
  useEffect(() => {
    setLoaded(true);
    loadContent();
  }, []);
  
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
  
  return (
    <div className={`max-w-6xl mx-auto ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <EditableContent 
        id="about-heading"
        content={content["about-heading"]}
        type="heading"
        onUpdate={(newContent) => handleContentUpdate("about-heading", newContent)}
        className="text-3xl font-bold mb-6"
      />
      
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <div className="aspect-square rounded-md overflow-hidden image-hover">
            <img 
              src="https://placehold.co/800" 
              alt="Artist portrait" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold">ArtistName</h2>
          
          <EditableContent
            id="about-bio"
            content={content["about-bio"]}
            type="paragraph"
            onUpdate={(newContent) => handleContentUpdate("about-bio", newContent)}
            className="text-muted-foreground"
          />
          
          <EditableContent
            id="about-paragraph-1"
            content={content["about-paragraph-1"]}
            type="paragraph"
            onUpdate={(newContent) => handleContentUpdate("about-paragraph-1", newContent)}
          />
          
          <EditableContent
            id="about-paragraph-2"
            content={content["about-paragraph-2"]}
            type="paragraph"
            onUpdate={(newContent) => handleContentUpdate("about-paragraph-2", newContent)}
          />
          
          <EditableContent
            id="about-paragraph-3"
            content={content["about-paragraph-3"]}
            type="paragraph"
            onUpdate={(newContent) => handleContentUpdate("about-paragraph-3", newContent)}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
