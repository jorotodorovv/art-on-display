
import { useState, useEffect } from "react";
import EditableText from "@/components/ui/EditableText";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const [loaded, setLoaded] = useState(false);
  const { setCurrentPage } = useLanguage();
  
  useEffect(() => {
    setLoaded(true);
    setCurrentPage('about');
  }, [setCurrentPage]);
  
  return (
    <div className={`max-w-6xl mx-auto ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <EditableText
        contentKey="about_title"
        defaultText="About the Artist"
        as="h1"
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
          <EditableText
            contentKey="artist_name_about"
            defaultText="ArtistName"
            as="h2"
            className="text-xl font-semibold"
          />
          <EditableText
            contentKey="artist_short_bio"
            defaultText="Contemporary artist based in New York, working primarily with acrylics and mixed media."
            as="p"
            className="text-muted-foreground"
          />
          <EditableText
            contentKey="artist_bio_1"
            defaultText="With over 10 years of experience, my work explores themes of nature, urban environments, and the intersection between technology and traditional art forms."
            as="p"
          />
          <EditableText
            contentKey="artist_bio_2"
            defaultText="My work investigates the juxtaposition between the natural world and human-made environments. Through a combination of traditional painting techniques and digital processes, I create pieces that invite viewers to reconsider their relationship with their surroundings."
            as="p"
          />
          <EditableText
            contentKey="artist_bio_3"
            defaultText="I'm particularly interested in how light, color, and texture can evoke emotional responses and create immersive experiences. Each piece begins with observations from my daily life, transformed through an iterative process of abstraction and refinement."
            as="p"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
